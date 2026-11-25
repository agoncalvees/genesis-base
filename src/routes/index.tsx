import { createFileRoute } from "@tanstack/react-router";
import { useHydrated } from "../core/hydration";
import {
	type PitchStep,
	PitchTour,
	usePitchMode,
} from "../design-system/patterns/pitch-tour";
import { story } from "../features/story/content";

export const Route = createFileRoute("/")({
	component: Home,
	staticData: { language: "pt-BR" },
});

/**
 * Standard product structure (docs/product/PLAYBOOK.md). Keep the order and
 * the data-story markers; restyle and recompose freely per DESIGN.md.
 * Replace <Experience /> with the product's mechanism, preloaded with an example.
 */
function Home() {
	const hydrated = useHydrated();
	const [touring, setTouring] = usePitchMode();
	const steps: PitchStep[] = [
		{ id: "dor", target: "[data-story=problem]", title: story.problem },
		{
			id: "experiencia",
			target: "#experiencia",
			title: "[O mecanismo em ação]",
		},
		{
			id: "resultado",
			target: "[data-story=result]",
			title: "[O antes × depois]",
		},
		{ id: "como", target: "#como-funciona", title: "Como funciona" },
	];

	return (
		<main
			data-hydrated={hydrated}
			className="mx-auto grid max-w-6xl gap-16 p-6"
		>
			<header className="grid gap-4 pt-10">
				<p className="text-ds-sm font-semibold uppercase tracking-wide text-muted">
					{story.audience}
				</p>
				<h1 data-hero-title className="font-display text-ds-4xl">
					{story.title}
				</h1>
				<p data-story="problem" className="max-w-prose text-ds-lg">
					{story.problem}
				</p>
				<p data-story="promise" className="max-w-prose text-muted">
					{story.promise}
				</p>
				<div data-story="action" className="flex flex-wrap items-center gap-4">
					<button
						type="button"
						className="min-h-control rounded-control bg-primary px-5 font-semibold text-on-primary"
						onClick={() => setTouring(true)}
					>
						{story.action}
					</button>
					<a href="#experiencia" className="underline underline-offset-4">
						{story.explore}
					</a>
				</div>
			</header>

			<section id="experiencia" aria-label="Experiência">
				<Experience />
			</section>

			<section data-story="result" aria-label="Resultado">
				<p className="text-muted">[Antes × depois com o número grande.]</p>
			</section>

			<section
				id="como-funciona"
				aria-labelledby="como-titulo"
				className="grid gap-4"
			>
				<h2 id="como-titulo" className="font-display text-ds-2xl">
					Como funciona
				</h2>
				<ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{story.how.map((item) => (
						<li key={item.title} className="grid gap-1">
							<strong>{item.title}</strong>
							<span className="text-muted">{item.body}</span>
						</li>
					))}
				</ol>
				<p className="text-ds-sm text-muted">{story.limits}</p>
				<p className="text-ds-sm">{story.next}</p>
			</section>

			<PitchTour
				steps={steps}
				open={touring}
				onClose={() => setTouring(false)}
				label="Demonstração em 60 segundos"
			/>
		</main>
	);
}

/** The product's mechanism, opened with an example already loaded (no login). */
function Experience() {
	return (
		<div className="grid min-h-64 place-items-center rounded-ds-lg border border-dashed border-border p-8 text-muted">
			[Experiência principal com exemplo pré-carregado]
		</div>
	);
}
