import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { type PitchStep, PitchTour } from "../../src/design-system";

afterEach(cleanup);

const flush = () =>
	act(async () => {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
	});

function Harness({ steps }: { steps: PitchStep[] }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Ver demonstração
			</button>
			<div id="target">alvo</div>
			<PitchTour steps={steps} open={open} onClose={() => setOpen(false)} />
		</>
	);
}

test("walks the steps, runs their actions and spotlights targets", async () => {
	Element.prototype.scrollIntoView = vi.fn();
	const enter = vi.fn();
	render(
		<Harness
			steps={[
				{ id: "dor", title: "A dor", target: "#target" },
				{ id: "demo", title: "A demo", enter },
				{ id: "fim", title: "O resultado" },
			]}
		/>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Ver demonstração" }));
	await flush();
	const dialog = screen.getByRole("dialog", { name: "Demonstração guiada" });
	expect(dialog.textContent).toContain("1 de 3");
	expect(screen.getByText("alvo").hasAttribute("data-pitch-active")).toBe(true);

	fireEvent.keyDown(window, { key: "PageDown" });
	await flush();
	expect(screen.getByRole("heading", { name: "A demo" })).toBeTruthy();
	expect(enter).toHaveBeenCalledTimes(1);
	expect(screen.getByText("alvo").hasAttribute("data-pitch-active")).toBe(
		false,
	);

	fireEvent.keyDown(window, { key: "ArrowLeft" });
	await flush();
	expect(screen.getByRole("heading", { name: "A dor" })).toBeTruthy();
});

test("the last step finishes, Esc closes and focus returns to the trigger", async () => {
	Element.prototype.scrollIntoView = vi.fn();
	render(<Harness steps={[{ id: "a", title: "Único passo" }]} />);
	const trigger = screen.getByRole("button", { name: "Ver demonstração" });
	trigger.focus();
	fireEvent.click(trigger);
	await flush();
	fireEvent.click(screen.getByRole("button", { name: "Explorar" }));
	expect(screen.queryByRole("dialog")).toBeNull();
	expect(document.activeElement).toBe(trigger);

	fireEvent.click(trigger);
	await flush();
	fireEvent.keyDown(window, { key: "Escape" });
	expect(screen.queryByRole("dialog")).toBeNull();
});

test("auto-advances for unattended demos", async () => {
	vi.useFakeTimers();
	const { rerender } = render(
		<PitchTour
			open={false}
			onClose={() => {}}
			autoAdvanceMs={1000}
			steps={[
				{ id: "a", title: "Primeiro" },
				{ id: "b", title: "Segundo" },
			]}
		/>,
	);
	rerender(
		<PitchTour
			open
			onClose={() => {}}
			autoAdvanceMs={1000}
			steps={[
				{ id: "a", title: "Primeiro" },
				{ id: "b", title: "Segundo" },
			]}
		/>,
	);
	expect(screen.getByRole("heading", { name: "Primeiro" })).toBeTruthy();
	act(() => {
		vi.advanceTimersByTime(1000);
	});
	expect(screen.getByRole("heading", { name: "Segundo" })).toBeTruthy();
	vi.useRealTimers();
});
