import { createFileRoute } from "@tanstack/react-router";
import { appConfig } from "../core/app-config";
import { useHydrated } from "../core/hydration";

export const Route = createFileRoute("/")({ component: Home });

/**
 * Placeholder. Replace with the product's main experience after the
 * art-direction protocol (docs/design/CREATIVE-DIRECTION.md, steps 1–6).
 */
function Home() {
	const hydrated = useHydrated();
	return (
		<main
			data-hydrated={hydrated}
			className="mx-auto grid min-h-dvh max-w-3xl content-center gap-4 p-6"
		>
			<h1 className="font-display text-ds-4xl">{appConfig.name}</h1>
			<p className="text-muted">
				Comece por AGENTS.md e pelo protocolo de direção artística.
			</p>
		</main>
	);
}
