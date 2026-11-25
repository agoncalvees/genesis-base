import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

import {
	loadDesign,
	productPath,
	worldPaths,
} from "../../../tools/design-engine/generate";
import { readGeneratedThemes } from "./generated-themes";

const CONSUMER_DIRS = [
	"src/design-system/primitives",
	"src/design-system/components",
	"src/design-system/patterns",
	"src/design-system/motion",
] as const;

const scopes = readGeneratedThemes();
const keys = Object.keys(
	loadDesign(readFileSync(productPath, "utf8")).identity.light,
);

test("generated CSS covers both modes of every world and the product", () => {
	const ids = ["product", ...worldPaths().map(({ name }) => name)];
	expect(new Set(scopes.keys())).toEqual(
		new Set(ids.flatMap((id) => [`${id}/light`, `${id}/dark`])),
	);
});

for (const [scope, tokens] of scopes) {
	test(`${scope} defines the complete visual contract`, () => {
		for (const key of keys) expect(tokens[key], `--${key}`).toBeTruthy();
	});
}

const SOURCE_FILE = /\.(ts|tsx|js|jsx|css)$/;
const COLOR_LITERAL =
	/#[0-9a-f]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(|\bokl(ch|ab)\s*\(/i;
const FONT_LITERAL = /\bfont-family\s*:|\bfontFamily\s*[:=]/i;

function sourceFiles(dir: string): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return SOURCE_FILE.test(entry.name) ? [path] : [];
	});
}

/** Comments may legitimately mention literals; only executable source counts. */
function stripComments(source: string): string {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

for (const dir of CONSUMER_DIRS) {
	const files = sourceFiles(dir);
	// Directories currently hold only .gitkeep while another worker writes them.
	test.skipIf(files.length === 0)(
		`${dir} contains no literal colors or fonts`,
		() => {
			const violations: string[] = [];

			for (const file of files) {
				const lines = stripComments(readFileSync(file, "utf8")).split("\n");
				for (const [index, line] of lines.entries()) {
					if (COLOR_LITERAL.test(line)) {
						violations.push(
							`${file}:${index + 1} literal color: ${line.trim()}`,
						);
					}
					if (FONT_LITERAL.test(line)) {
						violations.push(
							`${file}:${index + 1} literal font: ${line.trim()}`,
						);
					}
				}
			}

			expect(violations).toEqual([]);
		},
	);
}
