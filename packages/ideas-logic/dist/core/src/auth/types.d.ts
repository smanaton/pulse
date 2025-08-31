/**
 * Authentication Types
 */
import type { Id } from "../types";
export interface AuthContext {
    userId?: Id<"users">;
    isAuthenticated: boolean;
    tokenIdentifier?: string;
}
export interface AuthResult {
    success: boolean;
    userId?: Id<"users">;
    error?: string;
}
export type AuthScope = "read" | "write" | "admin" | "workspace:read" | "workspace:write" | "ideas:read" | "ideas:write" | "clipper:write";
export interface ApiKey {
    _id: Id<"apiKeys">;
    userId: Id<"users">;
    workspaceId: Id<"workspaces">;
    name: string;
    keyHash: string;
    keyPrefix: string;
    device: string;
    scopes: AuthScope[];
    lastUsed?: number;
    expiresAt?: number;
    createdBy: Id<"users">;
    createdAt: number;
    updatedAt: number;
}
//# sourceMappingURL=types.d.ts.map