import { isAbsolute, relative, sep } from "node:path";

/** Optional capabilities. Everything not requested is left out of the product. */
export const modules = {
	ai: {
		description:
			"IA server-only (AI SDK + OpenRouter) e padrões de interface de IA",
		paths: [
			"src/ai/",
			"src/design-system/patterns/ai-interface.tsx",
			"src/design-system/patterns/evidence-excerpt.tsx",
			"tests/unit/ai/",
			"tests/component/ai-interface.test.tsx",
		],
		dependencies: ["ai", "@openrouter/ai-sdk-provider"],
	},
	dataviz: {
		description: "Gráficos acessíveis (barras, linha, sparkline, legenda)",
		paths: ["src/design-system/dataviz/", "tests/component/dataviz.test.tsx"],
		dependencies: [],
	},
} as const;

export type ModuleName = keyof typeof modules;

/** Files that only make sense inside Genesis Base itself. */
export const baseOnly = ["scripts/new/", "tests/unit/new.test.ts"];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface Options {
	name: string;
	slug: string;
	dir: string;
	with: ModuleName[];
	dryRun: boolean;
	e2e: boolean;
}

export function parseArgs(args: readonly string[]): Options {
	const values = new Map<string, string>();
	const flags = new Set<string>();
	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (arg === "--dry-run" || arg === "--e2e") {
			flags.add(arg);
			continue;
		}
		if (!["--name", "--slug", "--dir", "--with"].includes(arg))
			throw new Error(`Opção desconhecida: ${arg}`);
		const value = args[++index];
		if (values.has(arg) || !value || value.startsWith("--"))
			throw new Error(`Informe um valor único para ${arg}.`);
		values.set(arg, value);
	}
	const name = values.get("--name")?.trim();
	const slug = values.get("--slug");
	const dir = values.get("--dir");
	if (!name || /[\r\n\u2028\u2029"`\\]/u.test(name))
		throw new Error("Informe --name em uma única linha, sem aspas.");
	if (!slug || slug.length > 214 || !slugPattern.test(slug))
		throw new Error("Informe --slug em kebab-case.");
	if (!dir || !isAbsolute(dir)) throw new Error("--dir deve ser absoluto.");
	const requested = (values.get("--with") ?? "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
	for (const item of requested)
		if (!Object.hasOwn(modules, item))
			throw new Error(
				`Módulo desconhecido: ${item}. Disponíveis: ${Object.keys(modules).join(", ")}.`,
			);
	return {
		name,
		slug,
		dir,
		with: [...new Set(requested)] as ModuleName[],
		dryRun: flags.has("--dry-run"),
		e2e: flags.has("--e2e"),
	};
}

const matches = (path: string, entry: string) =>
	entry.endsWith("/") ? path.startsWith(entry) : path === entry;

export function createPlan(input: {
	tracked: readonly string[];
	with: readonly ModuleName[];
	base: string;
	target: string;
	targetEmpty: boolean;
	dirty: boolean;
}) {
	if (input.dirty)
		throw new Error("A Genesis Base deve estar limpa (git status).");
	if (!input.targetEmpty)
		throw new Error("O destino deve estar ausente ou vazio.");
	const rel = relative(input.base, input.target);
	if (!rel || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel)))
		throw new Error("O destino deve ficar fora da Genesis Base.");

	const omitted = (Object.keys(modules) as ModuleName[]).filter(
		(name) => !input.with.includes(name),
	);
	const excluded = [
		...baseOnly,
		...omitted.flatMap((name) => modules[name].paths),
	];
	const removedDependencies = omitted.flatMap(
		(name) => modules[name].dependencies,
	);
	return {
		copy: input.tracked.filter(
			(path) => !excluded.some((entry) => matches(path, entry)),
		),
		omittedModules: omitted,
		removedDependencies,
	};
}

/** Product package.json: own name, no generator script, no omitted dependencies. */
export function productPackage(
	source: string,
	slug: string,
	removed: readonly string[],
) {
	const pkg = JSON.parse(source);
	pkg.name = slug;
	delete pkg.scripts?.new;
	for (const dependency of removed) {
		delete pkg.dependencies?.[dependency];
		delete pkg.devDependencies?.[dependency];
	}
	return `${JSON.stringify(pkg, null, "\t")}\n`;
}
