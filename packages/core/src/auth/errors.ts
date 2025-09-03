/**
 * Authentication Errors
 */

export class PulseError extends Error {
	public code: string;
	public statusCode?: number;
	public details?: Record<string, unknown>;

	constructor(
		message: string,
		code: string,
		statusCode?: number,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "PulseError";
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
	}
}

export class AuthenticationError extends PulseError {
	constructor(
		message = "Authentication required",
		details?: Record<string, unknown>,
	) {
		super(message, "AUTHENTICATION_REQUIRED", 401, details);
		this.name = "AuthenticationError";
	}
}

export class AuthorizationError extends PulseError {
	constructor(
		message = "Insufficient permissions",
		details?: Record<string, unknown>,
	) {
		super(message, "AUTHORIZATION_FAILED", 403, details);
		this.name = "AuthorizationError";
	}
}

export class WorkspaceNotFoundError extends PulseError {
	constructor(workspaceId: string) {
		super(`Workspace not found: ${workspaceId}`, "WORKSPACE_NOT_FOUND", 404, {
			workspaceId,
		});
		this.name = "WorkspaceNotFoundError";
	}
}

export class MembershipError extends PulseError {
	constructor(
		message = "User is not a member of this workspace",
		details?: Record<string, unknown>,
	) {
		super(message, "MEMBERSHIP_REQUIRED", 403, details);
		this.name = "MembershipError";
	}
}

export class ValidationError extends PulseError {
	constructor(message: string, field?: string) {
		super(message, "VALIDATION_ERROR", 400, { field });
		this.name = "ValidationError";
	}
}
