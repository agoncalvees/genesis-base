import {
	type CSSProperties,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	useRef,
	useState,
} from "react";
import { cn } from "../lib/cn";
import "../patterns/patterns.css";

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

/**
 * Two panels with a keyboard-resizable separator. Size is the start panel's
 * share in percent; persist it through `onSizeChange` (called on commit).
 */
export function ResizablePanels({
	start,
	end,
	label,
	defaultSize = 50,
	min = 20,
	max = 80,
	step = 5,
	onSizeChange,
	className,
}: {
	start: ReactNode;
	end: ReactNode;
	/** Accessible name of the separator, e.g. "Resize tools panel". */
	label: string;
	defaultSize?: number;
	min?: number;
	max?: number;
	step?: number;
	onSizeChange?: (size: number) => void;
	className?: string;
}) {
	const [size, setSize] = useState(() => clamp(defaultSize, min, max));
	const container = useRef<HTMLDivElement>(null);
	const dragging = useRef(false);

	function commit(next: number) {
		const value = clamp(Math.round(next), min, max);
		setSize(value);
		onSizeChange?.(value);
	}

	function onKeyDown(event: KeyboardEvent) {
		const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
		const forward = rtl ? "ArrowLeft" : "ArrowRight";
		const back = rtl ? "ArrowRight" : "ArrowLeft";
		const next =
			event.key === forward
				? size + step
				: event.key === back
					? size - step
					: event.key === "Home"
						? min
						: event.key === "End"
							? max
							: null;
		if (next == null) return;
		event.preventDefault();
		commit(next);
	}

	function fromPointer(event: PointerEvent) {
		const rect = container.current?.getBoundingClientRect();
		if (!rect?.width) return size;
		const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
		const offset = rtl ? rect.right - event.clientX : event.clientX - rect.left;
		return clamp((offset / rect.width) * 100, min, max);
	}

	return (
		<div
			ref={container}
			className={cn("ds-resizable", className)}
			style={{ "--panel-start": `${size}%` } as CSSProperties}
		>
			<div className="min-w-0 wrap-anywhere">{start}</div>
			{/* biome-ignore lint/a11y/useSemanticElements: a focusable separator widget has no native element. */}
			<div
				role="separator"
				tabIndex={0}
				aria-label={label}
				aria-orientation="vertical"
				aria-valuenow={size}
				aria-valuemin={min}
				aria-valuemax={max}
				className="ds-resizable-separator"
				onKeyDown={onKeyDown}
				onPointerDown={(event) => {
					dragging.current = true;
					event.currentTarget.setPointerCapture(event.pointerId);
				}}
				onPointerMove={(event) => {
					if (dragging.current) setSize(Math.round(fromPointer(event)));
				}}
				onPointerUp={(event) => {
					if (!dragging.current) return;
					dragging.current = false;
					commit(fromPointer(event));
				}}
				onPointerCancel={() => {
					dragging.current = false;
				}}
			/>
			<div className="min-w-0 wrap-anywhere">{end}</div>
		</div>
	);
}
