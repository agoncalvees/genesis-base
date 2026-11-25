import { Toast as BaseToast } from "@base-ui/react/toast";
import { XIcon } from "@phosphor-icons/react";
import { useThemePortal } from "../lib/theme-portal";
import { IconButton } from "../primitives/button";
import { ThemedIcon } from "../primitives/themed-icon";

export const useToast = BaseToast.useToastManager;

export function ToastProvider({
	children,
	dismissLabel,
	...props
}: BaseToast.Provider.Props & { dismissLabel: string }) {
	return (
		<BaseToast.Provider {...props}>
			{children}
			<ToastViewport dismissLabel={dismissLabel} />
		</BaseToast.Provider>
	);
}

function ToastViewport({ dismissLabel }: { dismissLabel: string }) {
	const { toasts } = useToast();
	const portal = useThemePortal<HTMLSpanElement>();

	return (
		<>
			<span hidden ref={portal.anchor} />
			<BaseToast.Portal container={portal.container}>
				<BaseToast.Viewport className="fixed inset-x-4 bottom-4 z-60 flex flex-col gap-2 sm:inset-s-auto sm:w-80">
					{toasts.map((toast) => (
						<Toast key={toast.id} toast={toast} dismissLabel={dismissLabel} />
					))}
				</BaseToast.Viewport>
			</BaseToast.Portal>
		</>
	);
}

export function Toast({
	toast,
	dismissLabel,
}: {
	toast: BaseToast.Root.Props["toast"];
	dismissLabel: string;
}) {
	return (
		<BaseToast.Root
			toast={toast}
			swipeDirection="down"
			className="rounded-ds-lg panel bg-panel-raised p-3 text-foreground shadow-panel-lg transition-[opacity,transform] duration-(--duration-fast) ease-standard data-starting-style:translate-y-1 data-starting-style:opacity-0 data-ending-style:translate-y-1 data-ending-style:opacity-0 data-limited:hidden data-swiping:translate-y-(--toast-swipe-movement-y) data-swiping:duration-0"
		>
			<BaseToast.Content className="flex items-start justify-between gap-2">
				<div className="min-w-0 self-center wrap-break-word">
					<BaseToast.Title className="text-ds-sm font-semibold" />
					<BaseToast.Description className="text-ds-sm text-muted" />
				</div>
				<BaseToast.Close
					aria-hidden={false}
					render={
						<IconButton size="sm" aria-label={dismissLabel}>
							<ThemedIcon icon={XIcon} size={16} />
						</IconButton>
					}
				/>
			</BaseToast.Content>
		</BaseToast.Root>
	);
}
