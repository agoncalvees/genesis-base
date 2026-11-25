import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn(
				"mx-auto w-full max-w-(--content-max) px-4 sm:px-6 lg:px-8",
				className,
			)}
		/>
	);
}

export function Stack({ className, ...props }: ComponentProps<"div">) {
	return (
		<div {...props} className={cn("flex min-w-0 flex-col gap-4", className)} />
	);
}

export function Grid({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn(
				"grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4",
				className,
			)}
		/>
	);
}

export function Card({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={cn(
				"min-w-0 rounded-ds-lg panel bg-panel-raised p-4 text-foreground shadow-panel-sm",
				className,
			)}
		/>
	);
}
