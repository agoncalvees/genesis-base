/**
 * design:verify — renders the product in Chromium and checks computed styles
 * against the active DESIGN.md (and page-level custom properties), plus
 * font loading and horizontal overflow, and captures screenshots per viewport.
 *
 *   bun run design:verify <url> [--spec design/fidelity.json] [--out design/evidence]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import {
	compareValue,
	type FidelitySpec,
	isColorProperty,
	parseExpectation,
	primaryFamily,
	resolveToken,
	validateSpec,
} from "./fidelity";
import { loadDesign, productPath } from "./generate";

interface Row {
	viewport: number;
	state: string;
	probe: string;
	property: string;
	expected: string;
	actual: string;
	ok: boolean;
}

function args(argv: string[]) {
	const options: Record<string, string> = {};
	const positional: string[] = [];
	for (let i = 0; i < argv.length; i++) {
		if (argv[i].startsWith("--")) options[argv[i].slice(2)] = argv[++i] ?? "";
		else positional.push(argv[i]);
	}
	return { url: positional[0], options };
}

export async function verify(argv: string[]) {
	const { url: cliUrl, options } = args(argv);
	const specPath = options.spec ?? "design/fidelity.json";
	if (!existsSync(specPath))
		throw new Error(
			`${specPath} não existe. Veja docs/design/FIDELITY.md para o formato.`,
		);
	const spec: FidelitySpec = validateSpec(
		JSON.parse(readFileSync(specPath, "utf8")),
	);
	const url = cliUrl ?? spec.url;
	if (!url) throw new Error("Informe a URL: design:verify <url>.");
	const out = options.out ?? "design/evidence";
	mkdirSync(out, { recursive: true });

	const design = loadDesign(
		readFileSync(options.design ?? productPath, "utf8"),
	);
	const tokens = design.identity.light;
	const families = new Set(
		["typeface-display", "typeface-body", "typeface-mono"]
			.map((key) => tokens[key])
			.filter(Boolean)
			.map(primaryFamily)
			.filter(
				(family) =>
					!/^(ui-|system-ui|-apple|sans-serif|serif|monospace)/.test(family),
			),
	);

	const rows: Row[] = [];
	const issues: string[] = [];
	const browser = await chromium.launch();
	try {
		for (const width of spec.viewports ?? [360, 768, 1440]) {
			const page = await browser.newPage({
				viewport: { width, height: width < 600 ? 800 : 900 },
				deviceScaleFactor: 1,
			});
			const consoleErrors: string[] = [];
			page.on("pageerror", (error) => consoleErrors.push(error.message));
			await page.goto(url, { waitUntil: "networkidle" });
			await page.evaluate(() => document.fonts.ready);
			if (spec.waitFor) await page.waitForSelector(spec.waitFor);

			const loaded: string[] = await page.evaluate(() =>
				[...document.fonts]
					.filter((face) => face.status === "loaded")
					.map((face) => face.family.replace(/["']/g, "").toLowerCase()),
			);
			for (const family of families)
				if (!loaded.includes(family))
					issues.push(`${width}px: fonte declarada não carregada: ${family}`);

			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - window.innerWidth,
			);
			if (overflow > 0)
				issues.push(`${width}px: overflow horizontal de ${overflow}px`);
			for (const message of consoleErrors)
				issues.push(`${width}px: erro de página: ${message}`);

			const states = [{ name: "inicial", actions: [] }, ...(spec.states ?? [])];
			for (const state of states) {
				if (state.name !== "inicial") {
					await page.goto(url, { waitUntil: "networkidle" });
					await page.evaluate(() => document.fonts.ready);
					if (spec.waitFor) await page.waitForSelector(spec.waitFor);
					for (const action of state.actions) {
						if (action.click) await page.click(action.click);
						if (action.press) await page.keyboard.press(action.press);
					}
					await page.waitForTimeout(700);
				}
				await page.screenshot({
					path: join(out, `${state.name}-${width}.png`),
					fullPage: true,
				});

				for (const probe of spec.probes) {
					if (probe.viewports && !probe.viewports.includes(width)) continue;
					const entries = Object.entries(probe.expect).map(
						([property, raw]) => {
							const expectation = parseExpectation(String(raw));
							const resolved =
								expectation.kind === "token"
									? resolveToken(expectation.ref, tokens)
									: expectation.kind === "literal"
										? expectation.value
										: undefined;
							return {
								property,
								raw: String(raw),
								expectation,
								resolved,
								pageVar:
									expectation.kind === "token" &&
									expectation.ref.startsWith("--")
										? expectation.ref
										: undefined,
							};
						},
					);
					const result = await page.evaluate(
						({ selector, all, entries, colorProps }) => {
							const nodes = [...document.querySelectorAll(selector)];
							if (nodes.length === 0) return null;
							const scratch = document.createElement("span");
							document.body.append(scratch);
							const normalizeColor = (value: string) => {
								scratch.style.color = "";
								scratch.style.color = value;
								return getComputedStyle(scratch).color;
							};
							const rootStyle = getComputedStyle(document.documentElement);
							const out = (all ? nodes : nodes.slice(0, 1)).map((node) => {
								const style = getComputedStyle(node);
								return entries.map((entry) => {
									let expected = entry.pageVar
										? rootStyle.getPropertyValue(entry.pageVar).trim()
										: entry.resolved;
									if (expected?.startsWith("var(")) {
										const name = /var\((--[^,)]+)/.exec(expected)?.[1];
										if (name)
											expected = rootStyle.getPropertyValue(name).trim();
									}
									if (expected && colorProps.includes(entry.property))
										expected = normalizeColor(expected);
									return {
										actual: style.getPropertyValue(entry.property),
										expected,
									};
								});
							});
							scratch.remove();
							return out;
						},
						{
							selector: probe.selector,
							all: Boolean(probe.all),
							entries: entries.map(({ property, resolved, pageVar }) => ({
								property,
								resolved,
								pageVar,
							})),
							colorProps: entries
								.map((entry) => entry.property)
								.filter(isColorProperty),
						},
					);
					if (!result) {
						if (!probe.optional)
							rows.push({
								viewport: width,
								state: state.name,
								probe: probe.name,
								property: "(elemento)",
								expected: probe.selector,
								actual: "ausente",
								ok: false,
							});
						continue;
					}
					for (const node of result) {
						node.forEach((value, index) => {
							const entry = entries[index];
							rows.push({
								viewport: width,
								state: state.name,
								probe: probe.name,
								property: entry.property,
								expected:
									entry.expectation.kind === "token"
										? `${entry.raw} = ${value.expected ?? "∅"}`
										: entry.raw,
								actual: value.actual,
								ok: compareValue(
									entry.property,
									value.actual,
									entry.expectation,
									value.expected,
								),
							});
						});
					}
				}
			}
			await page.close();
		}
	} finally {
		await browser.close();
	}

	const failures = rows.filter((row) => !row.ok);
	const unique = new Map<string, Row>();
	for (const row of failures)
		unique.set(
			`${row.viewport}|${row.state}|${row.probe}|${row.property}`,
			row,
		);
	writeFileSync(
		join(out, "fidelity.json"),
		`${JSON.stringify({ url, checkedAt: new Date().toISOString(), issues, rows }, null, 2)}\n`,
	);
	console.log(
		`Fidelidade: ${rows.length - failures.length}/${rows.length} verificações; ${issues.length} problemas globais.`,
	);
	for (const issue of issues) console.log(`✗ ${issue}`);
	for (const row of unique.values())
		console.log(
			`✗ ${row.viewport}px [${row.state}] ${row.probe} · ${row.property}: esperado ${row.expected}, obtido ${row.actual}`,
		);
	console.log(`Capturas e relatório em ${out}/`);
	return failures.length + issues.length;
}

if (import.meta.main) {
	try {
		process.exitCode = (await verify(process.argv.slice(2))) > 0 ? 1 : 0;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	}
}
