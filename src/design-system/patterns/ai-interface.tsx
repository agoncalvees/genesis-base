import {
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import type { AppError } from "../../core/contracts";
import { cn } from "../lib/cn";
import { readMotionProfile } from "../motion/presets";
import { Button } from "../primitives/button";
import { Badge } from "../primitives/feedback";
import { Field, Textarea } from "../primitives/field";
import { Heading } from "../primitives/typography";
import { EvidenceExcerpt } from "./evidence-excerpt";
import "./patterns.css";

/**
 * Presentational AI patterns. They receive state through props and never
 * call a model or the network; the caller owns the request lifecycle.
 */

export function PromptComposer({
	label,
	value,
	onChange,
	onSubmit,
	onCancel,
	running = false,
	maxLength = 4000,
	description,
	placeholder,
	submitLabel = "Send",
	cancelLabel = "Cancel",
	emptyError = "Enter a prompt.",
}: {
	label: ReactNode;
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
	onCancel?: () => void;
	running?: boolean;
	maxLength?: number;
	description?: ReactNode;
	placeholder?: string;
	submitLabel?: string;
	cancelLabel?: string;
	emptyError?: string;
}) {
	const [attempted, setAttempted] = useState(false);
	const counterId = useId();
	const tooLong = value.length > maxLength;
	const empty = value.trim().length === 0;
	const error = tooLong
		? `Use at most ${maxLength.toLocaleString("en")} characters (${(value.length - maxLength).toLocaleString("en")} over).`
		: attempted && empty
			? emptyError
			: undefined;

	function submit() {
		if (running) return;
		setAttempted(true);
		if (empty || tooLong) return;
		setAttempted(false);
		onSubmit(value);
	}

	function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			submit();
		} else if (event.key === "Escape" && running && onCancel) {
			event.preventDefault();
			onCancel();
		}
	}

	return (
		<form
			className="grid min-w-0 gap-3"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<Field
				label={label}
				description={
					<>
						{description}
						{description && " "}
						Press Ctrl+Enter or ⌘+Enter to send
						{onCancel ? ", Esc to cancel while running." : "."}
					</>
				}
				error={error}
			>
				<Textarea
					value={value}
					placeholder={placeholder}
					aria-invalid={error ? true : undefined}
					aria-describedby={counterId}
					onChange={(event) => onChange(event.currentTarget.value)}
					onKeyDown={onKeyDown}
				/>
			</Field>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p
					id={counterId}
					className={cn(
						"text-ds-xs tabular-nums",
						tooLong ? "font-medium text-foreground" : "text-muted",
					)}
				>
					{value.length.toLocaleString("en")} / {maxLength.toLocaleString("en")}{" "}
					characters
				</p>
				<div className="flex flex-wrap gap-2">
					{running && onCancel && (
						<Button variant="secondary" onClick={onCancel}>
							{cancelLabel}
						</Button>
					)}
					<Button type="submit" loading={running}>
						{submitLabel}
					</Button>
				</div>
			</div>
		</form>
	);
}

/**
 * Streamed answer text. Announced politely and once settled (`aria-busy`).
 * The cursor only appears while streaming and when motion is allowed.
 */
export function StreamingText({
	text,
	streaming,
	label = "Response",
	placeholder,
	className,
}: {
	text: string;
	streaming: boolean;
	label?: string;
	placeholder?: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [motion, setMotion] = useState(false);
	useEffect(() => {
		if (ref.current) setMotion(readMotionProfile(ref.current).intensity > 0);
	}, []);
	return (
		<div
			ref={ref}
			role="log"
			aria-label={label}
			aria-live="polite"
			aria-busy={streaming}
			className={cn(
				"min-w-0 max-w-(--measure) font-body text-ds-base leading-relaxed whitespace-pre-wrap wrap-anywhere text-foreground",
				className,
			)}
		>
			{text || (!streaming && placeholder)}
			{streaming && (
				<span
					aria-hidden="true"
					className="ds-stream-cursor"
					data-motion={motion ? "" : undefined}
				/>
			)}
		</div>
	);
}

export type Source = {
	id: string;
	title: string;
	/** Only http(s) and fragment links are rendered as links. */
	href?: string;
	text: string;
	start: number;
	end: number;
};

function safeHref(href?: string) {
	return href && /^(https?:\/\/|#)/i.test(href) ? href : undefined;
}

export function sourceAnchor(prefix: string, id: string) {
	return `${prefix}-${id}`.replace(/[^\w-]/g, "-");
}

/** Numbered inline reference that links to its item in SourceList. */
export function Citation({
	index,
	source,
	idPrefix,
}: {
	index: number;
	source: Pick<Source, "id" | "title">;
	idPrefix: string;
}) {
	return (
		<sup>
			<a
				href={`#${sourceAnchor(idPrefix, source.id)}`}
				aria-label={`Source ${index}: ${source.title}`}
				className="px-0.5 font-medium text-foreground underline underline-offset-2"
			>
				[{index}]
			</a>
		</sup>
	);
}

export function SourceList({
	sources,
	idPrefix,
	title = "Sources",
	headingLevel = 3,
}: {
	sources: readonly Source[];
	/** Unique per page; Citation must use the same prefix. */
	idPrefix: string;
	title?: string;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
	const titleId = useId();
	return (
		<section aria-labelledby={titleId} className="grid min-w-0 gap-3">
			<Heading id={titleId} level={headingLevel}>
				{title}
			</Heading>
			<ol className="grid min-w-0 list-decimal gap-3 ps-5 marker:text-ds-sm marker:text-muted">
				{sources.map((source) => {
					const href = safeHref(source.href);
					return (
						<li
							key={source.id}
							id={sourceAnchor(idPrefix, source.id)}
							tabIndex={-1}
							className="grid min-w-0 gap-1 ps-1"
						>
							<span className="text-ds-sm font-medium">
								{href ? (
									<a
										href={href}
										rel="noreferrer"
										className="underline underline-offset-2"
									>
										{source.title}
									</a>
								) : (
									source.title
								)}
							</span>
							<EvidenceExcerpt
								text={source.text}
								start={source.start}
								end={source.end}
								context={60}
							/>
						</li>
					);
				})}
			</ol>
		</section>
	);
}

export type AiStatusValue =
	| "idle"
	| "running"
	| "streaming"
	| "completed"
	| "failed"
	| "cancelled"
	| "unavailable";

const errorMessages: Record<string, string> = {
	unavailable: "AI is not available here. The rest of the page still works.",
	forbidden: "AI is not enabled for this access.",
	rate_limited: "Too many requests right now. Wait a moment, then try again.",
	timeout: "The response took too long.",
	cancelled: "The request was cancelled.",
	input_limit: "The prompt is too long. Shorten it and try again.",
	budget_exceeded: "The request needed more work than allowed.",
	invalid_output: "The response could not be used.",
	provider_error: "The AI service could not respond.",
};

const statusPresentation = {
	idle: { label: "Ready", tone: "neutral", message: "Ready for a prompt." },
	running: {
		label: "Waiting",
		tone: "info",
		message: "Waiting for a response…",
	},
	streaming: {
		label: "Responding",
		tone: "info",
		message: "Receiving the response…",
	},
	completed: {
		label: "Completed",
		tone: "success",
		message: "Response complete.",
	},
	failed: { label: "Failed", tone: "danger", message: "Something went wrong." },
	cancelled: {
		label: "Cancelled",
		tone: "warning",
		message: errorMessages.cancelled,
	},
	unavailable: {
		label: "Unavailable",
		tone: "neutral",
		message: errorMessages.unavailable,
	},
} as const;

/** Maps an AiResult-like status and AppError code to a user-facing message. */
export function aiStatusMessage(status: AiStatusValue, error?: AppError) {
	if (status === "failed" && error)
		return errorMessages[error.code] ?? statusPresentation.failed.message;
	return statusPresentation[status].message;
}

export function AiStatus({
	status,
	error,
	onRetry,
	retryLabel = "Try again",
}: {
	status: AiStatusValue;
	error?: AppError;
	onRetry?: () => void;
	retryLabel?: string;
}) {
	const { label, tone } = statusPresentation[status];
	const retry = status === "failed" && error?.retryable && onRetry;
	return (
		<div
			className="flex min-w-0 flex-wrap items-center gap-3"
			data-status={status}
		>
			<p
				role="status"
				className="flex min-w-0 flex-wrap items-center gap-2 text-ds-sm"
			>
				<Badge tone={tone}>{label}</Badge>
				<span>{aiStatusMessage(status, error)}</span>
			</p>
			{retry && (
				<Button size="sm" variant="secondary" onClick={onRetry}>
					{retryLabel}
				</Button>
			)}
		</div>
	);
}
