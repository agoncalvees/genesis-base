import { parseExtensionColors } from "./adapter";
import { fonts } from "./fonts";
import { colorKeys, dataKeys, type Identity, type Tokens } from "./normalize";

const palette = [...colorKeys, ...dataKeys, "data-grid", "data-axis"] as const;

const textPairs = [
	["foreground", "background"],
	["foreground", "surface"],
	["foreground", "surface-raised"],
	["muted", "background"],
	["muted", "surface"],
	...["primary", "accent", "success", "warning", "danger", "info"].map(
		(role) => [`on-${role}`, role],
	),
];
const controlPairs = [
	["focus", "background"],
	["focus", "surface"],
	["control-border", "background"],
	...dataKeys.map((key) => [key, "surface"]),
];

function oklab(r: number, g: number, b: number) {
	const linear = (channel: number) => {
		const value = channel / 255;
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	};
	const [red, green, blue] = [r, g, b].map(linear);
	const l = Math.cbrt(
		0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
	);
	const m = Math.cbrt(
		0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
	);
	const s = Math.cbrt(
		0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
	);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

export function validatePalette(tokens: Tokens, scope: string): Tokens {
	const input = Object.fromEntries(
		palette.map((key) => {
			if (!tokens[key]) throw new Error(`${scope}: missing --${key}`);
			return [key, tokens[key]];
		}),
	);
	const colors = parseExtensionColors(input);
	const get = (key: string) => {
		const value = colors.get(key);
		if (!value || (value.a ?? 1) !== 1)
			throw new Error(`${scope}: --${key} must be an opaque color`);
		return value;
	};
	const result = { ...tokens };
	for (const key of palette) result[key] = get(key).hex;
	for (const [pairs, minimum] of [
		[textPairs, 4.5],
		[controlPairs, 3],
	] as const) {
		for (const [first, second] of pairs) {
			const a = get(first).luminance;
			const b = get(second).luminance;
			const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
			if (ratio < minimum) {
				throw new Error(
					`${scope}: ${first}/${second} is ${ratio.toFixed(2)}:1 (minimum ${minimum}:1)`,
				);
			}
		}
	}

	// ΔE OK on a 0–1 lightness scale. Labels or patterns are still required.
	const minimumDelta = 0.07;
	for (const [index, first] of dataKeys.entries()) {
		const a = get(first);
		const firstLab = oklab(a.r, a.g, a.b);
		for (const second of dataKeys.slice(index + 1)) {
			const b = get(second);
			const secondLab = oklab(b.r, b.g, b.b);
			const distance = Math.hypot(
				...firstLab.map((value, channel) => value - secondLab[channel]),
			);
			if (distance < minimumDelta)
				throw new Error(
					`${scope}: ${first}/${second} ΔE OK below ${minimumDelta}`,
				);
		}
	}
	return result;
}

export function validate(identity: Identity): Identity {
	for (const [role, stack] of Object.entries(identity.families)) {
		for (const entry of stack.split(",")) {
			const family = entry.trim().replace(/^(['"])(.+)\1$/, "$2");
			if (!Object.hasOwn(fonts, family))
				throw new Error(`${role}: unknown font "${family}"`);
		}
	}
	return {
		...identity,
		light: validatePalette(identity.light, "light"),
		dark: identity.dark && validatePalette(identity.dark, "dark"),
	};
}
