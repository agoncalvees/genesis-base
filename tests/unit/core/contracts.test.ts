import { describe, expect, test } from "vitest";
import type {
	AppError,
	EvaluationResult,
	ExecutionResult,
	ExecutionStatus,
} from "../../../src/core/contracts";
import { toUiState } from "../../../src/core/contracts";

describe("contract shapes", () => {
	test("accept the documented fields", () => {
		const status: ExecutionStatus = "running";
		const result: ExecutionResult<{ value: number }> = {
			data: { value: 1 },
			durationMs: 12,
			metadata: { source: "fixture" },
			warnings: [],
		};
		const error: AppError = {
			code: "fixture",
			message: "safe",
			retryable: false,
		};
		const evaluation: EvaluationResult = {
			metric: "latency",
			value: 10,
			unit: "ms",
			sampleSize: 5,
			baseline: 12,
		};

		expect(status).toBe("running");
		expect(result.data.value).toBe(1);
		expect(error.code).toBe("fixture");
		expect(evaluation.metric).toBe("latency");
	});

	test("allow optional fields to be omitted", () => {
		const result: ExecutionResult<null> = { data: null };
		const evaluation: EvaluationResult = { metric: "count", value: 0 };

		expect(result).toEqual({ data: null });
		expect(evaluation.unit).toBeUndefined();
	});
});

describe("toUiState", () => {
	test.each([
		["idle", false, "idle"],
		["idle", true, "idle"],
		["running", false, "loading"],
		["running", true, "loading"],
		["completed", false, "empty"],
		["completed", true, "success"],
		["failed", false, "error"],
		["failed", true, "error"],
		["cancelled", false, "cancelled"],
		["cancelled", true, "cancelled"],
	] as const)("maps %s with hasData=%s to %s", (status, hasData, expected) => {
		expect(toUiState(status, hasData)).toBe(expected);
	});
});
