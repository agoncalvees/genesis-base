import { render } from "@testing-library/react";
import type { CSSProperties } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { readMotionProfile } from "../../src/design-system";

const tokens = {
	"--motion-profile": "lively",
	"--motion-intensity": "0.8",
	"--duration-instant": "90ms",
	"--duration-fast": "120ms",
	"--duration-normal": "240ms",
	"--duration-showcase": "530ms",
	"--delay-showcase": "30ms",
	"--ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
	"--spring-stiffness": "300",
	"--spring-damping": "19",
	"--spring-mass": "0.8",
} as CSSProperties;

afterEach(() => vi.unstubAllGlobals());

test("scoped profile configures the spring and reusable motion presets", () => {
	const { container } = render(<div style={tokens} />);
	const element = container.firstElementChild as HTMLElement;
	const lively = readMotionProfile(element);
	expect(lively.spring).toEqual({
		type: "spring",
		stiffness: 300,
		damping: 19,
		mass: 0.8,
	});
	expect(lively.reveal).toMatchObject({
		delay: 0.03,
		transition: lively.spring,
	});
	expect(lively.microInteraction.press).toBeLessThan(1);
	expect(lively.result.countUp.duration).toBe(0.24);
	expect(lively.layout.ease).toEqual([0.2, 0, 0, 1]);

	element.style.setProperty("--motion-profile", "crisp");
	expect(readMotionProfile(element).reveal.transition).toMatchObject({
		type: "tween",
		duration: 0.53,
	});
});

test("reduced motion zeroes active durations, transforms, springs and delays", () => {
	vi.stubGlobal("matchMedia", () => ({ matches: true }));
	const { container } = render(<div style={tokens} />);
	const reduced = readMotionProfile(container.firstElementChild as HTMLElement);
	expect(Object.values(reduced.durations)).toEqual([0, 0, 0, 0, 0]);
	expect(reduced).toMatchObject({
		intensity: 0,
		spring: { stiffness: 0, damping: 0, mass: 0 },
		reveal: { distance: 0, delay: 0, transition: { duration: 0 } },
		microInteraction: { press: 1, hover: 1 },
		pathDraw: { transition: { duration: 0 } },
		result: { countUp: { duration: 0 }, reveal: { duration: 0 } },
	});
});
