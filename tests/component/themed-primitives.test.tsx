import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import {
	Badge,
	Button,
	Card,
	Dialog,
	Field,
	Heading,
	IconButton,
	Input,
} from "../../src/design-system";

afterEach(cleanup);

test("themed primitives expose structural axes within their world", () => {
	render(
		<article data-world="fixture">
			<Card data-testid="panel">
				<Heading level={1}>Display</Heading>
				<Heading level={2}>Heading</Heading>
				<Button>Action</Button>
				<IconButton aria-label="Compact" size="sm">
					+
				</IconButton>
				<Field label="Field">
					<Input />
				</Field>
				<Badge>Badge</Badge>
			</Card>
		</article>,
	);
	expect(screen.getByTestId("panel").classList.contains("panel")).toBe(true);
	expect(
		screen
			.getByRole("heading", { name: "Display" })
			.classList.contains("font-ds-display"),
	).toBe(true);
	expect(
		screen
			.getByRole("heading", { name: "Heading" })
			.classList.contains("font-ds-heading"),
	).toBe(true);
	expect(
		screen
			.getByRole("button", { name: "Action" })
			.classList.contains("min-h-control"),
	).toBe(true);
	expect(
		screen
			.getByRole("button", { name: "Compact" })
			.classList.contains("size-control-sm"),
	).toBe(true);
	expect(
		screen
			.getByRole("textbox", { name: "Field" })
			.classList.contains("rounded-control"),
	).toBe(true);
	expect(screen.getByText("Badge").classList.contains("text-ds-xs")).toBe(true);
});

test("a dialog portal stays inside the trigger theme scope", async () => {
	render(
		<section data-world="fixture" data-theme="dark" aria-label="Scoped example">
			<Dialog
				trigger={<Button>Open</Button>}
				title="Scoped dialog"
				closeLabel="Close"
			/>
		</section>,
	);
	await userEvent.click(screen.getByRole("button", { name: "Open" }));
	const dialog = await screen.findByRole("dialog", { name: "Scoped dialog" });
	const scope = dialog.closest("[data-world]");
	expect(scope?.getAttribute("data-theme")).toBe("dark");
	expect(scope?.querySelector(".bg-dialog-scrim")).toBeTruthy();
});
