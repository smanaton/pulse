/**
 * Orchestration Run State Machine
 * Enforces valid state transitions and prevents illegal jumps
 */

export type RunStatus =
	| "assigned"
	| "started"
	| "progress"
	| "blocked"
	| "paused"
	| "completed"
	| "failed"
	| "queued"
	| "timed_out";

export type ControlCommand =
	| "run.pause"
	| "run.resume"
	| "run.cancel"
	| "run.retry";

// State transition graph
const edges: Record<RunStatus, RunStatus[]> = {
	assigned: ["started", "queued", "failed"],
	started: ["progress", "blocked", "paused", "failed", "completed"],
	progress: ["progress", "blocked", "paused", "failed", "completed", "timed_out"],
	blocked: ["started", "failed", "timed_out"],
	paused: ["started", "failed"],
	queued: ["assigned", "failed"],
	timed_out: ["queued", "failed"],
	completed: [],
	failed: [],
};

/**
 * Check if a status transition is valid
 */
export function canTransition(from: RunStatus, to: RunStatus): boolean {
	return edges[from]?.includes(to) ?? false;
}

/**
 * Get valid next states for a given status
 */
export function getValidTransitions(from: RunStatus): RunStatus[] {
	return edges[from] ?? [];
}

/**
 * Check if a status is terminal (no outgoing transitions)
 */
export function isTerminal(status: RunStatus): boolean {
	return edges[status]?.length === 0;
}

/**
 * Map event types to status changes
 */
export function eventTypeToStatus(eventType: string): RunStatus | null {
	const mapping: Record<string, RunStatus> = {
		"run.started": "started",
		"run.progress": "progress",
		"run.blocked": "blocked",
		"run.completed": "completed",
		"run.failed": "failed",
		"run.paused": "paused",
		"run.timed_out": "timed_out",
	};

	return mapping[eventType] ?? null;
}

/**
 * Error codes for orchestration failures
 */
export const ERROR_CODES = {
	INPUT_INVALID: "INPUT_INVALID",
	CAPABILITY_UNSUPPORTED: "CAPABILITY_UNSUPPORTED",
	AGENT_UNAVAILABLE: "AGENT_UNAVAILABLE",
	TIMEOUT: "TIMEOUT",
	TOOL_AUTH_FAILED: "TOOL_AUTH_FAILED",
	TOOL_RATE_LIMITED: "TOOL_RATE_LIMITED",
	AGENT_ERROR: "AGENT_ERROR",
	SYSTEM_ERROR: "SYSTEM_ERROR",
	INVALID_TRANSITION: "INVALID_TRANSITION",
	HMAC_VERIFICATION_FAILED: "HMAC_VERIFICATION_FAILED",
	EVENT_REPLAY: "EVENT_REPLAY",
	CLOCK_SKEW: "CLOCK_SKEW",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Check if an error code allows automatic retry
 */
export function isRetryableError(errorCode: ErrorCode): boolean {
	const retryableErrors: ErrorCode[] = [
		ERROR_CODES.AGENT_UNAVAILABLE,
		ERROR_CODES.TIMEOUT,
		ERROR_CODES.TOOL_RATE_LIMITED,
		ERROR_CODES.SYSTEM_ERROR,
	];

	return retryableErrors.includes(errorCode);
}