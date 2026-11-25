import { readFileSync } from "node:fs";
import { join } from "node:path";
import { generatedDirectory } from "../../../tools/design-engine/generate";
import type { Tokens } from "../../../tools/design-engine/normalize";

function parseDeclarations(body: string): Tokens {
	return Object.fromEntries(
		[...body.matchAll(/--([a-z\d-]+):\s*([^;]+);/g)].map(([, key, value]) => [
			key,
			value.trim(),
		]),
	);
}

export function readGeneratedThemes() {
	const product = readFileSync(join(generatedDirectory, "product.css"), "utf8");
	const worlds = readFileSync(join(generatedDirectory, "worlds.css"), "utf8");
	const blocks = /([^{}]+)\{([^{}]*)\}/g;
	const themes = new Map<string, Tokens>();
	for (const [, selector, body] of product.matchAll(blocks)) {
		themes.set(
			selector.includes('[data-theme="dark"]')
				? "product/dark"
				: "product/light",
			parseDeclarations(body),
		);
	}
	for (const [, selector, body] of worlds.matchAll(blocks)) {
		if (selector.trim().startsWith("html:has(")) continue;
		const id = selector.match(/\[data-world="([^"]+)"\]/)?.[1];
		if (!id) throw new Error(`Unexpected world selector: ${selector}`);
		const declarations = Object.entries(parseDeclarations(body));
		for (const [mode, index] of [
			["light", 1],
			["dark", 2],
		] as const) {
			themes.set(
				`${id}/${mode}`,
				Object.fromEntries(
					declarations.map(([key, value]) => [
						key,
						value.match(/^light-dark\((#[\da-f]+),\s*(#[\da-f]+)\)$/i)?.[
							index
						] ?? value,
					]),
				),
			);
		}
	}
	return themes;
}
