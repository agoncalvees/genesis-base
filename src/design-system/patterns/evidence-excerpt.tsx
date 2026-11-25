export function EvidenceExcerpt({
	text,
	start,
	end,
	context = 80,
	label = "Highlighted evidence",
}: {
	text: string;
	/** Inclusive UTF-16 offset, as accepted by String.slice. */
	start: number;
	/** Exclusive UTF-16 offset, as accepted by String.slice. */
	end: number;
	/** Maximum number of UTF-16 code units to show on each side. */
	context?: number;
	label?: string;
}) {
	const validRange =
		Number.isInteger(start) &&
		Number.isInteger(end) &&
		start >= 0 &&
		start < end &&
		end <= text.length;
	const window = Number.isFinite(context)
		? Math.max(0, Math.floor(context))
		: 80;
	const from = validRange ? Math.max(0, start - window) : 0;
	const to = validRange ? Math.min(text.length, end + window) : text.length;

	return (
		<p className="text-ds-sm whitespace-pre-wrap wrap-anywhere">
			{from > 0 && "…"}
			{validRange ? (
				<>
					{text.slice(from, start)}
					<mark className="rounded-ds-sm bg-warning text-on-warning underline decoration-2">
						<span className="sr-only">{label}: </span>
						{text.slice(start, end)}
					</mark>
					{text.slice(end, to)}
				</>
			) : (
				text
			)}
			{to < text.length && "…"}
		</p>
	);
}
