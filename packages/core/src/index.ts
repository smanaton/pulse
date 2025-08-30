/**
 * @pulse/core - Core Platform Layer
 *
 * Shared types, validators, and utilities for the Pulse platform.
 * This package provides the foundation for all other Pulse modules.
 */

// Authentication utilities
export {
	AuthenticationError,
	AuthorizationError,
	MembershipError,
	PulseError,
	ValidationError,
	WorkspaceNotFoundError,
} from "./auth/errors";
export type {
	AssertMembershipFn,
	AuthGuardResult,
	CheckPermissionFn,
	ConvexContext,
	MembershipGuardResult,
	Permission,
	RequireUserIdFn,
} from "./auth/guards";
export {
	canAccess,
	getRolePermissions,
	hasPermission,
	PERMISSIONS,
	ROLE_HIERARCHY,
	ROLE_PERMISSIONS,
} from "./auth/guards";
export type { ApiKey, AuthContext, AuthResult, AuthScope } from "./auth/types";
// Shared utilities and helpers
export * from "./shared";
// Core types and interfaces
export * from "./types";
// User utilities
export * from "./users";
// Validators (re-export for convenience)
export * as validators from "./validators";
export {
	canPromoteRole,
	generateSlug,
	getWorkspacePermissions,
	isValidSlug as isValidWorkspaceSlug,
	validateWorkspaceName,
} from "./workspaces/helpers";
// Workspace utilities (avoid WorkspaceRole conflict by using explicit exports)
export type {
	CreateWorkspaceInput,
	UpdateWorkspaceInput,
	WorkspaceMemberInput,
	WorkspacePermissions,
	WorkspacePlan,
	WorkspaceType,
} from "./workspaces/types";

// Version information
export const VERSION = "0.1.0";
export const PACKAGE_NAME = "@pulse/core";
