import "@tanstack/react-start/server-only";

import {
	APICallError,
	generateText,
	isStepCount,
	NoObjectGeneratedError,
	NoOutputGeneratedError,
	Output,
	streamText,
	tool,
	wrapLanguageModel,
} from "ai";
import { z } from "zod";
import type { AppError, ExecutionResult } from "../core/contracts";
import {
	createAppError,
	normalizeError,
	withCorrelationId,
} from "../core/errors";
import type { AiClient, ModelFactory } from "./client";
import type { Unavailable } from "./config";

export const AI_LIMITS = {
	timeoutMs: 15_000,
	inputCharacters: 4_000,
	outputTokens: 512,
	modelCalls: 2,
	toolCalls: 1,
} as const;

const summarySchema = z.strictObject({
	summary: z.string().min(1).max(1_000),
});

type RunOptions = { signal?: AbortSignal; timeoutMs?: number };

const MAX_TIMEOUT_MS = 120_000;

/** Default timeout, overridable via AI_TIMEOUT_MS (free models are slower). */
export function defaultTimeoutMs(env = process.env): number {
	const value = Number(env.AI_TIMEOUT_MS);
	if (!Number.isFinite(value) || value <= 0) return AI_LIMITS.timeoutMs;
	return Math.min(Math.trunc(value), MAX_TIMEOUT_MS);
}

export type AiResult<T> =
	| Unavailable
	| ({ status: "completed"; correlationId: string } & Pick<
			ExecutionResult<T>,
			"data" | "durationMs"
	  >)
	| { status: "failed" | "cancelled"; correlationId: string; error: AppError };

const errors = {
	timeout: createAppError("timeout", "AI exceeded its time limit.", true),
	cancelled: createAppError("cancelled", "AI execution was cancelled.", false),
	inputLimit: createAppError(
		"input_limit",
		"AI input exceeds its character limit.",
		false,
	),
	budget: createAppError(
		"budget_exceeded",
		"AI exceeded its execution budget.",
		false,
	),
	invalidOutput: createAppError(
		"invalid_output",
		"AI returned invalid output.",
		false,
	),
	provider: createAppError(
		"provider_error",
		"The AI provider request failed.",
		false,
	),
	transient: createAppError(
		"provider_error",
		"The AI provider is temporarily unavailable.",
		true,
	),
};

function safeError(error: unknown): AppError {
	// Only locally created messages are safe. Provider errors can carry bodies,
	// headers and arbitrary messages, including objects shaped like AppError.
	if (Object.values(errors).some((known) => known === error)) {
		return normalizeError(error);
	}
	if (APICallError.isInstance(error)) {
		return error.isRetryable ? errors.transient : errors.provider;
	}
	if (
		NoOutputGeneratedError.isInstance(error) ||
		NoObjectGeneratedError.isInstance(error)
	)
		return errors.invalidOutput;
	return normalizeError(undefined);
}

function checkFinish(finishReason: string, outputTokens?: number) {
	if (
		finishReason === "length" ||
		(outputTokens ?? 0) > AI_LIMITS.outputTokens
	) {
		throw errors.budget;
	}
	if (finishReason === "error") throw errors.provider;
}

function callSettings(
	model: ReturnType<ModelFactory>,
	prompt: string,
	abortSignal: AbortSignal,
) {
	return {
		model,
		prompt,
		abortSignal,
		maxOutputTokens: AI_LIMITS.outputTokens,
		maxRetries: 0,
		stopWhen: isStepCount(1),
		onWarning: () => {},
	};
}

async function run<T>(
	client: AiClient,
	prompt: string,
	options: RunOptions,
	execute: (
		settings: ReturnType<typeof callSettings>,
		markProgress: () => void,
	) => Promise<T>,
): Promise<AiResult<T>> {
	if (client.status === "unavailable") return client;

	const correlationId = withCorrelationId();
	const startedAt = performance.now();
	const deadline = AbortSignal.timeout(options.timeoutMs ?? defaultTimeoutMs());
	const signal = options.signal
		? AbortSignal.any([options.signal, deadline])
		: deadline;
	const fail = (error: AppError): AiResult<T> => {
		console.warn("AI execution ended", { correlationId, code: error.code });
		return {
			status: error === errors.cancelled ? "cancelled" : "failed",
			error: { ...error },
			correlationId,
		};
	};

	if (options.signal?.aborted) return fail(errors.cancelled);
	if (prompt.length > AI_LIMITS.inputCharacters) return fail(errors.inputLimit);

	let hasProgress = false;
	for (let attempt = 1; ; attempt++) {
		const model =
			attempt === 1 ? client.primary : (client.fallback ?? client.primary);
		try {
			signal.throwIfAborted();
			const data = await execute(callSettings(model, prompt, signal), () => {
				hasProgress = true;
			});
			signal.throwIfAborted();
			return {
				status: "completed",
				data,
				correlationId,
				durationMs: performance.now() - startedAt,
			};
		} catch (cause) {
			if (options.signal?.aborted) return fail(errors.cancelled);
			if (deadline.aborted) return fail(errors.timeout);

			const error = safeError(cause);
			if (!error.retryable || hasProgress || attempt === AI_LIMITS.modelCalls) {
				return fail(error);
			}
		}
	}
}

// Observe the provider response before SDK processing or output parsing can fail.
function trackGeneration(
	settings: ReturnType<typeof callSettings>,
	markProgress: () => void,
) {
	return wrapLanguageModel({
		model: settings.model,
		middleware: {
			specificationVersion: "v4",
			async wrapGenerate({ doGenerate }) {
				const result = await doGenerate();
				if (
					result.content.length > 0 ||
					(result.usage.outputTokens.total ?? 0) > 0
				) {
					markProgress();
				}
				return result;
			},
		},
	});
}

export function runText(
	client: AiClient,
	prompt: string,
	options: RunOptions = {},
) {
	return run(client, prompt, options, async (settings, markProgress) => {
		const result = await generateText({
			...settings,
			model: trackGeneration(settings, markProgress),
		});
		checkFinish(result.finishReason, result.usage.outputTokens);
		return result.text;
	});
}

export function runStream(
	client: AiClient,
	prompt: string,
	onChunk: (text: string) => void | Promise<void>,
	options: RunOptions = {},
) {
	return run(client, prompt, options, async (settings, markProgress) => {
		const { fullStream } = streamText({ ...settings, onError: () => {} });
		let finished = false;
		for await (const part of fullStream) {
			settings.abortSignal.throwIfAborted();
			if (part.type === "error") {
				// OpenRouter forwards in-band API errors as objects with a code.
				const cause = part.error;
				if (typeof cause === "object" && cause !== null && "code" in cause) {
					const code = Number(cause.code);
					if (
						code === 408 ||
						code === 409 ||
						code === 429 ||
						(code >= 500 && code < 600)
					) {
						throw errors.transient;
					}
				}
				throw cause;
			}
			if (part.type === "text-delta" && part.text) {
				markProgress();
				await onChunk(part.text);
			}
			if (part.type === "finish") {
				checkFinish(part.finishReason, part.totalUsage.outputTokens);
				finished = true;
			}
		}
		if (!finished) throw errors.invalidOutput;
		return null;
	});
}

export function runStructured(
	client: AiClient,
	prompt: string,
	options: RunOptions = {},
) {
	return run(client, prompt, options, async (settings, markProgress) => {
		const result = await generateText({
			...settings,
			model: trackGeneration(settings, markProgress),
			output: Output.object({ schema: summarySchema }),
		});
		checkFinish(result.finishReason, result.usage.outputTokens);
		return result.output;
	});
}

const sumInput = z.strictObject({
	left: z.number().int().min(-1_000_000).max(1_000_000),
	right: z.number().int().min(-1_000_000).max(1_000_000),
});

export function runTool(
	client: AiClient,
	prompt: string,
	options: RunOptions = {},
) {
	let toolCalls = 0;
	return run(client, prompt, options, async (settings, markProgress) => {
		const result = await generateText({
			...settings,
			toolChoice: { type: "tool", toolName: "sum" },
			tools: {
				sum: tool({
					description: "Add two bounded integers.",
					inputSchema: sumInput,
					execute: ({ left, right }) => {
						settings.abortSignal.throwIfAborted();
						if (toolCalls >= AI_LIMITS.toolCalls) throw errors.budget;
						toolCalls++;
						markProgress();
						return left + right;
					},
				}),
			},
		});

		checkFinish(result.finishReason, result.usage.outputTokens);
		if (result.toolCalls.length > AI_LIMITS.toolCalls) throw errors.budget;
		const sum = result.staticToolResults[0];
		if (!sum) throw errors.invalidOutput;
		return sum.output;
	});
}
