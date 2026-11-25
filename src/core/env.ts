/**
 * Server-safe capability detection.
 *
 * Reads only the explicitly supplied `env` record, never imports from
 * `features/`, `ai/`, `integrations/` or `studio/`, and never returns secret
 * values: the result contains booleans and reasons naming missing variables
 * only. A missing, empty or whitespace-only variable is reported as unavailable
 * instead of throwing.
 */

export type CapabilityStatus = {
	available: boolean;
	reason?: string;
};

export type Capabilities = {
	ai: CapabilityStatus;
	data: CapabilityStatus;
};

const AI_KEY = "OPENROUTER_API_KEY";
const AI_MODEL = "AI_MODEL_PRIMARY";
const DATA_URL = "VITE_CONVEX_URL";

function isPresent(
	env: Record<string, string | undefined>,
	name: string,
): boolean {
	const value = env[name];
	return typeof value === "string" && value.trim().length > 0;
}

function detect(
	env: Record<string, string | undefined>,
	names: readonly string[],
): CapabilityStatus {
	const missing = names.filter((name) => !isPresent(env, name));

	if (missing.length === 0) {
		return { available: true };
	}

	return { available: false, reason: `Missing ${missing.join(", ")}` };
}

export function getCapabilities(
	env: Record<string, string | undefined>,
): Capabilities {
	return {
		ai: detect(env, [AI_KEY, AI_MODEL]),
		data: detect(env, [DATA_URL]),
	};
}
