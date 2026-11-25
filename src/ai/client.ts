import "@tanstack/react-start/server-only";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { getAiConfig, type Unavailable } from "./config";

export type ModelFactory = (modelId: string) => Exclude<LanguageModel, string>;

export type AiClient =
	| Unavailable
	| {
			status: "available";
			primary: ReturnType<ModelFactory>;
			fallback?: ReturnType<ModelFactory>;
	  };

export function createAiClient({
	env = process.env,
	modelFactory,
}: {
	env?: NodeJS.ProcessEnv;
	modelFactory?: ModelFactory;
} = {}): AiClient {
	const config = getAiConfig(env);
	if (config.status === "unavailable") return config;

	const model = modelFactory ?? openRouterModelFactory(env);
	return {
		status: "available",
		primary: model(config.primaryModel),
		fallback: config.fallbackModel ? model(config.fallbackModel) : undefined,
	};
}

function openRouterModelFactory(env: NodeJS.ProcessEnv): ModelFactory {
	const provider = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY?.trim() });
	return (modelId) => provider.chat(modelId);
}
