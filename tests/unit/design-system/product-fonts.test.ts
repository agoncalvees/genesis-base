import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
	loadDesign,
	missingFontPackages,
	renderProductFonts,
} from "../../../tools/design-engine/generate";

const fontsFor = (path: string) =>
	renderProductFonts(loadDesign(readFileSync(path, "utf8")).identity);

describe("product font loading follows the active DESIGN.md", () => {
	test("a system-font identity (neutral fixture) loads no font package", () => {
		const output = fontsFor("tests/fixtures/design-neutral.md");
		expect(output).not.toContain("@fontsource");
		expect(output).toContain("export {};");
	});

	test("an applied identity loads exactly its licensed font packages", () => {
		const output = fontsFor("design/examples/aceiro/DESIGN.md");
		expect(output).toContain('import "@fontsource/instrument-serif/400.css";');
		expect(output).toContain('import "@fontsource-variable/archivo/wdth.css";');
		expect(output).not.toContain("bricolage");
		expect(output).not.toContain("export {};");
	});

	test("reports registered font packages that are not installed", () => {
		const identity = loadDesign(
			readFileSync("design/examples/aceiro/DESIGN.md", "utf8"),
		).identity;
		expect(missingFontPackages(identity, "/nonexistent")).toEqual([
			"@fontsource-variable/archivo",
			"@fontsource-variable/jetbrains-mono",
			"@fontsource/instrument-serif",
		]);
		expect(
			missingFontPackages(
				loadDesign(readFileSync("tests/fixtures/design-neutral.md", "utf8"))
					.identity,
			),
		).toEqual([]);
	});

	test("the generated module matches the active design/DESIGN.md", () => {
		expect(
			readFileSync(
				"src/design-system/themes/generated/product-fonts.ts",
				"utf8",
			),
		).toBe(fontsFor("design/DESIGN.md"));
	});
});
