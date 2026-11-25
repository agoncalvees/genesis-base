import {
	type DragEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/button";
import { Spinner } from "../primitives/feedback";
import "./patterns.css";

/**
 * Upload patterns. Files are only read as text or shown through an `<img>`
 * object URL; content is never executed, parsed as HTML or sent anywhere.
 */

export type FileRules = {
	/** MIME types (`image/png`), wildcards (`image/*`) or extensions (`.csv`). */
	accept?: readonly string[];
	/** Bytes. */
	maxSize?: number;
	maxFiles?: number;
};

export function formatBytes(bytes: number, locale = "en") {
	const units = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;
	let value = bytes;
	let unit = 0;
	while (value >= 1000 && unit < units.length - 1) {
		value /= 1000;
		unit++;
	}
	return new Intl.NumberFormat(locale, {
		style: "unit",
		unit: units[unit],
		unitDisplay: unit ? "short" : "long",
		maximumFractionDigits: unit ? 1 : 0,
	}).format(value);
}

function matches(file: File, accept: readonly string[]) {
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return accept.some((rule) => {
		const entry = rule.trim().toLowerCase();
		if (entry.startsWith(".")) return name.endsWith(entry);
		if (entry.endsWith("/*")) return type.startsWith(entry.slice(0, -1));
		return type === entry;
	});
}

/** Pure validation; returns accepted files and one message per rejected file. */
export function validateFiles(
	files: readonly File[],
	{ accept, maxSize, maxFiles }: FileRules,
	existing = 0,
	locale = "en",
) {
	const accepted: File[] = [];
	const errors: string[] = [];
	for (const file of files) {
		if (accept?.length && !matches(file, accept))
			errors.push(
				`“${file.name}” is not an accepted type. Use ${accept.join(", ")}.`,
			);
		else if (maxSize != null && file.size > maxSize)
			errors.push(
				`“${file.name}” is ${formatBytes(file.size, locale)}; the limit is ${formatBytes(maxSize, locale)}.`,
			);
		else if (maxFiles != null && existing + accepted.length >= maxFiles)
			errors.push(
				`“${file.name}” was not added: the limit is ${maxFiles} ${maxFiles === 1 ? "file" : "files"}.`,
			);
		else accepted.push(file);
	}
	return { accepted, errors };
}

export function FileDrop({
	label,
	description,
	onFiles,
	existing = 0,
	buttonLabel = "Choose files",
	dropHint = "or drag files here",
	disabled = false,
	locale = "en",
	...rules
}: FileRules & {
	label: ReactNode;
	description?: ReactNode;
	onFiles: (files: File[]) => void;
	/** Files already selected, counted against `maxFiles`. */
	existing?: number;
	buttonLabel?: string;
	dropHint?: string;
	disabled?: boolean;
	locale?: string;
}) {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const constraints = [
		rules.accept?.length && `Accepted: ${rules.accept.join(", ")}.`,
		rules.maxSize != null &&
			`Up to ${formatBytes(rules.maxSize, locale)} each.`,
		rules.maxFiles != null &&
			`At most ${rules.maxFiles} ${rules.maxFiles === 1 ? "file" : "files"}.`,
	]
		.filter(Boolean)
		.join(" ");

	function take(list: FileList | null) {
		if (!list || disabled) return;
		const result = validateFiles([...list], rules, existing, locale);
		setErrors(result.errors);
		if (result.accepted.length) onFiles(result.accepted);
	}

	function onDrag(event: DragEvent, over: boolean) {
		event.preventDefault();
		if (!disabled) setDragging(over);
	}

	return (
		<div className="grid min-w-0 gap-2">
			{/* biome-ignore lint/a11y/useSemanticElements: a labelled drop target; a fieldset legend cannot sit inside the grid. */}
			<div
				role="group"
				aria-labelledby={`${id}-label`}
				aria-describedby={`${id}-hint`}
				data-dragging={dragging ? "" : undefined}
				className="ds-file-drop grid min-w-0 justify-items-center gap-2 p-5 text-center"
				onDragEnter={(event) => onDrag(event, true)}
				onDragOver={(event) => onDrag(event, true)}
				onDragLeave={(event) => onDrag(event, false)}
				onDrop={(event) => {
					onDrag(event, false);
					take(event.dataTransfer.files);
				}}
			>
				<span id={`${id}-label`} className="text-ds-sm font-medium">
					{label}
				</span>
				<input
					ref={input}
					id={`${id}-input`}
					type="file"
					className="sr-only"
					tabIndex={-1}
					aria-hidden="true"
					multiple={rules.maxFiles !== 1}
					accept={rules.accept?.join(",")}
					disabled={disabled}
					onChange={(event) => {
						take(event.currentTarget.files);
						event.currentTarget.value = "";
					}}
				/>
				<Button
					variant="secondary"
					disabled={disabled}
					onClick={() => input.current?.click()}
					aria-describedby={`${id}-hint`}
				>
					{buttonLabel}
				</Button>
				<span className="text-ds-sm text-muted">{dropHint}</span>
				<span id={`${id}-hint`} className="text-ds-xs text-muted">
					{description}
					{description && constraints && " "}
					{constraints}
				</span>
			</div>
			{errors.length > 0 && (
				<div role="alert">
					<ul className="grid gap-1 text-ds-sm font-medium text-foreground">
						{errors.map((error) => (
							<li key={error} className="wrap-anywhere">
								{error}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

function shownLabel(text: string, noun: string) {
	const count = text ? text.split("\n").length : 0;
	return `${count} ${noun}${count === 1 ? "" : "s"} shown`;
}

const textTypes = /^(text\/|application\/(json|xml))/;
const textExtensions = /\.(txt|md|csv|tsv|json|log|xml)$/i;

function kind(file: File) {
	if (/^image\/(png|jpe?g|gif|webp|avif|svg\+xml)$/.test(file.type))
		return "image";
	if (file.type === "text/csv" || /\.csv$/i.test(file.name)) return "csv";
	if (textTypes.test(file.type) || textExtensions.test(file.name))
		return "text";
	return "generic";
}

export function FilePreview({
	file,
	lines = 5,
	locale = "en",
}: {
	file: File;
	/** Lines shown for text and CSV files. */
	lines?: number;
	locale?: string;
}) {
	const type = kind(file);
	const [url, setUrl] = useState<string>();
	const [text, setText] = useState<string | null>(null);

	useEffect(() => {
		if (type !== "image") return;
		const objectUrl = URL.createObjectURL(file);
		setUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [file, type]);

	useEffect(() => {
		if (type !== "text" && type !== "csv") return;
		let active = true;
		// Read only the start of the file; the content is rendered as text.
		file
			.slice(0, 4096)
			.text()
			.then(
				(content) => {
					if (active)
						setText(content.split(/\r?\n/).slice(0, lines).join("\n"));
				},
				() => {
					if (active) setText("");
				},
			);
		return () => {
			active = false;
		};
	}, [file, type, lines]);

	const meta = `${file.type || "Unknown type"} · ${formatBytes(file.size, locale)}`;
	if (type === "image")
		return url ? (
			<img
				src={url}
				alt={`Preview of ${file.name}`}
				className="max-h-40 max-w-full rounded-ds-md object-contain"
			/>
		) : null;
	if (type === "text" || type === "csv")
		return text === null ? (
			<Spinner label={`Reading ${file.name}`} />
		) : (
			<figure className="grid min-w-0 gap-1">
				<pre
					// biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable previews must be reachable by keyboard.
					tabIndex={0}
					className="max-h-40 min-w-0 overflow-auto rounded-ds-md bg-surface p-2 font-mono text-ds-xs whitespace-pre"
				>
					{text || "(empty)"}
				</pre>
				<figcaption className="text-ds-xs text-muted">
					{shownLabel(text, type === "csv" ? "row" : "line")} · {meta}
				</figcaption>
			</figure>
		);
	return (
		<p className="text-ds-xs text-muted">{meta}. No preview for this type.</p>
	);
}

export function FileList({
	files,
	onRemove,
	label = "Selected files",
	removeLabel = (name) => `Remove ${name}`,
	preview = true,
	locale = "en",
	className,
}: {
	files: readonly File[];
	onRemove: (index: number) => void;
	label?: string;
	removeLabel?: (name: string) => string;
	preview?: boolean;
	locale?: string;
	className?: string;
}) {
	const list = useRef<HTMLUListElement>(null);
	const keys = useRef(new WeakMap<File, string>());
	const keyOf = (file: File) => {
		let key = keys.current.get(file);
		if (!key) {
			key = `file-${Math.random().toString(36).slice(2)}`;
			keys.current.set(file, key);
		}
		return key;
	};
	if (!files.length) return null;
	return (
		<ul
			ref={list}
			aria-label={label}
			tabIndex={-1}
			className={cn("grid min-w-0 gap-3", className)}
		>
			{files.map((file, index) => (
				<li
					key={keyOf(file)}
					className="grid min-w-0 gap-2 rounded-ds-md panel bg-panel-raised p-3"
				>
					<div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
						<span className="min-w-0 text-ds-sm font-medium wrap-anywhere">
							{file.name}
							<span className="ms-2 font-normal text-muted">
								{formatBytes(file.size, locale)}
							</span>
						</span>
						<Button
							size="sm"
							variant="ghost"
							aria-label={removeLabel(file.name)}
							onClick={() => {
								onRemove(index);
								list.current?.focus();
							}}
						>
							Remove
						</Button>
					</div>
					{preview && <FilePreview file={file} locale={locale} />}
				</li>
			))}
		</ul>
	);
}
