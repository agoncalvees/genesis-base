import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const merge = extendTailwindMerge({
	extend: {
		theme: {
			text: [
				"ds-xs",
				"ds-sm",
				"ds-base",
				"ds-lg",
				"ds-xl",
				"ds-2xl",
				"ds-3xl",
				"ds-4xl",
			],
			"font-weight": ["ds-display", "ds-heading"],
			shadow: ["ds-md", "panel-flat", "panel-sm", "panel-md", "panel-lg"],
			spacing: ["control-sm", "control", "control-lg"],
		},
	},
});

export function cn(...values: ClassValue[]) {
	return merge(clsx(values));
}
