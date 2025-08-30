/**
 * Workspace Types
 */

import type { Id } from "../types";

export type WorkspaceType = "personal" | "shared";
export type WorkspacePlan = "free" | "team";
export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface CreateWorkspaceInput {
	name: string;
	type: WorkspaceType;
	plan?: WorkspacePlan;
	slug?: string;
}

export interface UpdateWorkspaceInput {
	name?: string;
	slug?: string;
	disabled?: boolean;
}

export interface WorkspaceMemberInput {
	userId: Id<"users">;
	role: WorkspaceRole;
	invitedBy?: Id<"users">;
}

export interface WorkspacePermissions {
	canRead: boolean;
	canWrite: boolean;
	canAdmin: boolean;
	canInvite: boolean;
	canRemoveMembers: boolean;
}
