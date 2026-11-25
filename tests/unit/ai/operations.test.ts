import { MockLanguageModelV4 } from "ai/test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createAiClient } from "../../../src/ai/client";
import { getAiConfig } from "../../../src/ai/config";
import {
	AI_LIMITS,
	runStream,
	runStructured,
	runText,
	runTool,
} from "../../../src/ai/operations";
import {
	mockEnv,
	mockStream,
	providerError,
	response,
	sumCall,
	textResponse,
	usage,
} from "./fixtures/mock-model";

function client(primary: MockLanguageModelV4, fallback?: MockLanguageModelV4) {
	return createAiClient({
		env: {
			...mockEnv,
			AI_MODEL_FALLBACK: fallback ? "mock/fallback" : undefined,
		},
		modelFactory: (id) =>
			id === mockEnv.AI_MODEL_PRIMARY ? primary : (fallback ?? primary),
	});
}

function waitForAbort(signal: AbortSignal | undefined): Promise<never> {
	if (!signal) throw new Error("Expected an abort signal");
	signal.throwIfAborted();
	return new Promise((_, reject) => {
		signal.addEventListener("abort", () => reject(signal.reason), {
			once: true,
		});
	});
}

describe("P04 AI adapter • MOCK — not a real execution", () => {
	beforeEach(() => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => vi.restoreAllMocks());

	test.each([
		{},
		{ AI_MODEL_PRIMARY: "mock/primary" },
		{ ...mockEnv, AI_MODEL_PRIMARY: " " },
	])("reports unavailable when a required setting is missing", async (env) => {
		const modelFactory = vi.fn();
		const config = getAiConfig(env);
		expect(config).toMatchObject({
			status: "unavailable",
			reason: expect.any(String),
		});
		expect(
			await runText(createAiClient({ env, modelFactory }), "Hello"),
		).toEqual(config);
		expect(modelFactory).not.toHaveBeenCalled();
	});

	test("generates text within the configured SDK token limit", async () => {
		const model = new MockLanguageModelV4({ doGenerate: textResponse() });
		expect(await runText(client(model), "Hello")).toMatchObject({
			status: "completed",
			data: "Mock response",
			correlationId: expect.any(String),
		});
		expect(model.doGenerateCalls).toHaveLength(1);
		expect(model.doGenerateCalls[0]?.maxOutputTokens).toBe(
			AI_LIMITS.outputTokens,
		);
		expect(JSON.stringify(getAiConfig(mockEnv))).not.toContain(
			mockEnv.OPENROUTER_API_KEY,
		);
	});

	test("delivers text as ordered stream chunks", async () => {
		const model = new MockLanguageModelV4({
			doStream: mockStream([
				{ type: "text-start", id: "1" },
				{ type: "text-delta", id: "1", delta: "Mock " },
				{ type: "text-delta", id: "1", delta: "response" },
				{ type: "text-end", id: "1" },
				{
					type: "finish",
					finishReason: { unified: "stop", raw: "stop" },
					usage,
				},
			]),
		});
		const onChunk = vi.fn();
		expect(await runStream(client(model), "Hello", onChunk)).toMatchObject({
			status: "completed",
		});
		expect(onChunk.mock.calls).toEqual([["Mock "], ["response"]]);
	});

	test("falls back on a retryable stream failure before the first chunk", async () => {
		const model = new MockLanguageModelV4({
			doStream: mockStream([{ type: "error", error: providerError(true) }]),
		});
		const fallback = new MockLanguageModelV4({
			doStream: mockStream([
				{ type: "text-start", id: "2" },
				{ type: "text-delta", id: "2", delta: "Mock fallback" },
				{ type: "text-end", id: "2" },
				{
					type: "finish",
					finishReason: { unified: "stop", raw: "stop" },
					usage,
				},
			]),
		});
		const onChunk = vi.fn();
		expect(
			await runStream(client(model, fallback), "Hello", onChunk),
		).toMatchObject({
			status: "completed",
		});
		expect(onChunk).toHaveBeenCalledExactlyOnceWith("Mock fallback");
		expect(model.doStreamCalls).toHaveLength(1);
		expect(fallback.doStreamCalls).toHaveLength(1);
	});

	test("reports a partial stream failure without replaying delivered chunks", async () => {
		const model = new MockLanguageModelV4({
			doStream: mockStream([
				{ type: "text-start", id: "1" },
				{ type: "text-delta", id: "1", delta: "Mock partial" },
				{ type: "error", error: { code: 503, message: "Mock unavailable" } },
			]),
		});
		const fallback = new MockLanguageModelV4();
		const onChunk = vi.fn();
		expect(
			await runStream(client(model, fallback), "Hello", onChunk),
		).toMatchObject({
			status: "failed",
			error: { code: "provider_error", retryable: true },
		});
		expect(onChunk).toHaveBeenCalledExactlyOnceWith("Mock partial");
		expect(fallback.doStreamCalls).toHaveLength(0);
		expect(console.error).not.toHaveBeenCalled();
	});

	test("validates structured output", async () => {
		const model = new MockLanguageModelV4({
			doGenerate: textResponse('{"summary":"Example"}'),
		});
		expect(await runStructured(client(model), "Summarize")).toMatchObject({
			status: "completed",
			data: { summary: "Example" },
		});
		expect(model.doGenerateCalls[0]?.responseFormat).toMatchObject({
			type: "json",
		});
	});

	test.each([
		'{"summary":42}',
		'{"summary":"valid","extra":true}',
		"invalid JSON",
	])("rejects invalid structured output %s", async (output) => {
		const model = new MockLanguageModelV4({ doGenerate: textResponse(output) });
		const fallback = new MockLanguageModelV4();
		expect(
			await runStructured(client(model, fallback), "Summarize"),
		).toMatchObject({
			status: "failed",
			error: { code: "invalid_output", retryable: false },
		});
		expect(fallback.doGenerateCalls).toHaveLength(0);
	});

	test("calls the bounded arithmetic tool once and returns its output", async () => {
		const model = new MockLanguageModelV4({
			doGenerate: response([sumCall("one")], "tool-calls"),
		});
		expect(await runTool(client(model), "Add 2 and 3")).toMatchObject({
			status: "completed",
			data: 5,
		});
		expect(model.doGenerateCalls).toHaveLength(1);
		expect(model.doGenerateCalls[0]?.toolChoice).toEqual({
			type: "tool",
			toolName: "sum",
		});
	});

	test("rejects a second tool call in a single step", async () => {
		const model = new MockLanguageModelV4({
			doGenerate: response([sumCall("one"), sumCall("two")], "tool-calls"),
		});
		expect(await runTool(client(model), "Add 2 and 3")).toMatchObject({
			status: "failed",
			error: { code: "budget_exceeded", retryable: false },
		});
		expect(model.doGenerateCalls).toHaveLength(1);
	});

	test("rejects output truncated at the token limit", async () => {
		const model = new MockLanguageModelV4({
			doGenerate: response([{ type: "text", text: "partial" }], "length"),
		});
		expect(await runText(client(model), "Hello")).toMatchObject({
			status: "failed",
			error: { code: "budget_exceeded", retryable: false },
		});
	});

	test("aborts the provider on timeout and returns a retryable timeout", async () => {
		const model = new MockLanguageModelV4({
			doGenerate: ({ abortSignal }) => waitForAbort(abortSignal),
		});
		const fallback = new MockLanguageModelV4();
		expect(
			await runText(client(model, fallback), "Hello", { timeoutMs: 25 }),
		).toMatchObject({
			status: "failed",
			error: { code: "timeout", retryable: true },
		});
		expect(model.doGenerateCalls[0]?.abortSignal?.aborted).toBe(true);
		expect(fallback.doGenerateCalls).toHaveLength(0);
	});

	test("aborts the provider on caller cancellation and returns cancelled", async () => {
		const controller = new AbortController();
		const model = new MockLanguageModelV4({
			doGenerate: ({ abortSignal }) => {
				const pending = waitForAbort(abortSignal);
				controller.abort("MOCK-private-cancellation");
				return pending;
			},
		});
		const result = await runTool(client(model), "Add 2 and 3", {
			signal: controller.signal,
		});
		expect(result).toMatchObject({
			status: "cancelled",
			error: { code: "cancelled" },
		});
		expect(model.doGenerateCalls[0]?.abortSignal?.aborted).toBe(true);
		expect(JSON.stringify(result)).not.toContain("MOCK-private-cancellation");
	});

	test("rejects excess input without starting a model call", async () => {
		const model = new MockLanguageModelV4();
		expect(
			await runText(client(model), "a".repeat(AI_LIMITS.inputCharacters + 1)),
		).toMatchObject({
			status: "failed",
			error: { code: "input_limit", retryable: false },
		});
		expect(model.doGenerateCalls).toHaveLength(0);
	});

	test.each([true, false])(
		"uses fallback only when the provider error is retryable (%s)",
		async (retryable) => {
			const model = new MockLanguageModelV4({
				doGenerate: async () => {
					throw providerError(retryable);
				},
			});
			const fallback = new MockLanguageModelV4({
				doGenerate: textResponse("Mock fallback"),
			});
			const result = await runText(client(model, fallback), "Hello");
			expect(model.doGenerateCalls).toHaveLength(1);
			expect(fallback.doGenerateCalls).toHaveLength(retryable ? 1 : 0);
			expect(result).toMatchObject(
				retryable
					? { status: "completed", data: "Mock fallback" }
					: {
							status: "failed",
							error: { code: "provider_error", retryable: false },
						},
			);
		},
	);

	describe.each([runText, runStructured])("%s progress", (operation) => {
		test.each([
			{ text: "", outputTokens: 4, attempts: 1 },
			{ text: "Mock partial", outputTokens: 0, attempts: 1 },
			{ text: "", outputTokens: 0, attempts: 2 },
		])(
			"allows $attempts attempt(s) with $outputTokens output tokens and '$text'",
			async ({ text, outputTokens, attempts }) => {
				const generation = response(text ? [{ type: "text", text }] : []);
				generation.usage = {
					...usage,
					outputTokens: {
						total: outputTokens,
						text: outputTokens,
						reasoning: 0,
					},
				};
				// Simulate a retryable error during SDK handling of a received response.
				const primary = new MockLanguageModelV4({
					doGenerate: {
						...generation,
						get warnings(): never {
							throw providerError(true);
						},
					},
				});
				const fallback = new MockLanguageModelV4({
					doGenerate: textResponse('{"summary":"Mock fallback"}'),
				});
				const result = await operation(client(primary, fallback), "Hello");
				expect(result).toMatchObject(
					attempts === 1
						? {
								status: "failed",
								error: { code: "provider_error", retryable: true },
							}
						: { status: "completed" },
				);
				expect(primary.doGenerateCalls).toHaveLength(1);
				expect(fallback.doGenerateCalls).toHaveLength(attempts - 1);
			},
		);
	});

	test("limits transient retries and redacts provider and AppError-shaped payloads", async () => {
		const model = new MockLanguageModelV4({
			doGenerate: async () => {
				throw providerError(true);
			},
		});
		const result = await runText(client(model), "MOCK-private-prompt");
		expect(model.doGenerateCalls).toHaveLength(AI_LIMITS.modelCalls);
		expect(result).toMatchObject({
			status: "failed",
			error: { code: "provider_error", retryable: true },
		});
		expect(console.warn).toHaveBeenCalledExactlyOnceWith("AI execution ended", {
			correlationId:
				"correlationId" in result ? result.correlationId : undefined,
			code: "provider_error",
		});

		const unsafeModel = new MockLanguageModelV4({
			doGenerate: async () => {
				throw {
					code: mockEnv.OPENROUTER_API_KEY,
					message: "MOCK-private-prompt",
					retryable: true,
				};
			},
		});
		const unsafeResult = await runText(
			client(unsafeModel),
			"MOCK-private-prompt",
		);
		expect(unsafeModel.doGenerateCalls).toHaveLength(1);
		expect(unsafeResult).toMatchObject({
			status: "failed",
			error: { code: "unknown", retryable: false },
		});
		const published = JSON.stringify([
			result,
			unsafeResult,
			vi.mocked(console.warn).mock.calls,
		]);
		expect(published).not.toContain(mockEnv.OPENROUTER_API_KEY);
		expect(published).not.toContain("MOCK-private-prompt");
		expect(console.error).not.toHaveBeenCalled();
	});
});
