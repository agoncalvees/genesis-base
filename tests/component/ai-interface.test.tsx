import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import {
	AiStatus,
	aiStatusMessage,
	Citation,
	PromptComposer,
	SourceList,
	StreamingText,
} from "../../src/design-system/patterns/ai-interface";

afterEach(cleanup);

function Composer({
	onSubmit = () => {},
	onCancel,
	running = false,
	initial = "",
}: {
	onSubmit?: (value: string) => void;
	onCancel?: () => void;
	running?: boolean;
	initial?: string;
}) {
	const [value, setValue] = useState(initial);
	return (
		<PromptComposer
			label="Prompt"
			value={value}
			onChange={setValue}
			onSubmit={onSubmit}
			onCancel={onCancel}
			running={running}
			maxLength={10}
		/>
	);
}

test("prompt composer submits with Mod+Enter and validates empty and over-limit input", async () => {
	const user = userEvent.setup();
	const onSubmit = vi.fn();
	render(<Composer onSubmit={onSubmit} />);
	const box = screen.getByRole("textbox", { name: "Prompt" });
	await user.click(screen.getByRole("button", { name: "Send" }));
	expect(screen.getByRole("alert").textContent).toBe("Enter a prompt.");
	expect(box.getAttribute("aria-invalid")).toBe("true");
	expect(onSubmit).not.toHaveBeenCalled();

	await user.type(box, "hello");
	await user.keyboard("{Control>}{Enter}{/Control}");
	expect(onSubmit).toHaveBeenCalledWith("hello");
	await user.keyboard("{Meta>}{Enter}{/Meta}");
	expect(onSubmit).toHaveBeenCalledTimes(2);

	await user.type(box, " world!!");
	expect(screen.getByRole("alert").textContent).toContain("at most 10");
	expect(screen.getByText("13 / 10 characters")).toBeTruthy();
	await user.keyboard("{Control>}{Enter}{/Control}");
	expect(onSubmit).toHaveBeenCalledTimes(2);
	expect(box.getAttribute("aria-describedby")).toContain(
		screen.getByText("13 / 10 characters").id,
	);
});

test("prompt composer exposes cancel while running and Esc cancels", async () => {
	const user = userEvent.setup();
	const onCancel = vi.fn();
	const onSubmit = vi.fn();
	render(
		<Composer running onCancel={onCancel} onSubmit={onSubmit} initial="hi" />,
	);
	expect(
		screen.getByRole("button", { name: "Send" }).hasAttribute("disabled"),
	).toBe(true);
	await user.click(screen.getByRole("button", { name: "Cancel" }));
	screen.getByRole("textbox", { name: "Prompt" }).focus();
	await user.keyboard("{Escape}");
	await user.keyboard("{Control>}{Enter}{/Control}");
	expect(onCancel).toHaveBeenCalledTimes(2);
	expect(onSubmit).not.toHaveBeenCalled();
});

test("streaming text is a polite live log, busy while streaming, with a cursor only when motion is allowed", () => {
	const { rerender, unmount } = render(<StreamingText text="Part" streaming />);
	const log = screen.getByRole("log", { name: "Response" });
	expect(log.getAttribute("aria-live")).toBe("polite");
	expect(log.getAttribute("aria-busy")).toBe("true");
	const cursor = log.querySelector(".ds-stream-cursor");
	expect(cursor?.getAttribute("aria-hidden")).toBe("true");
	expect(cursor?.hasAttribute("data-motion")).toBe(true);
	rerender(<StreamingText text="Part done." streaming={false} />);
	expect(log.getAttribute("aria-busy")).toBe("false");
	expect(log.querySelector(".ds-stream-cursor")).toBeNull();
	expect(log.textContent).toBe("Part done.");
	unmount();

	const matchMedia = vi.fn(() => ({ matches: true }));
	vi.stubGlobal("matchMedia", matchMedia);
	try {
		render(<StreamingText text="Part" streaming />);
		expect(
			screen
				.getByRole("log")
				.querySelector(".ds-stream-cursor")
				?.hasAttribute("data-motion"),
		).toBe(false);
		expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
	} finally {
		vi.unstubAllGlobals();
	}
});

test("citations link to evidence items and unsafe source links are dropped", () => {
	const text = "Alpha beta gamma.";
	const sources = [
		{
			id: "a",
			title: "First",
			href: "https://example.org/a",
			text,
			start: 6,
			end: 10,
		},
		{
			id: "b",
			title: "Second",
			href: "javascript:alert(1)",
			text,
			start: 0,
			end: 5,
		},
	];
	render(
		<>
			<Citation index={1} source={sources[0]} idPrefix="t" />
			<SourceList sources={sources} idPrefix="t" />
		</>,
	);
	const citation = screen.getByRole("link", { name: "Source 1: First" });
	expect(citation.getAttribute("href")).toBe("#t-a");
	const list = screen.getByRole("region", { name: "Sources" });
	expect(
		list.querySelector("#t-a")?.querySelector("mark")?.textContent,
	).toContain("beta");
	expect(
		within(list).getByRole("link", { name: "First" }).getAttribute("rel"),
	).toBe("noreferrer");
	expect(within(list).queryByRole("link", { name: "Second" })).toBeNull();
	expect(within(list).getByText("Second")).toBeTruthy();
});

test("AI status maps contract errors to messages and offers retry only when retryable", async () => {
	const user = userEvent.setup();
	const onRetry = vi.fn();
	const error = (code: string, retryable: boolean) => ({
		code,
		message: "raw",
		retryable,
	});
	expect(aiStatusMessage("unavailable")).toMatch(/not available/);
	expect(aiStatusMessage("failed", error("forbidden", false))).toMatch(
		/not enabled/,
	);
	expect(aiStatusMessage("failed", error("rate_limited", true))).toMatch(
		/Too many requests/,
	);
	expect(aiStatusMessage("failed", error("timeout", true))).toMatch(/too long/);
	expect(aiStatusMessage("cancelled")).toMatch(/cancelled/);
	expect(aiStatusMessage("failed", error("other", false))).toBe(
		"Something went wrong.",
	);

	const { rerender } = render(
		<AiStatus
			status="failed"
			error={error("timeout", true)}
			onRetry={onRetry}
		/>,
	);
	expect(screen.getByRole("status").textContent).not.toContain("raw");
	await user.click(screen.getByRole("button", { name: "Try again" }));
	expect(onRetry).toHaveBeenCalledOnce();
	rerender(
		<AiStatus
			status="failed"
			error={error("forbidden", false)}
			onRetry={onRetry}
		/>,
	);
	expect(screen.queryByRole("button")).toBeNull();
	rerender(<AiStatus status="unavailable" onRetry={onRetry} />);
	expect(screen.getByRole("status").textContent).toContain("Unavailable");
	expect(screen.queryByRole("button")).toBeNull();
});
