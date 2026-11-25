import { expect, test } from "@playwright/test";

for (const width of [360, 1440]) {
	test(`the first screen shows problem, promise and action at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 800 });
		await page.goto("/");
		for (const part of ["problem", "promise", "action"])
			await expect(page.locator(`[data-story=${part}]`)).toBeInViewport({
				ratio: 1,
			});
	});
}

test("?demo=1 opens the guided demo", async ({ page }) => {
	await page.goto("/?demo=1");
	await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
	await expect(
		page.getByRole("dialog", { name: "Demonstração em 60 segundos" }),
	).toBeVisible();
});
