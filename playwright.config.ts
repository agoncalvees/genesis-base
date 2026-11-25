import { defineConfig } from "@playwright/test";

const production = process.env.GENESIS_E2E_PROD === "1";
const port = process.env.PORT || "3000";
const baseURL = `http://127.0.0.1:${port}`;
// Cold CI runners compile dev modules on first request, so hydration can take
// longer than the 5 s default. No retries: flakes must stay visible.
const ci = process.env.CI === "true";

export default defineConfig({
	testDir: "tests/e2e",
	reporter: [["list"], ["html", { open: "never" }]],
	retries: 0,
	timeout: ci ? 60_000 : 30_000,
	expect: { timeout: ci ? 15_000 : 5_000 },
	use: { baseURL, browserName: "chromium", trace: "retain-on-failure" },
	projects: production
		? [
				{
					name: "production",
					testMatch: ["**/smoke.spec.ts", "**/production.spec.ts"],
				},
			]
		: [{ name: "development", testIgnore: "**/production.spec.ts" }],
	webServer: {
		command: production ? "node .output/server/index.mjs" : "bun run dev",
		env: production
			? { NITRO_HOST: "127.0.0.1", NITRO_PORT: port, NODE_ENV: "production" }
			: { PORT: port },
		url: baseURL,
	},
});
