/**
 * Shared Error Types
 */
// Re-export auth errors for convenience
export * from "../auth/errors";
// ============================================================================
// Application Errors
// ============================================================================
export class NotFoundError extends Error {
    statusCode = 404;
    constructor(resource, id) {
        super(`${resource}${id ? ` with id ${id}` : ""} not found`);
        this.name = "NotFoundError";
    }
}
export class ConflictError extends Error {
    statusCode = 409;
    constructor(message, _details) {
        super(message);
        this.name = "ConflictError";
    }
}
export class RateLimitError extends Error {
    statusCode = 429;
    constructor(message = "Rate limit exceeded", _retryAfter) {
        super(message);
        this.name = "RateLimitError";
    }
}
// ============================================================================
// Business Logic Errors
// ============================================================================
export class IdeaError extends Error {
    constructor(message) {
        super(message);
        this.name = "IdeaError";
    }
}
export class FolderError extends Error {
    constructor(message) {
        super(message);
        this.name = "FolderError";
    }
}
export class WorkspaceError extends Error {
    constructor(message) {
        super(message);
        this.name = "WorkspaceError";
    }
}
export class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserError";
    }
}
