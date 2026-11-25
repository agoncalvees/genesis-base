/**
 * Shared contracts and pure helpers for operation state and results.
 *
 * Server-safe: this module declares types only (plus a pure mapper) and never
 * imports from `features/`, `ai/`, `integrations/` or `studio/`.
 */

export type ExecutionStatus =
	| "idle"
	| "running"
	| "completed"
	| "failed"
	| "cancelled";

export type ExecutionResult<T> = {
	data: T;
	durationMs?: number;
	metadata?: Record<string, unknown>;
	warnings?: string[];
};

export type AppError = { code: string; message: string; retryable: boolean };

export type EvaluationResult = {
	metric: string;
	value: number;
	unit?: string;
	sampleSize?: number;
	baseline?: number;
};

export type UiState =
	| "idle"
	| "loading"
	| "empty"
	| "error"
	| "success"
	| "cancelled";

/**
 * Maps the five contract statuses to the six UI states required by the result
 * patterns (audit I-13). `completed` with no data becomes `empty`, while
 * `cancelled` keeps a distinct feedback state instead of collapsing into `error`.
 */
export function toUiState(status: ExecutionStatus, hasData: boolean): UiState {
	switch (status) {
		case "idle":
			return "idle";
		case "running":
			return "loading";
		case "completed":
			return hasData ? "success" : "empty";
		case "failed":
			return "error";
		case "cancelled":
			return "cancelled";
	}
}
