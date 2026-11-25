import { Select as BaseSelect } from "@base-ui/react/select";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { useThemePortal } from "../lib/theme-portal";
import { controlStyles, useFieldAccessibility } from "./field";
import { ThemedIcon } from "./themed-icon";

type SelectOption = { value: string; label: ReactNode; disabled?: boolean };

export function Select({
	options,
	placeholder,
	triggerProps,
	...props
}: Omit<BaseSelect.Root.Props<string>, "children" | "items" | "multiple"> & {
	options: readonly SelectOption[];
	placeholder?: ReactNode;
	triggerProps?: Omit<
		ComponentProps<typeof BaseSelect.Trigger>,
		"className" | "children" | "render"
	> & { className?: string };
}) {
	const portal = useThemePortal(triggerProps?.ref);
	const accessibility = useFieldAccessibility(triggerProps);
	return (
		<BaseSelect.Root {...props} items={options}>
			<BaseSelect.Trigger
				{...triggerProps}
				ref={portal.anchor}
				{...accessibility}
				className={cn(
					controlStyles,
					"flex min-w-0 items-center justify-between gap-2 text-start",
					triggerProps?.className,
				)}
			>
				<BaseSelect.Value
					placeholder={placeholder}
					className="min-w-0 truncate data-placeholder:text-muted"
				/>
				<BaseSelect.Icon className="shrink-0">
					<ThemedIcon icon={CaretDownIcon} size={16} />
				</BaseSelect.Icon>
			</BaseSelect.Trigger>
			<BaseSelect.Portal container={portal.container}>
				<BaseSelect.Positioner
					alignItemWithTrigger={false}
					sideOffset={6}
					className="z-50"
				>
					<BaseSelect.Popup className="w-(--anchor-width) max-w-(--available-width) rounded-ds-md panel bg-panel-raised p-1 text-ds-sm shadow-panel-md transition-opacity duration-(--duration-fast) ease-standard data-starting-style:opacity-0 data-ending-style:opacity-0">
						<BaseSelect.List className="max-h-(--available-height) overflow-auto p-0.5">
							{options.map(({ value, label, disabled }) => (
								<BaseSelect.Item
									key={value}
									value={value}
									disabled={disabled}
									className="grid min-h-control-sm cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-ds-sm px-2 py-1 text-foreground data-highlighted:bg-primary data-highlighted:text-on-primary data-disabled:opacity-60"
								>
									<BaseSelect.ItemIndicator className="col-start-1 row-start-1">
										<ThemedIcon icon={CheckIcon} size={16} />
									</BaseSelect.ItemIndicator>
									<BaseSelect.ItemText className="col-start-2 row-start-1 wrap-break-word">
										{label}
									</BaseSelect.ItemText>
								</BaseSelect.Item>
							))}
						</BaseSelect.List>
					</BaseSelect.Popup>
				</BaseSelect.Positioner>
			</BaseSelect.Portal>
		</BaseSelect.Root>
	);
}
