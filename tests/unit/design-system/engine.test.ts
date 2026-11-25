import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { parseDesign } from "../../../tools/design-engine/adapter";
import {
	checkDrift,
	loadDesign,
	renderFiles,
	renderProduct,
	renderWorld,
} from "../../../tools/design-engine/generate";
import { normalize } from "../../../tools/design-engine/normalize";

const neutral = readFileSync("tests/fixtures/design-neutral.md", "utf8");

test("normalizes standard references and the Genesis extension", () => {
	const { light, dark } = normalize(parseDesign(neutral));
	expect(light).toMatchObject({
		primary: "#27272a",
		"radius-control": "0.5rem",
		"space-unit": "0.25rem",
		"heading-weight": "600",
		"duration-fast": "150ms",
		"surface-style": "border",
	});
	expect(dark).toMatchObject({ background: "#0b0b0c", "data-1": "#60a5fa" });
});

test.each([
	[
		"missing primary",
		neutral.replace(/^ {2}primary: .*\n/m, ""),
		/colors\.primary/,
	],
	[
		"bad contrast",
		neutral.replace(/^ {2}foreground: .*$/m, '  foreground: "#ffffff"'),
		/foreground\/background/,
	],
	[
		"border contrast",
		neutral.replace(/^ {2}control-border: .*$/m, '  control-border: "#dddddd"'),
		/control-border\/background/,
	],
	[
		"data contrast",
		neutral.replace(/^ {4}data-1: .*$/m, '    data-1: "#ffffff"'),
		/data-1\/surface/,
	],
	[
		"indistinguishable data",
		neutral.replace(/^ {4}data-2: .*$/m, '    data-2: "#1d4ed8"'),
		/ΔE OK/,
	],
	[
		"unknown font",
		neutral.replace("fontFamily: system-ui", "fontFamily: Unregistered"),
		/unknown font "Unregistered"/,
	],
	[
		"duplicate keys",
		neutral.replace("colors:\n", 'colors:\n  primary: "#ffffff"\n'),
		/keys must be unique/i,
	],
])("rejects invalid DESIGN.md with %s", (_name, source, expected) => {
	expect(() => loadDesign(source)).toThrow(expected);
});

test("generates product and world CSS with deterministic independent scopes", () => {
	const { identity } = loadDesign(neutral);
	const product = renderProduct(identity);
	expect(product).toContain(":root");
	expect(product).toContain('[data-theme="dark"]');
	const world = renderWorld("fixture", identity);
	expect(world).toMatch(/^\[data-world="fixture"\]/);
	expect(world).toContain("--background: light-dark(#ffffff, #0b0b0c);");
	expect(world).toContain("--panel-border-width: var(--border-width);");
	expect(world).not.toContain(":root");
	expect(() => renderWorld("../unsafe", identity)).toThrow("Invalid world id");
});

test("detects missing or changed generated output", () => {
	expect(() => checkDrift(renderFiles())).not.toThrow();
	const dir = mkdtempSync(join(tmpdir(), "genesis-design-test-"));
	const path = join(dir, "product.css");
	try {
		expect(() => checkDrift({ [path]: "expected" })).toThrow(
			"CSS desatualizado",
		);
		writeFileSync(path, "stale");
		expect(() => checkDrift({ [path]: "expected" })).toThrow(
			"CSS desatualizado",
		);
		writeFileSync(path, "expected");
		expect(() => checkDrift({ [path]: "expected" })).not.toThrow();
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("the Aceiro example validates motion, colors and semantic components", () => {
	const source = readFileSync("design/examples/aceiro/DESIGN.md", "utf8");
	const { findings, identity } = loadDesign(source);
	expect(findings.filter(({ severity }) => severity === "error")).toEqual([]);
	expect(identity.light["data-6"]).toMatch(/^#[\da-f]{6}$/);
	expect(identity.light["duration-showcase"]).toBe("560ms");
	expect(identity.light["spring-mass"]).toBeTruthy();
});
