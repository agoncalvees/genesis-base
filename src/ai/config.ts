import "@tanstack/react-start/server-only";

import { getCapabilities } from "../core/env";

export type Unavailable = { status: "unavailable"; reason: string };

export type AiConfig =
	| Unavailable
	| { status: "available"; primaryModel: string; fallbackModel?: string };

export function getAiConfig(env = process.env): AiConfig {
	const { ai } = getCapabilities(env);
	const primaryModel = env.AI_MODEL_PRIMARY?.trim();
	if (!ai.available || !primaryModel) {
		return { status: "unavailable", reason: ai.reason ?? "AI is unavailable." };
	}

	return {
		status: "available",
		primaryModel,
		fallbackModel: env.AI_MODEL_FALLBACK?.trim() || undefined,
	};
}
