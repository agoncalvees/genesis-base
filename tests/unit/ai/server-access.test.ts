import { MockLanguageModelV4 } from "ai/test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockEnv, textResponse } from "./fixtures/mock-model";

vi.mock("../../../src/ai/client", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../../../src/ai/client")>();
	return {
		...actual,
		createAiClient: () =>
			actual.createAiClient({
				modelFactory: () =>
					new MockLanguageModelV4({ doGenerate: textResponse() }),
			}),
	};
});

const requestState = vi.hoisted(() => ({
	headers: new Headers(),
	ip: "192.0.2.1",
	hasViteDevServer: false,
}));

vi.mock("../../../src/ai/vite-dev-server", () => ({
	get hasViteDevServer() {
		return requestState.hasViteDevServer;
	},
}));

// Vitest does not run the Start compiler. Capture the handlers and supply a
// request context so the tests exercise the actual guard at each entry point.
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		validator: () => ({
			handler: (handler: unknown) => handler,
		}),
	}),
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequest: () =>
		new Request("https://genesis.invalid/", { headers: requestState.headers }),
	getRequestIP: ({ xForwardedFor = false } = {}) =>
		(xForwardedFor && requestState.headers.get("x-forwarded-for")) ||
		requestState.ip,
}));

const input = { data: { prompt: "Hello" } };
const mockToken = "MOCK-private-access-token";
const forbidden = {
	status: "failed",
	error: { code: "forbidden", retryable: false },
};
const rateLimited = {
	status: "failed",
	error: { code: "rate_limited", retryable: true },
};

beforeEach(() => {
	vi.resetModules();
	vi.stubEnv("NODE_ENV", "production");
	vi.stubEnv("DEV", false);
	vi.stubEnv("VERCEL", undefined);
	vi.stubEnv("AI_MODEL_PRIMARY", mockEnv.AI_MODEL_PRIMARY);
	vi.stubEnv("AI_ENDPOINTS_ENABLED", undefined);
	vi.stubEnv("AI_ACCESS_TOKEN", mockToken);
	vi.stubEnv("OPENROUTER_API_KEY", undefined);
	requestState.headers = new Headers();
	requestState.ip = "192.0.2.1";
	requestState.hasViteDevServer = false;
});

afterEach(() => vi.unstubAllEnvs());

test("all four endpoints are disabled by default even with a valid token", async () => {
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText, generateAiObject, callAiTool, streamAiText } =
		await import("../../../src/ai/server");
	for (const endpoint of [
		generateAiText,
		generateAiObject,
		callAiTool,
		streamAiText,
	]) {
		expect(await endpoint(input)).toMatchObject(forbidden);
	}
});

test.each([undefined, "MOCK-wrong-access-token", "short"])(
	"rejects absent and invalid production tokens (%s)",
	async (suppliedToken) => {
		vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
		if (suppliedToken)
			requestState.headers.set("x-genesis-ai-token", suppliedToken);
		const { generateAiText } = await import("../../../src/ai/server");
		const result = await generateAiText(input);
		expect(result).toMatchObject(forbidden);
		expect(JSON.stringify(result)).not.toContain(mockToken);
	},
);

test("rejects access when the production token is unconfigured", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	vi.stubEnv("AI_ACCESS_TOKEN", undefined);
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText } = await import("../../../src/ai/server");
	expect(await generateAiText(input)).toMatchObject(forbidden);
});

test("accepts a matching production token", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText } = await import("../../../src/ai/server");
	expect(await generateAiText(input)).toMatchObject({ status: "unavailable" });
});

test.each([undefined, "prod", "test", "production"])(
	"requires a token outside Vite dev with NODE_ENV=%s",
	async (nodeEnv) => {
		vi.stubEnv("NODE_ENV", nodeEnv);
		vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
		const { generateAiText } = await import("../../../src/ai/server");
		expect(await generateAiText(input)).toMatchObject(forbidden);
	},
);

test("requires a token when Vite DEV is true in a build", async () => {
	vi.stubEnv("DEV", true);
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	const { generateAiText } = await import("../../../src/ai/server");
	expect(await generateAiText(input)).toMatchObject(forbidden);
});

test("allows enabled development endpoints without a token", async () => {
	vi.stubEnv("DEV", true);
	requestState.hasViteDevServer = true;
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	const { generateAiText } = await import("../../../src/ai/server");
	expect(await generateAiText(input)).toMatchObject({ status: "unavailable" });
});

const completed = { status: "completed" };

function enableMockProvider() {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	vi.stubEnv("OPENROUTER_API_KEY", mockEnv.OPENROUTER_API_KEY);
}

test.each([undefined, "1"])(
	"ignores spoofed X-Forwarded-For for IP quota (VERCEL=%s)",
	async (vercel) => {
		enableMockProvider();
		vi.stubEnv("DEV", true);
		requestState.hasViteDevServer = true;
		vi.stubEnv("VERCEL", vercel);
		const { generateAiText, streamAiText } = await import(
			"../../../src/ai/server"
		);
		for (let call = 1; call <= 5; call++) {
			requestState.headers.set("x-forwarded-for", `203.0.113.${call}`);
			requestState.headers.set(
				"x-vercel-forwarded-for",
				vercel ? "192.0.2.1" : `203.0.113.${call}`,
			);
			expect(await generateAiText(input)).toMatchObject(completed);
		}
		requestState.headers.set("x-forwarded-for", "203.0.113.6");
		expect(await streamAiText(input)).toMatchObject(rateLimited);

		if (vercel) requestState.headers.set("x-vercel-forwarded-for", "192.0.2.2");
		else requestState.ip = "192.0.2.2";
		expect(await generateAiText(input)).toMatchObject(completed);
	},
);

test("enforces the token quota across distinct IPs", async () => {
	enableMockProvider();
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText } = await import("../../../src/ai/server");
	for (let call = 1; call <= 5; call++) {
		requestState.ip = `192.0.2.${call}`;
		expect(await generateAiText(input)).toMatchObject(completed);
	}
	requestState.ip = "192.0.2.6";
	expect(await generateAiText(input)).toMatchObject(rateLimited);
});

test("limits aggregate requests across distinct IPs", async () => {
	enableMockProvider();
	vi.stubEnv("DEV", true);
	requestState.hasViteDevServer = true;
	const { generateAiText } = await import("../../../src/ai/server");
	for (let caller = 1; caller <= 30; caller++) {
		requestState.ip = `192.0.2.${caller}`;
		expect(await generateAiText(input)).toMatchObject(completed);
	}
	requestState.ip = "192.0.2.31";
	expect(await generateAiText(input)).toMatchObject(rateLimited);
});

test("does not charge unavailable operations against quota", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText, streamAiText } = await import(
		"../../../src/ai/server"
	);
	for (let call = 0; call < 31; call++) {
		expect(await generateAiText(input)).toMatchObject({
			status: "unavailable",
		});
	}
	const stream = await streamAiText(input);
	expect(stream).toBeInstanceOf(Response);
	if (!(stream instanceof Response))
		throw new Error("Expected NDJSON response");
	expect(JSON.parse(await stream.text())).toMatchObject({
		type: "result",
		result: { status: "unavailable" },
	});
	enableMockProvider();
	for (let call = 0; call < 5; call++) {
		expect(await generateAiText(input)).toMatchObject(completed);
	}
	expect(await generateAiText(input)).toMatchObject(rateLimited);
});

test("renews the quota after one minute", async () => {
	enableMockProvider();
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const clock = vi.spyOn(performance, "now").mockReturnValue(100);
	try {
		const { generateAiText } = await import("../../../src/ai/server");
		for (let call = 0; call < 5; call++) await generateAiText(input);
		clock.mockReturnValue(60_099);
		expect(await generateAiText(input)).toMatchObject(rateLimited);
		clock.mockReturnValue(60_100);
		expect(await generateAiText(input)).toMatchObject(completed);
	} finally {
		clock.mockRestore();
	}
});
