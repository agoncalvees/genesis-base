import { createFileRoute } from "@tanstack/react-router";
import { appConfig } from "../core/app-config";
import { useHydrated } from "../core/hydration";

export const Route = createFileRoute("/smoke")({ component: Smoke });

function Smoke() {
	const hydrated = useHydrated();

	return (
		<main className="p-4" data-hydrated={hydrated}>
			<h1>{appConfig.name} smoke</h1>
		</main>
	);
}
