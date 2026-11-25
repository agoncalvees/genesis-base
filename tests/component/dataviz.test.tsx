import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import {
	BarChart,
	Legend,
	LineChart,
	Sparkline,
} from "../../src/design-system/dataviz";

afterEach(cleanup);

const data = [
	{ label: "Source", value: -20 },
	{ label: "Final", value: 120 },
];

test.each([BarChart, LineChart, Sparkline])(
	"chart exposes the title, description and data table",
	(Chart) => {
		const { container } = render(
			<Chart
				title="Size by pass"
				description="Two synthetic passes"
				data={data}
				unit="KB"
			/>,
		);
		const image = screen.getByRole("img", { name: "Size by pass" });
		expect(image.getAttribute("viewBox")).toMatch(/^0 0 320 /);
		expect(image.getAttribute("aria-describedby")).toBe(
			image.querySelector("desc")?.id,
		);
		const table = screen.getByRole("table", { name: "Size by pass" });
		expect(
			within(table).getByRole("columnheader", { name: "Value (KB)" }),
		).toBeTruthy();
		expect(within(table).getByRole("cell", { name: "-20" })).toBeTruthy();
		expect(within(table).getByRole("cell", { name: "120" })).toBeTruthy();
		expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
	},
);

test("bars use nonnegative widths and a tokenized highlight", () => {
	const { container } = render(
		<BarChart title="Bars" data={data} highlightLast color={5} />,
	);
	const bars = container.querySelectorAll("rect");
	expect(bars).toHaveLength(2);
	expect([...bars].every((bar) => Number(bar.getAttribute("width")) > 0)).toBe(
		true,
	);
	expect(bars[1].getAttribute("fill")).toBe("var(--data-5)");
});

test("line renders an optional area and omits non-finite points", () => {
	const { container, rerender } = render(
		<LineChart title="Trend" data={data} area />,
	);
	expect(
		container.querySelector("path[fill-opacity]")?.getAttribute("d"),
	).toMatch(/Z$/);
	rerender(
		<LineChart
			title="Trend"
			data={[{ label: "Invalid", value: Infinity }]}
			area
		/>,
	);
	expect(container.querySelector("path[fill-opacity]")).toBeNull();
	expect(container.querySelector("desc")?.textContent).toBe("No data.");
});

test("legend displays labels alongside semantic swatches", () => {
	render(<Legend items={[{ label: "Output", color: 2 }]} />);
	expect(
		within(screen.getByRole("list", { name: "Chart legend" })).getByText(
			"Output",
		),
	).toBeTruthy();
});

test("chart exposes localized labels, description and values", () => {
	render(
		<BarChart
			title="Respostas"
			data={[{ label: "Equivalência", value: 1.5 }]}
			unit="pontos"
			locale="pt-BR"
			messages={{
				description: "Valores na tabela seguinte.",
				emptyDescription: "Sem dados.",
				label: "Habilidade",
				value: "Total",
			}}
		/>,
	);
	expect(screen.getByRole("img").getAttribute("aria-describedby")).toBe(
		screen.getByText("Valores na tabela seguinte.").id,
	);
	const table = screen.getByRole("table");
	expect(
		within(table).getByRole("columnheader", { name: "Habilidade" }),
	).toBeTruthy();
	expect(
		within(table).getByRole("columnheader", { name: "Total (pontos)" }),
	).toBeTruthy();
	expect(within(table).getByRole("cell", { name: "1,5" })).toBeTruthy();
});

test("bar charts can keep a common upper scale across changing data", () => {
	const { container, rerender } = render(
		<BarChart
			title="Acertos"
			data={[{ label: "Soma", value: 1 }]}
			maxValue={2}
		/>,
	);
	const width = Number(container.querySelector("rect")?.getAttribute("width"));
	rerender(
		<BarChart
			title="Acertos"
			data={[{ label: "Soma", value: 2 }]}
			maxValue={2}
		/>,
	);
	expect(Number(container.querySelector("rect")?.getAttribute("width"))).toBe(
		width * 2,
	);
});
