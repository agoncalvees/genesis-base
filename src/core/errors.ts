import type { AppError } from "./contracts";

/**
 * Server-safe error helpers. Non-AppError values are replaced by a fixed,
 * user-safe message: no stack traces, raw messages or other payloads escape.
 */

const SAFE_FALLBACK_MESSAGE = "An unexpected error occurred.";

export function createAppError(
	code: string,
	message: string,
	retryable: boolean,
): AppError {
	return { code, message, retryable };
}

export function isAppError(value: unknown): value is AppError {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.code === "string" &&
		typeof candidate.message === "string" &&
		typeof candidate.retryable === "boolean"
	);
}

export function normalizeError(value: unknown): AppError {
	if (isAppError(value)) {
		return value;
	}

	return { code: "unknown", message: SAFE_FALLBACK_MESSAGE, retryable: false };
}

/** Returns a fresh correlation id for redacted technical logs. */
export function withCorrelationId(): string {
	return globalThis.crypto.randomUUID();
}
