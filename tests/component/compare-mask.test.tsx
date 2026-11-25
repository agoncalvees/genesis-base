import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { CompareMask } from "../../src/design-system";

afterEach(cleanup);

test("exposes an accessible slider with localized value text", () => {
	render(
		<CompareMask
			label="Comparação com e sem aceiros"
			valueText={(value) => `${Math.round(value)}% com aceiros`}
			before={<span>sem</span>}
			after={<span>com</span>}
		/>,
	);
	const slider = screen.getByRole("slider", {
		name: "Comparação com e sem aceiros",
	});
	expect(slider.getAttribute("aria-valuenow")).toBe("50");
	expect(slider.getAttribute("aria-valuetext")).toBe("50% com aceiros");
	expect(screen.getByText("sem")).toBeTruthy();
	expect(screen.getByText("com")).toBeTruthy();
});

test("moves with arrows, page keys, Home and End and clamps to 0–100", () => {
	const onValueChange = vi.fn();
	render(
		<CompareMask
			label="Comparar"
			defaultValue={98}
			onValueChange={onValueChange}
			before="a"
			after="b"
		/>,
	);
	const slider = screen.getByRole("slider", { name: "Comparar" });
	fireEvent.keyDown(slider, { key: "ArrowLeft" });
	expect(slider.getAttribute("aria-valuenow")).toBe("99");
	fireEvent.keyDown(slider, { key: "ArrowLeft", shiftKey: true });
	expect(slider.getAttribute("aria-valuenow")).toBe("100");
	fireEvent.keyDown(slider, { key: "PageDown" });
	expect(slider.getAttribute("aria-valuenow")).toBe("90");
	fireEvent.keyDown(slider, { key: "Home" });
	expect(slider.getAttribute("aria-valuenow")).toBe("0");
	fireEvent.keyDown(slider, { key: "End" });
	expect(onValueChange).toHaveBeenLastCalledWith(100);
});

test("clips the after layer from the end side and exposes --compare", () => {
	const { container } = render(
		<CompareMask label="Comparar" defaultValue={30} before="a" after="b" />,
	);
	const root = container.firstElementChild as HTMLElement;
	expect(root.style.getPropertyValue("--compare")).toBe("30%");
	const after = container.querySelector<HTMLElement>("[data-compare-after]");
	expect(after?.style.clipPath).toMatch(/inset\(0(px)? 0(px)? 0(px)? 70%\)/);
});

function Controlled() {
	const [value, setValue] = useState(20);
	return (
		<>
			<CompareMask
				label="Comparar"
				value={value}
				onValueChange={setValue}
				before="a"
				after="b"
			/>
			<CompareMask label="Bloqueado" disabled before="a" after="b" />
		</>
	);
}

test("supports controlled use and disabled state", () => {
	render(<Controlled />);
	const slider = screen.getByRole("slider", { name: "Comparar" });
	fireEvent.keyDown(slider, { key: "ArrowUp" });
	expect(slider.getAttribute("aria-valuenow")).toBe("21");
	const locked = screen.getByRole("slider", { name: "Bloqueado" });
	expect(locked.getAttribute("tabindex")).toBe("-1");
	fireEvent.keyDown(locked, { key: "End" });
	expect(locked.getAttribute("aria-valuenow")).toBe("50");
});
