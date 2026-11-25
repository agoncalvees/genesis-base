export const durations = {
	instant: "--duration-instant",
	fast: "--duration-fast",
	normal: "--duration-normal",
	slow: "--duration-slow",
	showcase: "--duration-showcase",
} as const;

export const easings = {
	standard: "--ease-standard",
	enter: "--ease-enter",
	exit: "--ease-exit",
} as const;

export type MotionDuration = keyof typeof durations;

function readEase(curve: string) {
	const points = curve
		.match(/cubic-bezier\(([^)]+)\)/)?.[1]
		?.split(",")
		.map(Number);
	return points?.length === 4 && points.every(Number.isFinite)
		? ([points[0], points[1], points[2], points[3]] as [
				number,
				number,
				number,
				number,
			])
		: ("linear" as const);
}

function readTime(time: string) {
	return (Number.parseFloat(time) || 0) / (time.endsWith("ms") ? 1000 : 1);
}

function readMotionTokens(element: Element) {
	const styles = getComputedStyle(element);
	const read = (token: string) => styles.getPropertyValue(token).trim();
	const reduced =
		element.ownerDocument.defaultView?.matchMedia?.(
			"(prefers-reduced-motion: reduce)",
		).matches ?? false;
	const time = (token: string) => (reduced ? 0 : readTime(read(token)));
	const ease = (key: keyof typeof easings) => readEase(read(easings[key]));
	return { read, reduced, time, ease };
}

export function readMotionTiming(
	element: Element,
	duration: MotionDuration,
	easing: keyof typeof easings = "standard",
) {
	const { time, ease } = readMotionTokens(element);
	return { duration: time(durations[duration]), ease: ease(easing) };
}

export function readMotionProfile(element: Element) {
	const { read, reduced, time, ease } = readMotionTokens(element);
	const intensity = reduced ? 0 : Number(read("--motion-intensity") || 1);
	const spring = {
		type: "spring" as const,
		stiffness: intensity ? Number(read("--spring-stiffness")) : 0,
		damping: intensity ? Number(read("--spring-damping")) : 0,
		mass: intensity ? Number(read("--spring-mass")) : 0,
	};
	const profileDurations = {
		instant: time(durations.instant),
		fast: time(durations.fast),
		normal: time(durations.normal),
		slow: time(durations.slow),
		showcase: time(durations.showcase),
	};
	const easing = {
		standard: ease("standard"),
		enter: ease("enter"),
		exit: ease("exit"),
	};
	const reveal = { duration: profileDurations.showcase, ease: easing.enter };
	const layout = { duration: profileDurations.normal, ease: easing.standard };
	return {
		intensity,
		spring,
		durations: profileDurations,
		easing,
		reveal: {
			distance: 12 * intensity,
			delay: intensity ? time("--delay-showcase") : 0,
			transition:
				intensity && read("--motion-profile") === "lively"
					? spring
					: { type: "tween" as const, ...reveal },
		},
		layout: { type: "tween" as const, ...layout },
		microInteraction: {
			duration: profileDurations.instant,
			ease: easing.standard,
			press: 1 - 0.02 * intensity,
			hover: 1 + 0.015 * intensity,
		},
		pathDraw: {
			initial: { pathLength: intensity ? 0 : 1 },
			animate: { pathLength: 1 },
			transition: reveal,
		},
		result: { countUp: layout, reveal },
	};
}
