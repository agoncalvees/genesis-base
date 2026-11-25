import { readdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/smoke"]) {
	test(`${path} serves and hydrates without errors`, async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") errors.push(message.text());
		});
		const response = await page.goto(path);
		expect(response?.status()).toBe(200);
		await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);
		expect(errors).toEqual([]);
	});
}

test("served client JavaScript excludes server credentials", async ({
	request,
}) => {
	const assets = await readdir(".output/public", { recursive: true });
	const scripts = assets.filter((asset) => asset.endsWith(".js"));
	expect(scripts.length).toBeGreaterThan(0);

	for (const script of scripts) {
		const response = await request.get(`/${script}`);
		expect(response.ok(), script).toBe(true);
		expect(response.headers()["content-type"], script).toMatch(/javascript/);
		const source = await response.text();
		expect(
			/OPENROUTER|openrouter\.ai|AI_MODEL_|AI_ACCESS_TOKEN|x-genesis-ai-token|sk-or-v1-/i.test(
				source,
			),
			script,
		).toBe(false);
	}
});
