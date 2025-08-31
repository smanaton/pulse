/**
 * Shared Error Types
 */
export * from "../auth/errors";
export declare class NotFoundError extends Error {
    statusCode: number;
    constructor(resource: string, id?: string);
}
export declare class ConflictError extends Error {
    statusCode: number;
    constructor(message: string, _details?: Record<string, any>);
}
export declare class RateLimitError extends Error {
    statusCode: number;
    constructor(message?: string, _retryAfter?: number);
}
export declare class IdeaError extends Error {
    constructor(message: string);
}
export declare class FolderError extends Error {
    constructor(message: string);
}
export declare class WorkspaceError extends Error {
    constructor(message: string);
}
export declare class UserError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map