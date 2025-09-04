/**
 * Shared Error Types
 */

// Re-export auth errors for convenience
export * from "../auth/errors";

// ============================================================================
// Application Errors
// ============================================================================

export class NotFoundError extends Error {
	public statusCode = 404;

	constructor(resource: string, id?: string) {
		super(`${resource}${id ? ` with id ${id}` : ""} not found`);
		this.name = "NotFoundError";
	}
}

export class ConflictError extends Error {
	public statusCode = 409;

	constructor(message: string, _details?: Record<string, unknown>) {
		super(message);
		this.name = "ConflictError";
	}
}

export class RateLimitError extends Error {
	public statusCode = 429;

	constructor(message = "Rate limit exceeded", _retryAfter?: number) {
		super(message);
		this.name = "RateLimitError";
	}
}

// ============================================================================
// Business Logic Errors
// ============================================================================

export class IdeaError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "IdeaError";
	}
}

export class FolderError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FolderError";
	}
}

export class WorkspaceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "WorkspaceError";
	}
}

export class UserError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserError";
	}
}
