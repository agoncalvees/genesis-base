import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { diffDesign } from "./adapter";
import {
	checkDrift,
	loadDesign,
	missingFontPackages,
	productPath,
	renderFiles,
	safeId,
	worldPaths,
} from "./generate";

/** DESIGN.md files are small text; anything larger is rejected (REVIEW-P09 OC03-01). */
export const MAX_IMPORT_BYTES = 1024 * 1024;

/** Reads a response body as a stream, aborting once it exceeds `limit` bytes. */
export async function readCapped(
	response: Response,
	limit: number,
): Promise<string> {
	const declared = Number(response.headers.get("content-length"));
	if (Number.isFinite(declared) && declared > limit)
		throw new Error(`Importação excede ${limit} bytes.`);
	if (!response.body) return "";
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > limit) {
			await reader.cancel();
			throw new Error(`Importação excede ${limit} bytes.`);
		}
		chunks.push(value);
	}
	return new TextDecoder().decode(Buffer.concat(chunks));
}

function needed(value: string | undefined, usage: string) {
	if (!value) throw new Error(usage);
	return value;
}

function id(value: string) {
	if (!safeId.test(value)) throw new Error(`Identificador inválido: ${value}`);
	return value;
}

function report(source: string) {
	for (const finding of loadDesign(source).findings) {
		console.log(`[${finding.severity}] ${finding.message}`);
	}
	console.log("Contrato Genesis validado, incluindo contraste e fontes.");
}

function requireFonts(source: string) {
	const missing = missingFontPackages(loadDesign(source).identity);
	if (missing.length)
		throw new Error(
			`Fontes do DESIGN.md não instaladas. Rode: bun add ${missing.join(" ")}`,
		);
}

function writeAtomically(path: string, source: string) {
	const folder = dirname(path);
	mkdirSync(folder, { recursive: true });
	const temporary = mkdtempSync(join(folder, ".design-"));
	try {
		const file = join(temporary, "output");
		writeFileSync(file, source);
		renameSync(file, path);
	} finally {
		rmSync(temporary, { recursive: true, force: true });
	}
}

async function importDesign(input: string, name?: string) {
	const remote = /^https?:\/\//i.test(input);
	const url = remote ? new URL(input) : undefined;
	const inferred = (url?.pathname ?? input)
		.split("/")
		.filter(Boolean)
		.at(-1)
		?.replace(/\.md$/i, "")
		.toLowerCase();
	const folder = join(
		"design/imports",
		id(needed(name ?? inferred, "Informe um nome para a importação.")),
	);
	const path = join(folder, "DESIGN.md");
	let source: string;
	if (url) {
		const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
		if (!response.ok)
			throw new Error(`Importação HTTP falhou: ${response.status}`);
		source = await readCapped(response, MAX_IMPORT_BYTES);
	} else {
		if (statSync(input).size > MAX_IMPORT_BYTES)
			throw new Error(`Importação excede ${MAX_IMPORT_BYTES} bytes.`);
		source = readFileSync(input, "utf8");
	}
	mkdirSync(folder, { recursive: true });
	writeFileSync(path, source, { flag: "wx" });
	console.log(`Referência copiada para ${path}.`);
	report(source);
}

async function run([command, first, second]: string[]) {
	switch (command) {
		case "lint":
			for (const path of first
				? [first]
				: [productPath, ...worldPaths().map(({ path }) => path)]) {
				console.log(path);
				report(readFileSync(path, "utf8"));
			}
			return;
		case "build":
			requireFonts(readFileSync(productPath, "utf8"));
			for (const [path, css] of Object.entries(renderFiles()))
				writeAtomically(path, css);
			return;
		case "check":
			checkDrift(renderFiles());
			return;
		case "diff": {
			const comparison = diffDesign(
				needed(first, "design:diff <a> <b>"),
				needed(second, "design:diff <a> <b>"),
			);
			process.stdout.write(comparison.output);
			const beforeDesign = loadDesign(readFileSync(first, "utf8")).identity;
			const afterDesign = loadDesign(readFileSync(second, "utf8")).identity;
			for (const mode of ["light", "dark"] as const) {
				const before = beforeDesign[mode] ?? {};
				const after = afterDesign[mode] ?? {};
				for (const key of new Set([
					...Object.keys(before),
					...Object.keys(after),
				])) {
					if (before[key] !== after[key])
						console.log(
							`${mode} --${key}: ${before[key] ?? "∅"} → ${after[key] ?? "∅"}`,
						);
				}
			}
			if (comparison.regression) process.exitCode = 1;
			return;
		}
		case "import":
			await importDesign(
				needed(first, "design:import <arquivo|url> [nome]"),
				second,
			);
			return;
		case "apply": {
			const ref = needed(first, "design:apply <import/nome|example/nome>");
			const [group, name] = ref.startsWith("import/")
				? ["imports", ref.slice(7)]
				: ref.startsWith("example/")
					? ["examples", ref.slice(8)]
					: ["worlds", ref];
			const source = readFileSync(
				join("design", group, id(name), "DESIGN.md"),
				"utf8",
			);
			requireFonts(source);
			const files = renderFiles(source);
			writeAtomically(productPath, source);
			for (const [path, css] of Object.entries(files))
				writeAtomically(path, css);
			return;
		}
		default:
			throw new Error("Comandos: lint | build | check | diff | import | apply");
	}
}

if (import.meta.main) {
	try {
		await run(process.argv.slice(2));
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	}
}
