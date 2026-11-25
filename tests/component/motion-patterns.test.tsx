import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import {
	AnimatedNumber,
	AnimatedTabsIndicator,
	Expandable,
	MotionProvider,
} from "../../src/design-system";

afterEach(cleanup);

test("formats the target value with Intl", () => {
	render(
		<MotionProvider>
			<AnimatedNumber
				value={12345.6}
				locale="de-DE"
				format={{ minimumFractionDigits: 1 }}
			/>
		</MotionProvider>,
	);

	expect(screen.getAllByText("12.345,6")).toHaveLength(2);
});

test("animated tabs retain keyboard selection and the expandable uses a native disclosure", async () => {
	const user = userEvent.setup();
	render(
		<>
			<AnimatedTabsIndicator
				label="Views"
				items={[
					{ value: "first", label: "First", content: "First panel" },
					{ value: "second", label: "Second", content: "Second panel" },
				]}
			/>
			<Expandable label="Show notes">Public notes</Expandable>
		</>,
	);
	screen.getByRole("tab", { name: "First" }).focus();
	await user.keyboard("{ArrowRight}{Enter}");
	expect(screen.getByRole("tab", { selected: true }).textContent).toBe(
		"Second",
	);
	expect(screen.getByRole("tabpanel").textContent).toBe("Second panel");
	await user.click(screen.getByText("Show notes"));
	expect(screen.getByText("Show notes").closest("details")?.open).toBe(true);
});
