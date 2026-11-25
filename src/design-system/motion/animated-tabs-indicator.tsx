import type { ComponentProps } from "react";
import { Tabs } from "../components/tabs";
import { cn } from "../lib/cn";
import "./motion.css";

export function AnimatedTabsIndicator({
	className,
	...props
}: ComponentProps<typeof Tabs>) {
	return (
		<Tabs
			{...props}
			className={cn(
				"ds-animated-tabs [&_[role=tab]]:relative [&_[role=tab]]:pb-1",
				className,
			)}
		/>
	);
}
