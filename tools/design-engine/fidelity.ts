/**
 * Fidelity rules: compare what DESIGN.md declares with what the browser renders.
 * Pure helpers live here (unit-tested); `verify.ts` drives Playwright.
 */
import type { Tokens } from "./normalize";

export interface Probe {
	name: string;
	selector: string;
	/** CSS property → expected value. `{token}` resolves from DESIGN.md, `{--var}` from the page. */
	expect: Record<string, string>;
	/** Restrict to these viewport widths. */
	viewports?: number[];
	/** Only the first match is checked unless `all` is true. */
	all?: boolean;
	/** Missing element is a failure unless optional. */
	optional?: boolean;
}

export interface FidelitySpec {
	url?: string;
	viewports?: number[];
	/** Selector awaited before probing (after fonts load). */
	waitFor?: string;
	/** Optional interaction states: click/press selectors before probing. */
	states?: { name: string; actions: { click?: string; press?: string }[] }[];
	probes: Probe[];
}

export type Expectation =
	| {
			kind: "compare";
			op: ">=" | "<=" | ">" | "<" | "=";
			value: number;
			unit: string;
	  }
	| { kind: "token"; ref: string }
	| { kind: "literal"; value: string }
	| { kind: "includes"; value: string };

const colorProperties = new Set([
	"color",
	"background-color",
	"border-color",
	"border-top-color",
	"border-bottom-color",
	"border-left-color",
	"border-right-color",
	"outline-color",
	"fill",
	"stroke",
	"caret-color",
	"text-decoration-color",
]);

export const isColorProperty = (property: string) =>
	colorProperties.has(property);

export function parseExpectation(raw: string): Expectation {
	const value = raw.trim();
	const compare = /^(>=|<=|>|<|=)\s*(-?\d*\.?\d+)\s*([a-z%]*)$/i.exec(value);
	if (compare) {
		return {
			kind: "compare",
			op: compare[1] as ">=" | "<=" | ">" | "<" | "=",
			value: Number(compare[2]),
			unit: compare[3].toLowerCase(),
		};
	}
	const token = /^\{([^{}]+)\}$/.exec(value);
	if (token) return { kind: "token", ref: token[1] };
	if (value.startsWith("~"))
		return { kind: "includes", value: value.slice(1).trim() };
	return { kind: "literal", value };
}

/** Resolve `{token}` against DESIGN.md tokens. Page variables (`{--x}`) are resolved in the browser. */
export function resolveToken(ref: string, tokens: Tokens): string | undefined {
	if (ref.startsWith("--")) return undefined;
	return tokens[ref] ?? tokens[ref.replace(/^colors\./, "")];
}

/** First family of a font-family list, unquoted and lowercased. */
export function primaryFamily(value: string) {
	return (value.split(",")[0] ?? "")
		.trim()
		.replace(/^["']|["']$/g, "")
		.toLowerCase();
}

export function toNumber(
	value: string,
	unit: string,
	rootPx = 16,
): number | undefined {
	const match = /^(-?\d*\.?\d+)([a-z%]*)$/i.exec(value.trim());
	if (!match) return undefined;
	const amount = Number(match[1]);
	const from = match[2].toLowerCase();
	if (from === unit || (!unit && !from)) return amount;
	if (from === "px" && unit === "rem") return amount / rootPx;
	if (from === "rem" && unit === "px") return amount * rootPx;
	if (from === "s" && unit === "ms") return amount * 1000;
	if (from === "ms" && unit === "s") return amount / 1000;
	if (!unit) return amount;
	return undefined;
}

/**
 * Compare a computed value with a normalized expected value.
 * `expected` must already be resolved (tokens substituted, colors normalized in the page).
 */
export function compareValue(
	property: string,
	actual: string,
	expectation: Expectation,
	expected?: string,
): boolean {
	if (expectation.kind === "compare") {
		// Computed values like "0.2s, 0.3s" → first entry.
		const first = actual.split(",")[0]?.trim() ?? "";
		const value = toNumber(first, expectation.unit);
		if (value === undefined) return false;
		const tolerance = expectation.op === "=" ? 0.5 : 0;
		switch (expectation.op) {
			case ">=":
				return value >= expectation.value - tolerance;
			case "<=":
				return value <= expectation.value + tolerance;
			case ">":
				return value > expectation.value;
			case "<":
				return value < expectation.value;
			default:
				return Math.abs(value - expectation.value) <= tolerance;
		}
	}
	if (expectation.kind === "includes") {
		return actual.toLowerCase().includes(expectation.value.toLowerCase());
	}
	const target = (expected ?? "").trim();
	if (property === "font-family")
		return primaryFamily(actual) === primaryFamily(target);
	return actual.trim().toLowerCase() === target.toLowerCase();
}

export function validateSpec(input: unknown): FidelitySpec {
	const spec = input as FidelitySpec;
	if (!spec || !Array.isArray(spec.probes) || spec.probes.length === 0)
		throw new Error("fidelity.json precisa de `probes` com ao menos um item.");
	for (const probe of spec.probes) {
		if (!probe.name || !probe.selector || !probe.expect)
			throw new Error("Cada probe precisa de name, selector e expect.");
		for (const raw of Object.values(probe.expect))
			parseExpectation(String(raw));
	}
	return spec;
}
