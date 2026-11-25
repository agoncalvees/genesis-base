import { describe, expect, it } from "vitest";
import {
	compareValue,
	parseExpectation,
	primaryFamily,
	resolveToken,
	toNumber,
	validateSpec,
} from "../../../tools/design-engine/fidelity";

describe("design fidelity rules", () => {
	it("parses comparisons, tokens, inclusions and literals", () => {
		expect(parseExpectation(">= 56px")).toEqual({
			kind: "compare",
			op: ">=",
			value: 56,
			unit: "px",
		});
		expect(parseExpectation("{typeface-display}")).toEqual({
			kind: "token",
			ref: "typeface-display",
		});
		expect(parseExpectation("{--ember}")).toEqual({
			kind: "token",
			ref: "--ember",
		});
		expect(parseExpectation("~tabular-nums")).toEqual({
			kind: "includes",
			value: "tabular-nums",
		});
		expect(parseExpectation("italic")).toEqual({
			kind: "literal",
			value: "italic",
		});
	});

	it("resolves DESIGN.md tokens and leaves page variables to the browser", () => {
		const tokens = { foreground: "#111111" };
		expect(resolveToken("foreground", tokens)).toBe("#111111");
		expect(resolveToken("colors.foreground", tokens)).toBe("#111111");
		expect(resolveToken("--ember", tokens)).toBeUndefined();
	});

	it("compares the first font family, ignoring quotes and fallbacks", () => {
		expect(primaryFamily('"Instrument Serif", Georgia, serif')).toBe(
			"instrument serif",
		);
		const token = parseExpectation("{typeface-display}");
		expect(
			compareValue(
				"font-family",
				'"Instrument Serif", serif',
				token,
				"Instrument Serif, serif",
			),
		).toBe(true);
		expect(
			compareValue("font-family", "Georgia, serif", token, "Instrument Serif"),
		).toBe(false);
	});

	it("compares numeric values across px/rem and s/ms", () => {
		expect(toNumber("3.5rem", "px")).toBe(56);
		expect(toNumber("0.2s", "ms")).toBe(200);
		expect(compareValue("font-size", "56px", parseExpectation(">= 56px"))).toBe(
			true,
		);
		expect(compareValue("font-size", "52px", parseExpectation(">= 56px"))).toBe(
			false,
		);
		expect(
			compareValue(
				"transition-duration",
				"0.2s, 0.4s",
				parseExpectation("<= 300ms"),
			),
		).toBe(true);
		expect(compareValue("font-size", "auto", parseExpectation("= 16px"))).toBe(
			false,
		);
	});

	it("matches normalized colors and inclusions", () => {
		expect(
			compareValue(
				"color",
				"rgb(255, 90, 31)",
				parseExpectation("{--ember}"),
				"rgb(255, 90, 31)",
			),
		).toBe(true);
		expect(
			compareValue(
				"font-variant-numeric",
				"tabular-nums slashed-zero",
				parseExpectation("~tabular-nums"),
			),
		).toBe(true);
	});

	it("rejects specs without probes", () => {
		expect(() => validateSpec({ probes: [] })).toThrow();
		expect(
			validateSpec({
				probes: [
					{ name: "h", selector: "h1", expect: { color: "{foreground}" } },
				],
			}).probes,
		).toHaveLength(1);
	});
});
