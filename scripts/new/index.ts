/**
 * bun run new -- --name "Nome" --slug nome --dir /abs/nome [--with ai,dataviz] [--e2e] [--dry-run]
 *
 * Copies the tracked files of Genesis Base into a fresh repository (own Git
 * history), leaves out optional modules that were not requested and the
 * generator itself, installs, validates and makes the first local commit.
 */
import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	createPlan,
	type ModuleName,
	modules,
	parseArgs,
	productPackage,
} from "./plan";

const base = fileURLToPath(new URL("../..", import.meta.url));

function run(command: string, args: string[], cwd: string, quiet = false) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: "utf8",
		stdio: quiet ? "pipe" : "inherit",
		env: { ...process.env, FORCE_COLOR: "0" },
	});
	if (result.status !== 0) {
		const output = quiet ? `\n${result.stdout}${result.stderr}` : "";
		throw new Error(
			`${command} ${args.join(" ")} falhou (${result.status}).${output}`,
		);
	}
	return result.stdout ?? "";
}

const git = (args: string[], cwd = base) => run("git", args, cwd, true).trim();

function productReadme(
	name: string,
	sha: string,
	enabled: readonly ModuleName[],
) {
	return `# ${name}

Criado a partir da Genesis Base \`${sha.slice(0, 7)}\`. Módulos: ${enabled.length ? enabled.join(", ") : "nenhum"}.

## Comece aqui
1. Leia [AGENTS.md](AGENTS.md). Para um tema novo, siga o [protocolo de direção artística](docs/design/CREATIVE-DIRECTION.md).
2. Preencha \`docs/product/CHALLENGE.md\` e \`PRODUCT-BRIEF.md\`, escreva \`design/DESIGN.md\` (modelo: \`docs/design/DESIGN-TEMPLATE.md\`; exemplo completo: \`design/examples/aceiro/\`) e \`design/fidelity.json\`.
3. \`bun run design:build\`, implemente a tela principal e valide com \`bun run design:verify\`.

## Scripts
Bun 1.4.5 e Node 24.
- \`bun run dev\` — http://127.0.0.1:3000
- \`bun run check\`, \`typecheck\`, \`test\`, \`test:e2e\`, \`build\` (Vercel), \`build:local\` + \`serve\` (Node)
- \`bun run design:lint|build|check|verify\`
`;
}

const status = (name: string) => `# Status — ${name}

## Fase 0
Produto criado. Próximo passo: protocolo de direção artística (passos 1–6) antes de implementar.
`;

function provenance(input: {
	sha: string;
	name: string;
	enabled: readonly ModuleName[];
	omitted: readonly ModuleName[];
	results: string[];
}) {
	return `# Proveniência

- Origem: Genesis Base, commit \`${input.sha}\`.
- Criado em: ${new Date().toISOString()} com \`bun run new\`.
- Nome: ${input.name}.
- Módulos incluídos: ${input.enabled.join(", ") || "nenhum"}. Omitidos: ${input.omitted.join(", ") || "nenhum"}.
- Histórico Git novo; nenhum remoto configurado.
- O reaproveitamento em competições depende do regulamento do evento.

## Validação na criação
${input.results.map((line) => `- ${line}`).join("\n")}

## Dependências e recursos de terceiros adicionados no produto
Registre aqui pacote, versão, licença e motivo.
`;
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const target = resolve(options.dir);
	const tracked = git(["ls-files", "-z"]).split("\0").filter(Boolean);
	const dirty = git(["status", "--porcelain", "--untracked-files=no"]) !== "";
	const targetEmpty = !existsSync(target) || readdirSync(target).length === 0;
	const plan = createPlan({
		tracked,
		with: options.with,
		base,
		target,
		targetEmpty,
		dirty,
	});
	const sha = git(["rev-parse", "HEAD"]);

	console.log(`Genesis Base ${sha.slice(0, 7)} → ${target}`);
	console.log(
		`Módulos: ${options.with.join(", ") || "nenhum"} (disponíveis: ${Object.entries(
			modules,
		)
			.map(([key, value]) => `${key} — ${value.description}`)
			.join("; ")})`,
	);
	console.log(
		`${plan.copy.length} arquivos; dependências removidas: ${plan.removedDependencies.join(", ") || "nenhuma"}.`,
	);
	if (options.dryRun) return;

	for (const path of plan.copy) {
		const destination = join(target, path);
		mkdirSync(dirname(destination), { recursive: true });
		copyFileSync(join(base, path), destination);
	}
	writeFileSync(
		join(target, "package.json"),
		productPackage(
			readFileSync(join(base, "package.json"), "utf8"),
			options.slug,
			plan.removedDependencies,
		),
	);
	writeFileSync(
		join(target, "src/core/app-config.ts"),
		`export const appConfig = {\n\tname: ${JSON.stringify(options.name)},\n};\n`,
	);
	writeFileSync(
		join(target, "README.md"),
		productReadme(options.name, sha, options.with),
	);
	writeFileSync(join(target, "docs/STATUS.md"), status(options.name));
	if (!options.with.includes("ai"))
		writeFileSync(
			join(target, ".env.example"),
			"# Variáveis locais do produto. Segredos nunca com prefixo VITE_.\n",
		);

	const results: string[] = [];
	const step = (label: string, args: string[]) => {
		run("bun", args, target);
		results.push(`\`${label}\`: 0`);
	};
	step(
		plan.removedDependencies.length
			? "bun install"
			: "bun install --frozen-lockfile",
		plan.removedDependencies.length
			? ["install"]
			: ["install", "--frozen-lockfile"],
	);
	step("bun run design:build", ["run", "design:build"]);
	step("bun run check", ["run", "check"]);
	step("bun run typecheck", ["run", "typecheck"]);
	step("bun run design:check", ["run", "design:check"]);
	step("bun run test", ["run", "test"]);
	if (options.e2e) step("bun run test:e2e", ["run", "test:e2e"]);

	writeFileSync(
		join(target, "PROVENANCE.md"),
		provenance({
			sha,
			name: options.name,
			enabled: options.with,
			omitted: plan.omittedModules,
			results,
		}),
	);
	git(["init", "-q", "-b", "main"], target);
	git(["add", "-A"], target);
	git(
		[
			"commit",
			"-q",
			"-m",
			`Initialize ${options.name} from Genesis Base ${sha.slice(0, 7)}`,
		],
		target,
	);
	console.log(`Produto criado em ${target} (commit local, sem remoto).`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
