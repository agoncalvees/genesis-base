import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

type TabItem = {
	value: string;
	label: ReactNode;
	content: ReactNode;
	disabled?: boolean;
};

export function Tabs({
	label,
	items,
	defaultValue,
	...props
}: Omit<BaseTabs.Root.Props, "children"> & {
	label: string;
	items: readonly TabItem[];
}) {
	return (
		<BaseTabs.Root
			{...props}
			defaultValue={
				defaultValue ?? items.find((item) => !item.disabled)?.value ?? null
			}
		>
			<BaseTabs.List
				aria-label={label}
				className="flex flex-wrap gap-1 border-b border-panel-divider pb-1 data-[orientation=vertical]:flex-col"
			>
				{items.map((item) => (
					<BaseTabs.Tab
						key={item.value}
						value={item.value}
						disabled={item.disabled}
						className="min-h-control-sm rounded-control px-3 text-start text-ds-sm font-medium text-muted not-data-active:hover:bg-surface data-active:bg-primary data-active:text-on-primary data-disabled:opacity-60"
					>
						{item.label}
					</BaseTabs.Tab>
				))}
			</BaseTabs.List>
			{items.map((item) => (
				<BaseTabs.Panel
					key={item.value}
					value={item.value}
					className="mt-3 min-w-0 rounded-ds-sm"
				>
					{item.content}
				</BaseTabs.Panel>
			))}
		</BaseTabs.Root>
	);
}
