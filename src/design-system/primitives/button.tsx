import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { useHydrated } from "../../core/hydration";
import { cn } from "../lib/cn";
import { SpinnerMark } from "./feedback";

const buttonStyles = cva(
	"inline-flex min-w-(--target-min) shrink-0 select-none items-center justify-center gap-2 rounded-control border-(length:--border-width) font-body text-ds-sm font-medium transition-[opacity,transform] duration-(--duration-instant) ease-standard motion-safe:active:scale-[calc(1-0.02*var(--motion-intensity))] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
	{
		variants: {
			variant: {
				primary:
					"border-transparent bg-primary text-on-primary enabled:hover:opacity-85",
				secondary:
					"border-control-border bg-surface-raised text-foreground enabled:hover:bg-surface",
				ghost:
					"border-transparent bg-transparent text-foreground enabled:hover:bg-surface",
				danger:
					"border-transparent bg-danger text-on-danger enabled:hover:opacity-85",
			},
			size: {
				sm: "min-h-control-sm px-3",
				md: "min-h-control px-4",
				lg: "min-h-control-lg px-5",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	},
);

export type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof buttonStyles> & {
		loading?: boolean;
		requireHydration?: boolean;
	};

export function Button({
	variant,
	size,
	loading = false,
	requireHydration = false,
	disabled,
	type = "button",
	className,
	children,
	"aria-busy": ariaBusy,
	...props
}: ButtonProps) {
	const hydrated = useHydrated();

	return (
		<button
			{...props}
			type={type}
			disabled={disabled || loading || (requireHydration && !hydrated)}
			aria-busy={loading || ariaBusy}
			className={cn(buttonStyles({ variant, size }), className)}
		>
			{loading && <SpinnerMark />}
			{children}
		</button>
	);
}

const iconSizes = {
	sm: "size-control-sm",
	md: "size-control",
	lg: "size-control-lg",
};

export function IconButton({
	variant = "ghost",
	size = "md",
	className,
	children,
	loading,
	...props
}: Omit<ButtonProps, "aria-label"> & { "aria-label": string }) {
	return (
		<Button
			{...props}
			variant={variant}
			size={size}
			loading={loading}
			className={cn("px-0", iconSizes[size ?? "md"], className)}
		>
			{!loading && (
				<span
					aria-hidden="true"
					className="inline-flex items-center justify-center"
				>
					{children}
				</span>
			)}
		</Button>
	);
}
