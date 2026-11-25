import {
	act,
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, test, vi } from "vitest";
import {
	Badge,
	Button,
	Card,
	Checkbox,
	Code,
	Container,
	Dialog,
	Field,
	Grid,
	Heading,
	IconButton,
	Input,
	Popover,
	Progress,
	Select,
	Skeleton,
	Spinner,
	Stack,
	Switch,
	Tabs,
	Text,
	Textarea,
	ToastProvider,
	Tooltip,
	useToast,
} from "../../src/design-system";

afterEach(cleanup);

test("Button safely disables loading interactions and IconButton has a name", async () => {
	const click = vi.fn();
	render(
		<>
			<Button loading onClick={click}>
				Save
			</Button>
			<IconButton aria-label="Close">×</IconButton>
		</>,
	);
	const button = screen.getByRole("button", { name: "Save" });
	expect(button.getAttribute("aria-busy")).toBe("true");
	await userEvent.click(button);
	expect(click).not.toHaveBeenCalled();
	expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
});

test("a submit button can stay disabled from SSR until hydration", async () => {
	const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
		event.preventDefault(),
	);
	const form = (
		<form onSubmit={onSubmit}>
			<Button type="submit" requireHydration>
				Save
			</Button>
			<Button>Cancel</Button>
		</form>
	);
	const container = document.createElement("div");
	container.innerHTML = renderToString(form);
	document.body.append(container);
	const submit = within(container).getByRole<HTMLButtonElement>("button", {
		name: "Save",
	});
	expect(submit.disabled).toBe(true);
	expect(
		within(container).getByRole<HTMLButtonElement>("button", { name: "Cancel" })
			.disabled,
	).toBe(false);
	await userEvent.click(submit);
	expect(onSubmit).not.toHaveBeenCalled();

	const root = hydrateRoot(container, form);
	try {
		await waitFor(() => expect(submit.disabled).toBe(false));
		await userEvent.click(submit);
		expect(onSubmit).toHaveBeenCalledOnce();
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});

test("Field connects Input and Textarea to labels, help and text errors", async () => {
	render(
		<>
			<Field label="Label" description="Description" error="Enter a value">
				<Input id="example-input" />
			</Field>
			<Field label="Notes" description="Optional details">
				<Textarea />
			</Field>
		</>,
	);
	const field = screen.getByRole("textbox", {
		name: "Label",
		description: "Description Enter a value",
	});
	expect(field.getAttribute("aria-invalid")).toBe("true");
	await userEvent.click(screen.getByText("Label"));
	expect(document.activeElement).toBe(field);
	expect(
		screen.getByRole("textbox", {
			name: "Notes",
			description: "Optional details",
		}),
	).toBeTruthy();
});

test("Select has a field name and accepts an option by keyboard", async () => {
	const user = userEvent.setup();
	render(
		<Field label="Choice">
			<Select
				defaultValue="a"
				options={[
					{ value: "a", label: "Option A" },
					{ value: "b", label: "Option B" },
				]}
			/>
		</Field>,
	);
	await user.tab();
	expect(document.activeElement).toBe(
		screen.getByRole("combobox", { name: "Choice" }),
	);
	await user.keyboard("[Space]");
	const first = await screen.findByRole("option", { name: "Option A" });
	await waitFor(() => {
		expect(first.hasAttribute("data-highlighted")).toBe(true);
		expect(document.activeElement).toBe(first);
	});
	await user.keyboard("[ArrowDown]");
	const second = screen.getByRole("option", { name: "Option B" });
	await waitFor(() => {
		expect(second.hasAttribute("data-highlighted")).toBe(true);
		expect(document.activeElement).toBe(second);
	});
	await user.keyboard("[Enter]");
	expect(
		screen.getByRole("combobox", { name: "Choice" }).textContent,
	).toContain("Option B");
});

test("Checkbox and Switch accept Space and expose checked state", async () => {
	const user = userEvent.setup();
	render(
		<>
			<Field label="Check">
				<Checkbox />
			</Field>
			<Field label="Toggle">
				<Switch />
			</Field>
		</>,
	);
	await user.tab();
	await user.keyboard("[Space]");
	expect(
		screen.getByRole("checkbox", { name: "Check", checked: true }),
	).toBeTruthy();
	await user.tab();
	await user.keyboard("[Space]");
	expect(
		screen.getByRole("switch", { name: "Toggle", checked: true }),
	).toBeTruthy();
});

test("Container, Stack, Grid and Card compose semantic Typography and Badge", () => {
	render(
		<Container id="container">
			<Stack id="stack">
				<Grid id="grid">
					<Card id="card">
						<Heading level={3}>Title</Heading>
						<Text>
							Description <Code>value</Code>
						</Text>
						<Badge>Ready</Badge>
					</Card>
				</Grid>
			</Stack>
		</Container>,
	);
	for (const id of ["container", "stack", "grid", "card"])
		expect(document.getElementById(id)).toBeTruthy();
	const card = within(document.getElementById("card") as HTMLElement);
	expect(card.getByRole("heading", { level: 3, name: "Title" })).toBeTruthy();
	expect(card.getByText("Description").tagName).toBe("P");
	expect(card.getByText("value").tagName).toBe("CODE");
	expect(card.getByText("Ready")).toBeTruthy();
});

test("Spinner has a status, Skeleton stays hidden and Progress exposes both modes", () => {
	render(
		<>
			<Spinner label="Loading" />
			<Skeleton data-testid="skeleton" />
			<Progress label="Complete" value={40} />
			<Progress label="Working" value={null} />
		</>,
	);
	expect(screen.getByRole("status").textContent).toBe("Loading");
	expect(screen.getByTestId("skeleton").getAttribute("aria-hidden")).toBe(
		"true",
	);
	expect(
		screen
			.getByRole("progressbar", { name: "Complete" })
			.getAttribute("aria-valuenow"),
	).toBe("40");
	expect(
		screen
			.getByRole("progressbar", { name: "Working" })
			.hasAttribute("aria-valuenow"),
	).toBe(false);
});

test("Dialog names the popup and restores focus after Escape", async () => {
	const user = userEvent.setup();
	render(
		<Dialog
			trigger={<Button>Open dialog</Button>}
			title="Dialog title"
			closeLabel="Close"
		>
			Content
		</Dialog>,
	);
	await user.tab();
	await user.keyboard("[Enter]");
	expect(
		await screen.findByRole("dialog", { name: "Dialog title" }),
	).toBeTruthy();
	await user.keyboard("[Escape]");
	expect(screen.queryByRole("dialog")).toBeNull();
	expect(document.activeElement).toBe(
		screen.getByRole("button", { name: "Open dialog" }),
	);
});

test("Popover opens from the keyboard and has a title", async () => {
	const user = userEvent.setup();
	render(
		<Popover trigger={<Button>Open popover</Button>} title="Popover title">
			Content
		</Popover>,
	);
	await user.tab();
	await user.keyboard("[Enter]");
	expect(
		await screen.findByRole("dialog", { name: "Popover title" }),
	).toBeTruthy();
	await user.keyboard("[Escape]");
	expect(screen.queryByRole("dialog")).toBeNull();
});

test("Tooltip appears on keyboard focus", async () => {
	render(<Tooltip trigger={<Button>Trigger</Button>}>Hint</Tooltip>);
	await userEvent.tab();
	expect((await screen.findByRole("tooltip")).textContent).toBe("Hint");
});

test("Tabs support keyboard navigation and activation", async () => {
	const user = userEvent.setup();
	render(
		<Tabs
			label="Views"
			items={[
				{ value: "first", label: "First", content: "One" },
				{ value: "second", label: "Second", content: "Two" },
			]}
		/>,
	);
	await user.tab();
	await user.keyboard("[ArrowRight][Enter]");
	expect(
		screen.getByRole("tab", { name: "Second", selected: true }),
	).toBeTruthy();
	expect(screen.getByRole("tabpanel", { name: "Second" }).textContent).toBe(
		"Two",
	);
});

function ShowToast() {
	const toast = useToast();
	return (
		<Button onClick={() => toast.add({ title: "Notice", timeout: 0 })}>
			Notify
		</Button>
	);
}

test("Toast exposes the notification and a named dismiss action", async () => {
	render(
		<ToastProvider dismissLabel="Dismiss">
			<ShowToast />
		</ToastProvider>,
	);
	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: "Notify" }));
	expect((await screen.findAllByText("Notice")).length).toBeGreaterThan(0);
	await user.click(screen.getByRole("button", { name: "Dismiss" }));
	expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
});

test("Server markup exposes names and field errors before hydration", () => {
	const container = document.createElement("div");
	container.innerHTML = renderToString(
		<>
			<Field label="Check" description="Description" error="Check is required">
				<Checkbox />
			</Field>
			<Field label="Toggle">
				<Switch />
			</Field>
			<Progress label="Working" />
		</>,
	);
	document.createDocumentFragment().append(container);
	const server = within(container);
	expect(
		server
			.getByRole("checkbox", {
				name: "Check",
				description: "Description Check is required",
			})
			.getAttribute("aria-invalid"),
	).toBe("true");
	expect(server.getByRole("switch", { name: "Toggle" })).toBeTruthy();
	expect(server.getByRole("progressbar", { name: "Working" })).toBeTruthy();
});
