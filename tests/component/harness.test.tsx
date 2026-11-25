import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("component project renders React in jsdom", () => {
	render(<button type="button">Harness</button>);
	expect(screen.getByRole("button", { name: "Harness" })).toBeTruthy();
});
