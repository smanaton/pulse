/**
 * Workspace Helper Functions
 */
import type { WorkspacePermissions, WorkspaceRole } from "./types";
export declare function generateSlug(name: string): string;
export declare function isValidSlug(slug: string): boolean;
export declare function getWorkspacePermissions(role: WorkspaceRole): WorkspacePermissions;
export declare function canPromoteRole(promoterRole: WorkspaceRole, targetRole: WorkspaceRole): boolean;
export declare function validateWorkspaceName(name: string): {
    valid: boolean;
    error?: string;
};
export declare const WORKSPACE_LIMITS: {
    readonly MAX_MEMBERS_FREE: 5;
    readonly MAX_MEMBERS_TEAM: 50;
    readonly MAX_WORKSPACES_PER_USER: 10;
};
export declare const DEFAULT_WORKSPACE_SETTINGS: {
    readonly allowGuestAccess: false;
    readonly requireInviteApproval: true;
    readonly enableAI: true;
    readonly enableWebClipper: true;
};
//# sourceMappingURL=helpers.d.ts.map