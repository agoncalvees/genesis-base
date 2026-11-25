import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { expect, test } from "vitest";

// ADR 0002: allowed direction routes -> features -> {layouts, design-system, ai, evidence, integrations} -> core.
const RULES: Record<string, string[]> = {
	"src/core": [
		"features",
		"ai",
		"integrations",
		"studio",
		"design-system",
		"layouts",
		"evidence",
		"routes",
	],
	"src/design-system": ["features", "ai", "integrations", "studio", "routes"],
};

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return sourceFiles(path);
		return /\.(ts|tsx)$/.test(name) ? [path] : [];
	});
}

const IMPORT =
	/(?:import|export)[^"']*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

for (const [layer, forbidden] of Object.entries(RULES)) {
	test(`${layer} does not import ${forbidden.join(", ")}`, () => {
		const violations: string[] = [];
		for (const file of sourceFiles(layer)) {
			for (const match of readFileSync(file, "utf8").matchAll(IMPORT)) {
				const spec = match[1] ?? match[2] ?? "";
				const hit = forbidden.find(
					(dir) =>
						new RegExp(`(^|[/@#])(src/)?${dir}(/|$)`).test(
							spec.replace(/^[@#]\//, ""),
						) || spec.includes(`/${dir}/`),
				);
				if (hit) violations.push(`${relative(".", file)} -> ${spec}`);
			}
		}
		expect(violations).toEqual([]);
	});
}
