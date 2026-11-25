import type { Icon, IconProps } from "@phosphor-icons/react";

const weights = ["thin", "light", "regular", "bold"] as const;

/** Decorative Phosphor glyph whose weight follows its nearest theme scope. */
export function ThemedIcon({
	icon: Glyph,
	style,
	...props
}: Omit<IconProps, "weight" | "aria-hidden"> & { icon: Icon }) {
	return weights.map((weight) => (
		<Glyph
			{...props}
			key={weight}
			aria-hidden="true"
			weight={weight}
			style={{
				...style,
				display: `var(--icon-display-${weight}, ${weight === "regular" ? "inline-block" : "none"})`,
			}}
		/>
	));
}
