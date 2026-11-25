import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
	createPlan,
	modules,
	parseArgs,
	productPackage,
} from "../../scripts/new/plan";

const tracked = [
	"package.json",
	"scripts/new/index.ts",
	"tests/unit/new.test.ts",
	"src/ai/server.ts",
	"src/design-system/dataviz/index.tsx",
	"src/design-system/patterns/ai-interface.tsx",
	"src/design-system/index.ts",
];
const base = "/work/genesis-base";

describe("bun run new", () => {
	test("parses modules and rejects unknown ones", () => {
		const options = parseArgs([
			"--name",
			"Aceiro",
			"--slug",
			"aceiro",
			"--dir",
			"/tmp/aceiro",
			"--with",
			"dataviz, ai",
		]);
		expect(options.with).toEqual(["dataviz", "ai"]);
		expect(() =>
			parseArgs([
				"--name",
				"A",
				"--slug",
				"a",
				"--dir",
				"/x",
				"--with",
				"maps",
			]),
		).toThrow("Módulo desconhecido");
		expect(() =>
			parseArgs(["--name", "A", "--slug", "A B", "--dir", "/x"]),
		).toThrow();
		expect(() =>
			parseArgs(["--name", "A", "--slug", "a", "--dir", "rel"]),
		).toThrow();
	});

	test("leaves out the generator and every module not requested", () => {
		const plan = createPlan({
			tracked,
			with: ["dataviz"],
			base,
			target: "/work/aceiro",
			targetEmpty: true,
			dirty: false,
		});
		expect(plan.copy).toEqual([
			"package.json",
			"src/design-system/dataviz/index.tsx",
			"src/design-system/index.ts",
		]);
		expect(plan.omittedModules).toEqual(["ai"]);
		expect(plan.removedDependencies).toEqual([...modules.ai.dependencies]);
	});

	test("refuses a dirty base, a non-empty target or a target inside the base", () => {
		const input = {
			tracked,
			with: [],
			base,
			target: "/work/p",
			targetEmpty: true,
			dirty: false,
		};
		expect(() => createPlan({ ...input, dirty: true })).toThrow("limpa");
		expect(() => createPlan({ ...input, targetEmpty: false })).toThrow("vazio");
		expect(() => createPlan({ ...input, target: `${base}/p` })).toThrow("fora");
	});

	test("rewrites the package name, drops the generator script and omitted dependencies", () => {
		const pkg = JSON.parse(
			productPackage(
				JSON.stringify({
					name: "genesis-base",
					scripts: { new: "x", dev: "vite dev" },
					dependencies: { ai: "1", react: "19" },
				}),
				"aceiro",
				["ai"],
			),
		);
		expect(pkg).toEqual({
			name: "aceiro",
			scripts: { dev: "vite dev" },
			dependencies: { react: "19" },
		});
	});

	test("every module path exists in the base", () => {
		const files = execFileSync("git", ["ls-files"], { encoding: "utf8" });
		for (const [name, module] of Object.entries(modules))
			for (const path of module.paths)
				expect(
					path.endsWith("/")
						? files.includes(`\n${path}`) || files.startsWith(path)
						: existsSync(path),
					`${name}: ${path}`,
				).toBe(true);
	});
});
