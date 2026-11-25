import { CaretDownIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { ThemedIcon } from "../primitives/themed-icon";
import "./motion.css";

export function Expandable({
	label,
	children,
	className,
	...props
}: ComponentProps<"details"> & { label: ReactNode }) {
	return (
		<details
			{...props}
			className={cn(
				"ds-expandable group rounded-ds-lg panel bg-panel-surface shadow-panel-flat",
				className,
			)}
		>
			<summary className="flex min-h-[max(var(--target-min),calc(var(--control-height)*var(--density)*1.1))] cursor-pointer list-none items-center justify-between gap-3 rounded-ds-lg px-4 py-2 text-ds-sm font-medium [&::-webkit-details-marker]:hidden">
				{label}
				<ThemedIcon
					icon={CaretDownIcon}
					size={16}
					className="shrink-0 group-open:rotate-180 motion-safe:transition-transform motion-safe:[transition-duration:var(--duration-fast)] ease-standard"
				/>
			</summary>
			<div className="border-t border-panel-divider px-4 py-3">{children}</div>
		</details>
	);
}
