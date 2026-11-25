import "@tanstack/react-start/server-only";

import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { consumeAiQuota, getAiIdentity } from "./access";
import { type AiClient, createAiClient } from "./client";
import {
	AI_LIMITS,
	runStream,
	runStructured,
	runText,
	runTool,
} from "./operations";

const input = z.strictObject({
	prompt: z.string().min(1).max(AI_LIMITS.inputCharacters),
});

function withAiAccess<T>(run: (request: Request, client: AiClient) => T) {
	const request = getRequest();
	const identity = getAiIdentity(request);
	if (identity.status === "failed") return identity;

	const client = createAiClient();
	if (client.status === "available") {
		const failure = consumeAiQuota(request, identity.tokenHash);
		if (failure) return failure;
	}
	return run(request, client);
}

export const generateAiText = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) =>
		withAiAccess(({ signal }, client) =>
			runText(client, data.prompt, { signal }),
		),
	);

export const generateAiObject = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) =>
		withAiAccess(({ signal }, client) =>
			runStructured(client, data.prompt, { signal }),
		),
	);

export const callAiTool = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) =>
		withAiAccess(({ signal }, client) =>
			runTool(client, data.prompt, { signal }),
		),
	);

export const streamAiText = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) =>
		withAiAccess((request, client) => {
			const disconnect = new AbortController();
			const signal = AbortSignal.any([request.signal, disconnect.signal]);
			const encoder = new TextEncoder();
			const body = new ReadableStream<Uint8Array>({
				async start(controller) {
					const write = (event: unknown) => {
						if (!disconnect.signal.aborted) {
							controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
						}
					};

					const result = await runStream(
						client,
						data.prompt,
						(text) => write({ type: "chunk", text }),
						{ signal },
					);
					if (!disconnect.signal.aborted) {
						write({ type: "result", result });
						controller.close();
					}
				},
				cancel() {
					disconnect.abort();
				},
			});
			return new Response(body, {
				headers: {
					"Content-Type": "application/x-ndjson; charset=utf-8",
					"Cache-Control": "no-store",
				},
			});
		}),
	);
