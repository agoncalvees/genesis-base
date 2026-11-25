import { useLayoutEffect, useRef } from "react";

type Point = { x: number; y: number };
type Label = Point & { key: string; text: string; kind: "axis" | "value" };
type Box = { left: number; top: number; right: number; bottom: number };

function intersects(a: Box, b: Box) {
	return (
		a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
	);
}

function touchesLine(box: Box, line: Point[]) {
	return line.some((point, index) => {
		const next = line[index + 1];
		if (!next || point.x > box.right || next.x < box.left) return false;
		const yAt = (x: number) =>
			point.y + ((next.y - point.y) * (x - point.x)) / (next.x - point.x);
		const first = yAt(Math.max(box.left, point.x));
		const last = yAt(Math.min(box.right, next.x));
		return (
			Math.min(first, last) <= box.bottom && Math.max(first, last) >= box.top
		);
	});
}

export function TrendLabels({
	labels,
	points,
	height,
}: {
	labels: Label[];
	points: Point[];
	height: number;
}) {
	const overlay = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const element = overlay.current;
		if (!element) return;
		const place = () => {
			const { width, height: blockSize } = element.getBoundingClientRect();
			if (!width || !blockSize) return;
			const line = points.map(({ x, y }) => ({
				x: (x / 320) * width,
				y: (y / height) * blockSize,
			}));
			const elements = Array.from(element.querySelectorAll("span"));
			const sizes = elements.map((label) => label.getBoundingClientRect());
			const occupied: Box[] = [];
			for (const [index, label] of labels.entries()) {
				const { width: labelWidth, height: labelHeight } = sizes[index];
				const anchorX = (label.x / 320) * width;
				const anchorY = (label.y / height) * blockSize;
				const left = Math.max(
					6,
					Math.min(anchorX - labelWidth / 2, width - labelWidth - 6),
				);
				const candidates =
					label.kind === "axis"
						? [anchorY]
						: [
								anchorY - labelHeight - 10,
								anchorY + 10,
								anchorY - labelHeight - 23,
								anchorY + 23,
							];
				const fit = candidates.find((top) => {
					const box = {
						left: left - 4,
						top: top - 3,
						right: left + labelWidth + 4,
						bottom: top + labelHeight + 3,
					};
					return (
						box.left >= 0 &&
						box.right <= width &&
						box.top >= 0 &&
						box.bottom <= blockSize &&
						!occupied.some((other) => intersects(box, other)) &&
						(label.kind === "axis" || !touchesLine(box, line))
					);
				});
				const node = elements[index];
				node.style.visibility = fit === undefined ? "hidden" : "visible";
				if (fit === undefined) continue;
				node.style.left = `${left}px`;
				node.style.top = `${fit}px`;
				occupied.push({
					left,
					top: fit,
					right: left + labelWidth,
					bottom: fit + labelHeight,
				});
			}
		};
		place();
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(place);
		observer.observe(element);
		for (const node of element.querySelectorAll("span")) observer.observe(node);
		return () => observer.disconnect();
	}, [height, labels, points]);

	return (
		<div className="ds-trend-labels" ref={overlay} aria-hidden="true">
			{labels.map(({ key, text, kind }) => (
				<span key={key} data-chart-label={kind}>
					{text}
				</span>
			))}
		</div>
	);
}
