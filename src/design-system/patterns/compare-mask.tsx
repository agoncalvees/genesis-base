import {
	type ComponentProps,
	type CSSProperties,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	useCallback,
	useRef,
	useState,
} from "react";

export interface CompareMaskProps
	extends Omit<
		ComponentProps<"div">,
		"children" | "defaultValue" | "onChange"
	> {
	/** Layer shown where the mask is closed (start side). */
	before: ReactNode;
	/** Layer revealed from the end side as the value grows. */
	after: ReactNode;
	/** Percentage of the area showing `after` (0–100). Controlled when set. */
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	/** Accessible name of the slider handle. */
	label: string;
	/** Text announced for the current value. */
	valueText?: (value: number) => string;
	orientation?: "horizontal" | "vertical";
	/** Custom handle content; receives the current value. Styled by the product. */
	handle?: (value: number) => ReactNode;
	handleClassName?: string;
	disabled?: boolean;
}

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Headless before/after comparison: `after` is clipped over `before` and the
 * split is dragged directly on the surface or moved with the keyboard.
 * No text, color, frame or aspect ratio is imposed — size comes from the
 * container, and `--compare` (0–100%) is exposed for styling.
 */
export function CompareMask({
	before,
	after,
	value: controlled,
	defaultValue = 50,
	onValueChange,
	label,
	valueText = (value) => `${Math.round(value)}%`,
	orientation = "horizontal",
	handle,
	handleClassName,
	disabled = false,
	className,
	style,
	...props
}: CompareMaskProps) {
	const [internal, setInternal] = useState(clamp(defaultValue));
	const [dragging, setDragging] = useState(false);
	const root = useRef<HTMLDivElement>(null);
	const value = clamp(controlled ?? internal);
	const horizontal = orientation === "horizontal";

	const commit = useCallback(
		(next: number) => {
			const clamped = clamp(next);
			if (controlled === undefined) setInternal(clamped);
			onValueChange?.(clamped);
		},
		[controlled, onValueChange],
	);

	const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
		const box = root.current?.getBoundingClientRect();
		if (!box || box.width === 0 || box.height === 0) return;
		// `after` occupies the end side: value = distance from the end.
		const ratio = horizontal
			? (box.right - event.clientX) / box.width
			: (box.bottom - event.clientY) / box.height;
		commit(ratio * 100);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;
		const step = event.shiftKey ? 10 : 1;
		const keys: Record<string, number> = horizontal
			? { ArrowLeft: step, ArrowRight: -step, ArrowUp: step, ArrowDown: -step }
			: { ArrowUp: step, ArrowDown: -step, ArrowLeft: step, ArrowRight: -step };
		let next: number | undefined;
		if (event.key in keys) next = value + keys[event.key];
		else if (event.key === "PageUp") next = value + 10;
		else if (event.key === "PageDown") next = value - 10;
		else if (event.key === "Home") next = 0;
		else if (event.key === "End") next = 100;
		if (next === undefined) return;
		event.preventDefault();
		commit(next);
	};

	const split = 100 - value;
	return (
		<div
			{...props}
			ref={root}
			className={className}
			data-orientation={orientation}
			data-dragging={dragging || undefined}
			style={
				{
					position: "relative",
					isolation: "isolate",
					overflow: "hidden",
					touchAction: horizontal ? "pan-y" : "pan-x",
					"--compare": `${value}%`,
					...style,
				} as CSSProperties
			}
			onPointerDown={(event) => {
				if (disabled || event.button !== 0) return;
				event.currentTarget.setPointerCapture(event.pointerId);
				setDragging(true);
				fromPointer(event);
			}}
			onPointerMove={(event) => {
				if (dragging) fromPointer(event);
			}}
			onPointerUp={() => setDragging(false)}
			onPointerCancel={() => setDragging(false)}
		>
			<div style={{ position: "absolute", inset: 0 }}>{before}</div>
			<div
				data-compare-after=""
				style={{
					position: "absolute",
					inset: 0,
					clipPath: horizontal
						? `inset(0 0 0 ${split}%)`
						: `inset(${split}% 0 0 0)`,
				}}
			>
				{after}
			</div>
			<div
				role="slider"
				tabIndex={disabled ? -1 : 0}
				aria-label={label}
				aria-orientation={orientation}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(value)}
				aria-valuetext={valueText(value)}
				aria-disabled={disabled || undefined}
				className={handleClassName}
				onKeyDown={onKeyDown}
				style={{
					position: "absolute",
					...(horizontal
						? {
								top: 0,
								bottom: 0,
								left: `${split}%`,
								transform: "translateX(-50%)",
							}
						: {
								left: 0,
								right: 0,
								top: `${split}%`,
								transform: "translateY(-50%)",
							}),
				}}
			>
				{handle?.(value)}
			</div>
		</div>
	);
}
