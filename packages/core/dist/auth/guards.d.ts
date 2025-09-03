/**
 * Authentication Guards
 *
 * These are type definitions and interfaces for auth guards.
 * The actual implementation stays in Convex functions due to ctx dependency.
 */
import type { Id } from "../types";
export interface ConvexContext {
    auth: {
        getUserIdentity(): Promise<unknown>;
    };
    db: unknown;
}
export interface AuthGuardResult {
    userId: Id<"users">;
}
export interface MembershipGuardResult {
    userId: Id<"users">;
    workspaceId: Id<"workspaces">;
    role: "owner" | "admin" | "editor" | "viewer";
}
export type RequireUserIdFn = (ctx: ConvexContext) => Promise<Id<"users">>;
export type AssertMembershipFn = (ctx: ConvexContext, userId: Id<"users">, workspaceId: Id<"workspaces">, minRole?: "owner" | "admin" | "editor" | "viewer") => Promise<MembershipGuardResult>;
export type CheckPermissionFn = (ctx: ConvexContext, userId: Id<"users">, workspaceId: Id<"workspaces">, permission: string) => Promise<boolean>;
export declare const PERMISSIONS: {
    readonly IDEAS_READ: "ideas:read";
    readonly IDEAS_WRITE: "ideas:write";
    readonly IDEAS_DELETE: "ideas:delete";
    readonly WORKSPACE_READ: "workspace:read";
    readonly WORKSPACE_WRITE: "workspace:write";
    readonly WORKSPACE_ADMIN: "workspace:admin";
    readonly MEMBERS_INVITE: "members:invite";
    readonly MEMBERS_REMOVE: "members:remove";
    readonly SETTINGS_READ: "settings:read";
    readonly SETTINGS_WRITE: "settings:write";
};
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export declare const ROLE_HIERARCHY: {
    readonly owner: 4;
    readonly admin: 3;
    readonly editor: 2;
    readonly viewer: 1;
};
export type WorkspaceRole = keyof typeof ROLE_HIERARCHY;
export declare const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]>;
export declare function hasPermission(role: WorkspaceRole, permission: Permission): boolean;
export declare function canAccess(userRole: WorkspaceRole, minRole: WorkspaceRole): boolean;
export declare function getRolePermissions(role: WorkspaceRole): Permission[];
export declare function createMockAuthGuards(): {
    requireUserId: RequireUserIdFn;
    assertMembership: AssertMembershipFn;
    checkPermission: CheckPermissionFn;
};
//# sourceMappingURL=guards.d.ts.map