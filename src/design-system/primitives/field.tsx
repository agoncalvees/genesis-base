import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import {
	type AriaAttributes,
	type ComponentProps,
	createContext,
	type ReactNode,
	useContext,
	useId,
} from "react";
import { cn } from "../lib/cn";

export const controlStyles =
	"min-h-control w-full rounded-control border-(length:--border-width) border-control-border bg-surface-raised px-3 py-2 font-body text-ds-sm text-foreground placeholder:text-muted aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-60";

const FieldAccessibility = createContext<{
	labelId: string;
	descriptionId?: string;
	errorId?: string;
} | null>(null);

export function useFieldAccessibility(props?: AriaAttributes) {
	const field = useContext(FieldAccessibility);

	return {
		"aria-labelledby":
			props?.["aria-labelledby"] ??
			(props?.["aria-label"]?.trim() ? undefined : field?.labelId),
		"aria-describedby":
			[props?.["aria-describedby"], field?.descriptionId, field?.errorId]
				.filter(Boolean)
				.join(" ") || undefined,
	};
}

export function Field({
	label,
	description,
	error,
	children,
	className,
	...props
}: Omit<ComponentProps<typeof BaseField.Root>, "className" | "children"> & {
	label: ReactNode;
	description?: ReactNode;
	error?: string;
	children: ReactNode;
	className?: string;
}) {
	const labelId = useId();
	const descriptionId = useId();
	const errorId = useId();

	return (
		<BaseField.Root
			{...props}
			invalid={error ? true : props.invalid}
			className={cn("grid gap-1.5", className)}
		>
			<BaseField.Label id={labelId} className="w-fit text-ds-sm font-medium">
				{label}
			</BaseField.Label>
			<FieldAccessibility.Provider
				value={{
					labelId,
					descriptionId: description ? descriptionId : undefined,
					errorId: error ? errorId : undefined,
				}}
			>
				{children}
			</FieldAccessibility.Provider>
			{description && (
				<BaseField.Description
					id={descriptionId}
					className="text-ds-sm text-muted"
				>
					{description}
				</BaseField.Description>
			)}
			{error && (
				<BaseField.Error
					id={errorId}
					match
					role="alert"
					className="text-ds-sm font-medium"
				>
					{error}
				</BaseField.Error>
			)}
		</BaseField.Root>
	);
}

export function Input({
	className,
	...props
}: Omit<ComponentProps<typeof BaseInput>, "className"> & {
	className?: string;
}) {
	const accessibility = useFieldAccessibility(props);
	return (
		<BaseInput
			{...props}
			{...accessibility}
			className={cn(controlStyles, className)}
		/>
	);
}

export function Textarea({
	className,
	ref,
	...props
}: ComponentProps<"textarea">) {
	const accessibility = useFieldAccessibility(props);
	return (
		<BaseField.Control
			{...accessibility}
			render={<textarea {...props} {...accessibility} ref={ref} />}
			className={cn(controlStyles, "min-h-24 resize-y", className)}
		/>
	);
}
