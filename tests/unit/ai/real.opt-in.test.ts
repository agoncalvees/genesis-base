import { expect, test } from "vitest";
import { createAiClient } from "../../../src/ai/client";
import {
	runStream,
	runStructured,
	runText,
	runTool,
} from "../../../src/ai/operations";

test.skipIf(process.env.GENESIS_REAL_AI !== "1")(
	"@real OpenRouter validates the four AI operations on each configured model",
	async () => {
		const configured = createAiClient();
		if (configured.status === "unavailable") throw new Error(configured.reason);
		const models = [configured.primary, configured.fallback].filter(
			(model) => model !== undefined,
		);
		for (const primary of models) {
			const client = { status: "available", primary } as const;
			expect(
				await runText(client, "Reply with the word Genesis."),
			).toMatchObject({
				status: "completed",
				data: expect.stringMatching(/Genesis/i),
			});

			const chunks: string[] = [];
			const streamed = await runStream(
				client,
				"Reply with the word Genesis.",
				(text) => {
					chunks.push(text);
				},
			);
			expect(streamed.status).toBe("completed");
			expect(chunks.join("")).toMatch(/Genesis/i);

			expect(
				await runStructured(
					client,
					'Summarize the sentence "The sky is blue."',
				),
			).toMatchObject({
				status: "completed",
				data: { summary: expect.any(String) },
			});
			expect(
				await runTool(client, "Use the sum tool to add 2 and 3."),
			).toMatchObject({
				status: "completed",
				data: 5,
			});
		}
	},
	130_000,
);
