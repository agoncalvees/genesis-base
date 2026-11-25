import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
	lint,
	serializeTailwindV4,
	TailwindV4EmitterHandler,
} from "@google/design.md/linter";

export function parseDesign(source: string) {
	const report = lint(source);
	if (!report.designSystem.name && !report.designSystem.colors.size) {
		throw new Error(
			report.findings[0]?.message ?? "Missing DESIGN.md front matter",
		);
	}
	const errors = report.findings.filter(({ severity }) => severity === "error");
	if (errors.length) {
		throw new Error(
			errors
				.map(({ path, message }) => [path, message].filter(Boolean).join(": "))
				.join("\n"),
		);
	}
	return report;
}

export function exportTailwind(report: ReturnType<typeof parseDesign>) {
	const result = new TailwindV4EmitterHandler().execute(report.designSystem);
	if (!result.success) throw new Error(result.error.message);
	return serializeTailwindV4(result.data.theme);
}

export function diffDesign(before: string, after: string) {
	const result = spawnSync(
		process.execPath,
		[
			fileURLToPath(import.meta.resolve("@google/design.md")),
			"diff",
			before,
			after,
		],
		{ encoding: "utf8" },
	);
	if (result.error) throw result.error;
	if (result.status !== 0 && result.status !== 1)
		throw new Error(result.stderr.trim() || "Google design diff failed");
	return { output: result.stdout, regression: result.status === 1 };
}

export function parseExtensionColors(colors: Record<string, string>) {
	// A JSON flow mapping is valid YAML. Use Google's color resolver for extensions too.
	return parseDesign(`---\ncolors: ${JSON.stringify(colors)}\n---\n`)
		.designSystem.colors;
}
