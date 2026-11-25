import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { cn } from "../lib/cn";
import { type MotionDuration, readMotionTiming } from "./presets";

const query = "(prefers-reduced-motion: reduce)";

function subscribeToPreference(onChange: () => void) {
	const preference = window.matchMedia?.(query);
	preference?.addEventListener("change", onChange);
	return () => preference?.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
	return window.matchMedia?.(query).matches ?? false;
}

export function AnimatedNumber({
	value,
	locale,
	format,
	duration = "normal",
	className,
}: {
	value: number;
	locale?: string;
	format?: Intl.NumberFormatOptions;
	duration?: MotionDuration;
	className?: string;
}) {
	const element = useRef<HTMLSpanElement>(null);
	const current = useMotionValue(value);
	const reduced = useSyncExternalStore(
		subscribeToPreference,
		prefersReducedMotion,
		() => false,
	);
	const formatter = useMemo(
		() => new Intl.NumberFormat(locale, format),
		[locale, format],
	);
	const formatted = useTransform(() => formatter.format(current.get()));
	const target = formatter.format(value);

	useEffect(() => {
		if (!element.current) return;
		const timing = readMotionTiming(element.current, duration);
		if (
			reduced ||
			!timing.duration ||
			!Number.isFinite(value) ||
			!Number.isFinite(current.get())
		) {
			current.set(value);
			return;
		}
		if (current.get() === value) return;
		const animation = animate(current, value, { ...timing, type: "tween" });
		return () => animation.stop();
	}, [current, duration, reduced, value]);

	return (
		<span ref={element} className={cn("tabular-nums", className)}>
			<span className="sr-only">{target}</span>
			<motion.span aria-hidden="true">
				{reduced ? target : formatted}
			</motion.span>
		</span>
	);
}
