import { type ReactNode, useId } from "react";
import { TrendLabels } from "./trend-labels";
import "./charts.css";

export type DataColor = 1 | 2 | 3 | 4 | 5 | 6;
/** A series uses one unique label per datum. */
export type ChartDatum = { label: string; value: number };
const defaultChartMessages = {
	description: "Values in the adjacent data table.",
	emptyDescription: "No data.",
	label: "Label",
	value: "Value",
};

type ChartProps = {
	title: string;
	description?: string;
	data: readonly ChartDatum[];
	unit?: string;
	color?: DataColor;
	locale?: string;
	messages?: typeof defaultChartMessages;
};

function ChartFrame({
	title,
	description,
	data,
	unit,
	locale,
	messages = defaultChartMessages,
	viewBox,
	labels,
	stretch = false,
	className,
	children,
}: ChartProps & {
	viewBox: string;
	labels?: ReactNode;
	stretch?: boolean;
	className?: string;
	children: ReactNode;
}) {
	const id = useId();
	return (
		<figure className={className ? `ds-chart ${className}` : "ds-chart"}>
			<svg
				role="img"
				aria-labelledby={`${id}-title`}
				aria-describedby={`${id}-description`}
				viewBox={viewBox}
				preserveAspectRatio={stretch ? "none" : undefined}
			>
				<title id={`${id}-title`}>{title}</title>
				<desc id={`${id}-description`}>
					{description ??
						(data.length ? messages.description : messages.emptyDescription)}
				</desc>
				{children}
			</svg>
			{labels}
			<table className="sr-only">
				<caption>{title}</caption>
				<thead>
					<tr>
						<th scope="col">{messages.label}</th>
						<th scope="col">
							{unit ? `${messages.value} (${unit})` : messages.value}
						</th>
					</tr>
				</thead>
				<tbody>
					{data.map(({ label, value }) => (
						<tr key={label}>
							<th scope="row">{label}</th>
							<td>{formatValue(value, locale)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</figure>
	);
}

function formatValue(value: number, locale?: string) {
	return locale
		? value.toLocaleString(locale, { maximumSignificantDigits: 21 })
		: String(value);
}

function bounds(data: readonly ChartDatum[], maxValue = 0) {
	let min = 0;
	let max = Number.isFinite(maxValue) ? Math.max(maxValue, 0) : 0;
	for (const { value } of data) {
		min = Math.min(min, value);
		max = Math.max(max, value);
	}
	const magnitude = Math.max(Math.abs(min), max) || 1;
	const scaledMin = min / magnitude;
	const range = max / magnitude - scaledMin || 1;
	return (value: number) => (value / magnitude - scaledMin) / range;
}

function finite(data: readonly ChartDatum[]) {
	return data.filter(({ value }) => Number.isFinite(value));
}

export function BarChart({
	highlightLast = false,
	maxValue,
	...props
}: ChartProps & { highlightLast?: boolean; maxValue?: number }) {
	const data = finite(props.data);
	const scale = bounds(data, maxValue);
	const origin = 24;
	const width = 272;
	const zero = origin + width * scale(0);
	return (
		<ChartFrame
			{...props}
			data={data}
			viewBox={`0 0 320 ${Math.max(46, data.length * 46)}`}
			className="ds-bar-chart"
			stretch
			labels={
				data.length > 0 && (
					<div className="ds-bar-labels" aria-hidden="true">
						{data.map(({ label, value }) => (
							<div key={label}>
								<span data-chart-label="axis">{label}</span>
								<span data-chart-label="value">
									{formatValue(value, props.locale)}
									{props.unit ? ` ${props.unit}` : ""}
								</span>
							</div>
						))}
					</div>
				)
			}
		>
			{data.map(({ label, value }, index) => {
				const end = origin + width * scale(value);
				const y = index * 46 + 4;
				const color =
					highlightLast && index < data.length - 1
						? "var(--data-axis)"
						: `var(--data-${props.color ?? 1})`;
				return (
					<g key={label}>
						<path
							d={`M${origin} ${y + 27}H${origin + width}`}
							className="ds-chart-grid"
						/>
						<rect
							x={Math.min(zero, end)}
							y={y + 19}
							width={Math.abs(end - zero)}
							height={16}
							fill={color}
						/>
					</g>
				);
			})}
		</ChartFrame>
	);
}

function Trend({
	area = false,
	small = false,
	showValues = false,
	...props
}: ChartProps & { area?: boolean; small?: boolean; showValues?: boolean }) {
	const data = finite(props.data);
	const scale = bounds(data);
	const height = small ? 56 : 140;
	const top = showValues ? 39 : 18;
	const plotHeight = height - top - 12;
	const points = data.map(({ value }, index) => ({
		x: data.length === 1 ? 160 : 24 + (272 * index) / (data.length - 1),
		y: top + plotHeight * (1 - scale(value)),
	}));
	const line = points
		.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x},${y}`)
		.join(" ");
	const color = `var(--data-${props.color ?? 1})`;
	const baseline = top + plotHeight * (1 - scale(0));
	const axisLabels = points.flatMap(({ x }, index) =>
		data.length <= 5 || index === 0 || index === data.length - 1
			? [
					{
						key: `axis-${data[index].label}`,
						text: data[index].label,
						kind: "axis" as const,
						x,
						y: height,
					},
				]
			: [],
	);
	const valueLabels = showValues
		? points.flatMap(({ x, y }, index) =>
				data.length <= 5 || index === 0 || index === data.length - 1
					? [
							{
								key: `value-${data[index].label}`,
								text: formatValue(data[index].value, props.locale),
								kind: "value" as const,
								x,
								y,
							},
						]
					: [],
			)
		: [];
	const frameHeight = small ? height : height + 27;
	return (
		<ChartFrame
			{...props}
			data={data}
			viewBox={`0 0 320 ${frameHeight}`}
			stretch={!small}
			className={small ? undefined : "ds-trend-chart"}
			labels={
				!small && (
					<TrendLabels
						labels={[...axisLabels, ...valueLabels]}
						points={points}
						height={frameHeight}
					/>
				)
			}
		>
			{!small &&
				[top, height / 2, height - 12].map((y) => (
					<path key={y} d={`M24 ${y}H296`} className="ds-chart-grid" />
				))}
			{area && points.length > 1 && (
				<path
					d={`${line} L${points.at(-1)?.x},${baseline} L${points[0].x},${baseline}Z`}
					fill={color}
					fillOpacity={0.16}
				/>
			)}
			<path
				d={line}
				stroke={color}
				className={small ? "ds-chart-line ds-chart-draw" : "ds-chart-line"}
				pathLength={small ? 1 : undefined}
				fill="none"
			/>
			{(!small || points.length === 1) &&
				points.map(({ x, y }, index) => (
					<circle key={data[index].label} cx={x} cy={y} r={2.5} fill={color} />
				))}
		</ChartFrame>
	);
}

export function LineChart(
	props: ChartProps & { area?: boolean; showValues?: boolean },
) {
	return <Trend {...props} />;
}

export function Sparkline(props: ChartProps) {
	return <Trend {...props} small />;
}

export function Legend({
	items,
	label = "Chart legend",
}: {
	items: readonly { label: string; color: DataColor }[];
	label?: string;
}) {
	return (
		<ul aria-label={label} className="ds-chart-legend">
			{items.map(({ label, color }) => (
				<li key={label}>
					<span
						aria-hidden="true"
						style={{ background: `var(--data-${color})` }}
					/>
					{label}
				</li>
			))}
		</ul>
	);
}
