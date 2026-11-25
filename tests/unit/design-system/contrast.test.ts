import { expect, test } from "vitest";
import { validatePalette } from "../../../tools/design-engine/validate";
import { readGeneratedThemes } from "./generated-themes";

const scopes = readGeneratedThemes();

test("contrast checks include both product modes", () => {
	expect(scopes.has("product/light")).toBe(true);
	expect(scopes.has("product/dark")).toBe(true);
});

for (const [scope, tokens] of scopes) {
	test(`${scope} meets the text, controls and data contrast thresholds`, () => {
		expect(() => validatePalette(tokens, scope)).not.toThrow();
	});
}
