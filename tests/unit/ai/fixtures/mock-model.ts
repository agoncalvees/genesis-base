// MOCK — not a real execution
import { APICallError, simulateReadableStream } from "ai";
import type { MockLanguageModelV4 } from "ai/test";

type Generation = Awaited<ReturnType<MockLanguageModelV4["doGenerate"]>>;
type Stream = Awaited<ReturnType<MockLanguageModelV4["doStream"]>>["stream"];
type StreamPart = Stream extends ReadableStream<infer Part> ? Part : never;

export const mockEnv = {
	OPENROUTER_API_KEY: "MOCK-private-key",
	AI_MODEL_PRIMARY: "mock/primary",
};

export const usage = {
	inputTokens: { total: 8, noCache: 8, cacheRead: 0, cacheWrite: 0 },
	outputTokens: { total: 4, text: 4, reasoning: 0 },
};

export function response(
	content: Generation["content"],
	unified: Generation["finishReason"]["unified"] = "stop",
): Generation {
	return {
		content,
		finishReason: { unified, raw: unified },
		usage,
		warnings: [],
	};
}

export function textResponse(text = "Mock response"): Generation {
	return response([{ type: "text", text }]);
}

export function mockStream(chunks: StreamPart[]) {
	return {
		stream: simulateReadableStream({
			chunks,
			initialDelayInMs: null,
			chunkDelayInMs: null,
		}),
		warnings: [],
	};
}

export function sumCall(id: string): Generation["content"][number] {
	return {
		type: "tool-call",
		toolCallId: id,
		toolName: "sum",
		input: '{"left":2,"right":3}',
	};
}

export function providerError(isRetryable: boolean) {
	return new APICallError({
		message: mockEnv.OPENROUTER_API_KEY,
		url: "https://mock.invalid",
		requestBodyValues: { prompt: "MOCK-private-prompt" },
		responseHeaders: { Authorization: mockEnv.OPENROUTER_API_KEY },
		isRetryable,
	});
}
