/**
 * Workspace Helper Functions
 */

import type { WorkspacePermissions, WorkspaceRole } from "./types";

// ============================================================================
// Slug Generation
// ============================================================================

export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
		.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
		.substring(0, 50); // Limit length
}

export function isValidSlug(slug: string): boolean {
	const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
	return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
}

// ============================================================================
// Permission Helpers
// ============================================================================

export function getWorkspacePermissions(
	role: WorkspaceRole,
): WorkspacePermissions {
	switch (role) {
		case "owner":
			return {
				canRead: true,
				canWrite: true,
				canAdmin: true,
				canInvite: true,
				canRemoveMembers: true,
			};
		case "admin":
			return {
				canRead: true,
				canWrite: true,
				canAdmin: false,
				canInvite: true,
				canRemoveMembers: true,
			};
		case "editor":
			return {
				canRead: true,
				canWrite: true,
				canAdmin: false,
				canInvite: false,
				canRemoveMembers: false,
			};
		case "viewer":
			return {
				canRead: true,
				canWrite: false,
				canAdmin: false,
				canInvite: false,
				canRemoveMembers: false,
			};
		default:
			return {
				canRead: false,
				canWrite: false,
				canAdmin: false,
				canInvite: false,
				canRemoveMembers: false,
			};
	}
}

export function canPromoteRole(
	promoterRole: WorkspaceRole,
	targetRole: WorkspaceRole,
): boolean {
	const hierarchy: Record<WorkspaceRole, number> = {
		owner: 4,
		admin: 3,
		editor: 2,
		viewer: 1,
	};

	return hierarchy[promoterRole] > hierarchy[targetRole];
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateWorkspaceName(name: string): {
	valid: boolean;
	error?: string;
} {
	if (!name || name.trim().length === 0) {
		return { valid: false, error: "Workspace name is required" };
	}

	if (name.trim().length < 2) {
		return {
			valid: false,
			error: "Workspace name must be at least 2 characters",
		};
	}

	if (name.trim().length > 100) {
		return {
			valid: false,
			error: "Workspace name must be less than 100 characters",
		};
	}

	return { valid: true };
}

// ============================================================================
// Constants
// ============================================================================

export const WORKSPACE_LIMITS = {
	MAX_MEMBERS_FREE: 5,
	MAX_MEMBERS_TEAM: 50,
	MAX_WORKSPACES_PER_USER: 10,
} as const;

export const DEFAULT_WORKSPACE_SETTINGS = {
	allowGuestAccess: false,
	requireInviteApproval: true,
	enableAI: true,
	enableWebClipper: true,
} as const;
