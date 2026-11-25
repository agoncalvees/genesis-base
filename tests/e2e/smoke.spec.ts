import { expect, test } from "@playwright/test";
import { appConfig } from "../../src/core/app-config";

test("serves the neutral home page", async ({ page }) => {
	const response = await page.goto("/");

	expect(response?.status()).toBe(200);
	await expect(page).toHaveTitle(appConfig.name);
	await expect(
		page.getByRole("heading", { name: appConfig.name }),
	).toBeVisible();
});

test("hydrates the smoke route without page errors", async ({ page }) => {
	const pageErrors: string[] = [];
	page.on("pageerror", (error) => pageErrors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error") pageErrors.push(message.text());
	});

	const response = await page.goto("/smoke");

	expect(response?.status()).toBe(200);
	await expect(page.getByRole("main")).toHaveAttribute("data-hydrated", "true");
	await expect(
		page.getByRole("heading", { name: `${appConfig.name} smoke` }),
	).toBeVisible();
	expect(pageErrors).toEqual([]);
});
