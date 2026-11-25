import { createMemoryHistory } from "@tanstack/react-router";
import { expect, test } from "vitest";
import { getRouter } from "../../src/router";

test("matches the smoke route in Node", async () => {
	const router = getRouter();
	router.update({
		history: createMemoryHistory({ initialEntries: ["/smoke"] }),
	});

	await router.load();

	expect(router.state.matches.at(-1)?.routeId).toBe("/smoke");
});
