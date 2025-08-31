/**
 * Authentication Errors
 */
export declare class PulseError extends Error {
    code: string;
    statusCode?: number;
    details?: Record<string, any>;
    constructor(message: string, code: string, statusCode?: number, details?: Record<string, any>);
}
export declare class AuthenticationError extends PulseError {
    constructor(message?: string, details?: Record<string, any>);
}
export declare class AuthorizationError extends PulseError {
    constructor(message?: string, details?: Record<string, any>);
}
export declare class WorkspaceNotFoundError extends PulseError {
    constructor(workspaceId: string);
}
export declare class MembershipError extends PulseError {
    constructor(message?: string, details?: Record<string, any>);
}
export declare class ValidationError extends PulseError {
    constructor(message: string, field?: string);
}
//# sourceMappingURL=errors.d.ts.map