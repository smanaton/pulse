/**
 * @pulse/core - Core Platform Layer
 *
 * Shared types, validators, and utilities for the Pulse platform.
 * This package provides the foundation for all other Pulse modules.
 */
export { AuthenticationError, AuthorizationError, MembershipError, PulseError, ValidationError, WorkspaceNotFoundError, } from "./auth/errors";
export type { AssertMembershipFn, AuthGuardResult, CheckPermissionFn, ConvexContext, MembershipGuardResult, Permission, RequireUserIdFn, } from "./auth/guards";
export { canAccess, getRolePermissions, hasPermission, PERMISSIONS, ROLE_HIERARCHY, ROLE_PERMISSIONS, } from "./auth/guards";
export type { ApiKey, AuthContext, AuthResult, AuthScope } from "./auth/types";
export * from "./shared";
export * from "./types";
export * from "./users";
export * as validators from "./validators";
export { canPromoteRole, generateSlug, getWorkspacePermissions, isValidSlug as isValidWorkspaceSlug, validateWorkspaceName, } from "./workspaces/helpers";
export type { CreateWorkspaceInput, UpdateWorkspaceInput, WorkspaceMemberInput, WorkspacePermissions, WorkspacePlan, WorkspaceType, } from "./workspaces/types";
export declare const VERSION = "0.1.0";
export declare const PACKAGE_NAME = "@pulse/core";
//# sourceMappingURL=index.d.ts.map