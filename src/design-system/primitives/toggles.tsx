import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { CheckIcon, MinusIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { useFieldAccessibility } from "./field";
import { ThemedIcon } from "./themed-icon";

export function Checkbox({
	className,
	indeterminate,
	...props
}: Omit<ComponentProps<typeof BaseCheckbox.Root>, "className" | "children"> & {
	className?: string;
}) {
	const accessibility = useFieldAccessibility(props);
	return (
		<BaseCheckbox.Root
			{...props}
			{...accessibility}
			indeterminate={indeterminate}
			className={cn(
				"inline-grid size-(--target-min) place-items-center rounded-ds-sm border-(length:--border-width) border-control-border bg-surface-raised text-foreground data-checked:border-primary data-checked:bg-primary data-checked:text-on-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-on-primary data-disabled:cursor-not-allowed data-disabled:opacity-60",
				className,
			)}
		>
			<BaseCheckbox.Indicator>
				{indeterminate ? (
					<ThemedIcon icon={MinusIcon} size={16} />
				) : (
					<ThemedIcon icon={CheckIcon} size={16} />
				)}
			</BaseCheckbox.Indicator>
		</BaseCheckbox.Root>
	);
}

export function Switch({
	className,
	...props
}: Omit<ComponentProps<typeof BaseSwitch.Root>, "className" | "children"> & {
	className?: string;
}) {
	const accessibility = useFieldAccessibility(props);
	return (
		<BaseSwitch.Root
			{...props}
			{...accessibility}
			className={cn(
				"group inline-flex h-(--target-min) w-11 items-center rounded-pill border-(length:--border-width) border-control-border bg-surface-raised p-0.5 data-checked:border-primary data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-60",
				className,
			)}
		>
			<BaseSwitch.Thumb className="size-[calc(var(--spacing)*4.5)] rounded-pill bg-foreground transition-transform duration-(--duration-fast) ease-standard group-data-checked:translate-x-5 group-data-checked:bg-on-primary rtl:group-data-checked:-translate-x-5" />
		</BaseSwitch.Root>
	);
}
