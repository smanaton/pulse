/**
 * Authentication Guards
 *
 * These are type definitions and interfaces for auth guards.
 * The actual implementation stays in Convex functions due to ctx dependency.
 */

import type { Id } from "../types";

// ============================================================================
// Guard Interfaces
// ============================================================================

export interface ConvexContext {
	auth: {
		getUserIdentity(): Promise<any>;
	};
	db: any;
}

export interface AuthGuardResult {
	userId: Id<"users">;
}

export interface MembershipGuardResult {
	userId: Id<"users">;
	workspaceId: Id<"workspaces">;
	role: "owner" | "admin" | "editor" | "viewer";
}

// ============================================================================
// Guard Function Types
// ============================================================================

export type RequireUserIdFn = (ctx: ConvexContext) => Promise<Id<"users">>;

export type AssertMembershipFn = (
	ctx: ConvexContext,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
	minRole?: "owner" | "admin" | "editor" | "viewer",
) => Promise<MembershipGuardResult>;

export type CheckPermissionFn = (
	ctx: ConvexContext,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
	permission: string,
) => Promise<boolean>;

// ============================================================================
// Permission Constants
// ============================================================================

export const PERMISSIONS = {
	// Ideas permissions
	IDEAS_READ: "ideas:read",
	IDEAS_WRITE: "ideas:write",
	IDEAS_DELETE: "ideas:delete",

	// Workspace permissions
	WORKSPACE_READ: "workspace:read",
	WORKSPACE_WRITE: "workspace:write",
	WORKSPACE_ADMIN: "workspace:admin",

	// Member management
	MEMBERS_INVITE: "members:invite",
	MEMBERS_REMOVE: "members:remove",

	// Settings
	SETTINGS_READ: "settings:read",
	SETTINGS_WRITE: "settings:write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ============================================================================
// Role Hierarchy
// ============================================================================

export const ROLE_HIERARCHY = {
	owner: 4,
	admin: 3,
	editor: 2,
	viewer: 1,
} as const;

export type WorkspaceRole = keyof typeof ROLE_HIERARCHY;

export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
	owner: [
		PERMISSIONS.IDEAS_READ,
		PERMISSIONS.IDEAS_WRITE,
		PERMISSIONS.IDEAS_DELETE,
		PERMISSIONS.WORKSPACE_READ,
		PERMISSIONS.WORKSPACE_WRITE,
		PERMISSIONS.WORKSPACE_ADMIN,
		PERMISSIONS.MEMBERS_INVITE,
		PERMISSIONS.MEMBERS_REMOVE,
		PERMISSIONS.SETTINGS_READ,
		PERMISSIONS.SETTINGS_WRITE,
	],
	admin: [
		PERMISSIONS.IDEAS_READ,
		PERMISSIONS.IDEAS_WRITE,
		PERMISSIONS.IDEAS_DELETE,
		PERMISSIONS.WORKSPACE_READ,
		PERMISSIONS.WORKSPACE_WRITE,
		PERMISSIONS.MEMBERS_INVITE,
		PERMISSIONS.MEMBERS_REMOVE,
		PERMISSIONS.SETTINGS_READ,
		PERMISSIONS.SETTINGS_WRITE,
	],
	editor: [
		PERMISSIONS.IDEAS_READ,
		PERMISSIONS.IDEAS_WRITE,
		PERMISSIONS.WORKSPACE_READ,
		PERMISSIONS.SETTINGS_READ,
	],
	viewer: [
		PERMISSIONS.IDEAS_READ,
		PERMISSIONS.WORKSPACE_READ,
		PERMISSIONS.SETTINGS_READ,
	],
};

// ============================================================================
// Helper Functions
// ============================================================================

export function hasPermission(
	role: WorkspaceRole,
	permission: Permission,
): boolean {
	return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccess(
	userRole: WorkspaceRole,
	minRole: WorkspaceRole,
): boolean {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export function getRolePermissions(role: WorkspaceRole): Permission[] {
	return ROLE_PERMISSIONS[role];
}

// ============================================================================
// Mock Guards for Testing
// ============================================================================

export function createMockAuthGuards() {
	const requireUserId: RequireUserIdFn = async (_ctx) => {
		// Mock implementation for testing
		return "test-user-id" as Id<"users">;
	};

	const assertMembership: AssertMembershipFn = async (
		_ctx,
		userId,
		workspaceId,
		_minRole = "viewer",
	) => {
		// Mock implementation for testing
		return {
			userId,
			workspaceId,
			role: "editor" as const,
		};
	};

	const checkPermission: CheckPermissionFn = async (
		_ctx,
		_userId,
		_workspaceId,
		_permission,
	) => {
		// Mock implementation for testing - grant all permissions
		return true;
	};

	return {
		requireUserId,
		assertMembership,
		checkPermission,
	};
}
