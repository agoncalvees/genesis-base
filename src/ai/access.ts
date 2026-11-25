import "@tanstack/react-start/server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { getRequestIP } from "@tanstack/react-start/server";
import { createAppError, withCorrelationId } from "../core/errors";
import { hasViteDevServer } from "./vite-dev-server";

const WINDOW_MS = 60_000;
const PER_IDENTITY_LIMIT = 5;
const GLOBAL_LIMIT = 30;

// Shared across the four endpoints within this process. Serverless instances
// have independent counters and can reset them on cold start.
let windowEndsAt = 0;
let totalRequests = 0;
const requestsByIdentity = new Map<string, number>();

export function getAiIdentity(request: Request) {
	const expected = process.env.AI_ACCESS_TOKEN;
	const supplied = request.headers.get("x-genesis-ai-token");
	const suppliedDigest =
		supplied && createHash("sha256").update(supplied).digest();
	const validToken =
		expected?.trim() &&
		suppliedDigest &&
		timingSafeEqual(
			createHash("sha256").update(expected).digest(),
			suppliedDigest,
		);

	if (
		process.env.AI_ENDPOINTS_ENABLED !== "1" ||
		(!(import.meta.env.DEV && hasViteDevServer) && !validToken)
	) {
		return {
			status: "failed" as const,
			error: createAppError(
				"forbidden",
				"AI endpoint access is forbidden.",
				false,
			),
			correlationId: withCorrelationId(),
		};
	}

	return {
		status: "allowed" as const,
		tokenHash:
			validToken && suppliedDigest ? suppliedDigest.toString("hex") : undefined,
	};
}

export function consumeAiQuota(request: Request, tokenHash?: string) {
	const now = performance.now();
	if (now >= windowEndsAt) {
		windowEndsAt = now + WINDOW_MS;
		totalRequests = 0;
		requestsByIdentity.clear();
	}

	const vercelIp = request.headers.get("x-vercel-forwarded-for");
	const ip =
		process.env.VERCEL === "1" && vercelIp && isIP(vercelIp)
			? vercelIp
			: (getRequestIP() ?? "unknown");
	const identities = [`ip:${ip}`];
	if (tokenHash) identities.push(`token:${tokenHash}`);
	if (
		totalRequests >= GLOBAL_LIMIT ||
		identities.some(
			(key) => (requestsByIdentity.get(key) ?? 0) >= PER_IDENTITY_LIMIT,
		)
	) {
		return {
			status: "failed" as const,
			error: createAppError(
				"rate_limited",
				"AI request limit reached. Try again later.",
				true,
			),
			correlationId: withCorrelationId(),
		};
	}

	totalRequests++;
	for (const key of identities) {
		requestsByIdentity.set(key, (requestsByIdentity.get(key) ?? 0) + 1);
	}
}
