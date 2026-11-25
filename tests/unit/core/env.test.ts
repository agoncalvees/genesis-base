import { describe, expect, test } from "vitest";
import { getCapabilities } from "../../../src/core/env";

const SECRET = "sk-secret-value";
const URL = "https://example.convex.cloud";
const MODEL = "model-fixture";

const completeEnv = {
	OPENROUTER_API_KEY: SECRET,
	AI_MODEL_PRIMARY: MODEL,
	VITE_CONVEX_URL: URL,
};

describe("getCapabilities", () => {
	test("reports both capabilities available with complete env", () => {
		expect(getCapabilities(completeEnv)).toEqual({
			ai: { available: true },
			data: { available: true },
		});
	});

	test("reports ai unavailable with a reason when the key is missing", () => {
		const capabilities = getCapabilities({
			AI_MODEL_PRIMARY: MODEL,
			VITE_CONVEX_URL: URL,
		});

		expect(capabilities.ai).toEqual({
			available: false,
			reason: "Missing OPENROUTER_API_KEY",
		});
		expect(capabilities.data.available).toBe(true);
	});

	test("reports ai unavailable with a reason when the model is missing", () => {
		const capabilities = getCapabilities({
			OPENROUTER_API_KEY: SECRET,
			VITE_CONVEX_URL: URL,
		});

		expect(capabilities.ai).toEqual({
			available: false,
			reason: "Missing AI_MODEL_PRIMARY",
		});
		expect(capabilities.data.available).toBe(true);
	});

	test("lists every missing ai variable in the reason", () => {
		const capabilities = getCapabilities({});

		expect(capabilities.ai).toEqual({
			available: false,
			reason: "Missing OPENROUTER_API_KEY, AI_MODEL_PRIMARY",
		});
		expect(capabilities.data).toEqual({
			available: false,
			reason: "Missing VITE_CONVEX_URL",
		});
	});

	test("reports data unavailable with a reason when the url is missing", () => {
		const capabilities = getCapabilities({
			OPENROUTER_API_KEY: SECRET,
			AI_MODEL_PRIMARY: MODEL,
		});

		expect(capabilities.data).toEqual({
			available: false,
			reason: "Missing VITE_CONVEX_URL",
		});
	});

	test("treats empty strings, whitespace and undefined as missing", () => {
		const capabilities = getCapabilities({
			OPENROUTER_API_KEY: "   ",
			AI_MODEL_PRIMARY: "",
			VITE_CONVEX_URL: undefined,
		});

		expect(capabilities.ai.available).toBe(false);
		expect(capabilities.data.available).toBe(false);
		expect(capabilities.ai.reason).toContain("OPENROUTER_API_KEY");
		expect(capabilities.ai.reason).toContain("AI_MODEL_PRIMARY");
	});

	test("ignores unrelated and whitespace-only keys", () => {
		const capabilities = getCapabilities({
			" ": SECRET,
			"": MODEL,
			...completeEnv,
		});

		expect(capabilities).toEqual({
			ai: { available: true },
			data: { available: true },
		});
	});

	test("never throws and never returns secret values", () => {
		expect(() => getCapabilities({})).not.toThrow();

		const capabilities = getCapabilities(completeEnv);
		const serialized = JSON.stringify(capabilities);

		expect(serialized).not.toContain(SECRET);
		expect(serialized).not.toContain(URL);
		expect(serialized).not.toContain(MODEL);
	});
});
