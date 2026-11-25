import { expect, test } from "vitest";
import { AI_LIMITS, defaultTimeoutMs } from "../../../src/ai/operations";

test("AI_TIMEOUT_MS overrides the default within a safety cap", () => {
	expect(defaultTimeoutMs({})).toBe(AI_LIMITS.timeoutMs);
	expect(defaultTimeoutMs({ AI_TIMEOUT_MS: "45000" })).toBe(45_000);
	expect(defaultTimeoutMs({ AI_TIMEOUT_MS: "999999" })).toBe(120_000);
	expect(defaultTimeoutMs({ AI_TIMEOUT_MS: "abc" })).toBe(AI_LIMITS.timeoutMs);
	expect(defaultTimeoutMs({ AI_TIMEOUT_MS: "-5" })).toBe(AI_LIMITS.timeoutMs);
});
