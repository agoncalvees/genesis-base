import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Heading } from "../../src/design-system/primitives/typography";

test("section heading opts into the theme size and preserves its semantic level", () => {
	render(
		<Heading level={3} variant="section">
			Resultados
		</Heading>,
	);
	const heading = screen.getByRole("heading", { level: 3, name: "Resultados" });
	expect(heading.className).toContain("--section-heading-size");
	expect(heading.className).not.toContain("text-ds-lg");
});
