import { type Ref, useCallback, useState } from "react";

/** Keep portalled UI inside the same CSS cascade as its trigger. */
export function useThemePortal<T extends HTMLElement>(ref?: Ref<T>) {
	const [container, setContainer] = useState<HTMLElement>();
	const anchor = useCallback(
		(element: T | null) => {
			const scope = element?.parentElement?.closest<HTMLElement>(
				"[data-world], [data-theme]",
			);
			setContainer(
				scope && scope !== document.documentElement ? scope : undefined,
			);
			if (typeof ref === "function") return ref(element);
			if (ref) ref.current = element;
		},
		[ref],
	);

	return { anchor, container };
}
