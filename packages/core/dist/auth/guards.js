/**
 * Authentication Guards
 *
 * These are type definitions and interfaces for auth guards.
 * The actual implementation stays in Convex functions due to ctx dependency.
 */
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
};
// ============================================================================
// Role Hierarchy
// ============================================================================
export const ROLE_HIERARCHY = {
    owner: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
};
export const ROLE_PERMISSIONS = {
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
export function hasPermission(role, permission) {
    return ROLE_PERMISSIONS[role].includes(permission);
}
export function canAccess(userRole, minRole) {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}
export function getRolePermissions(role) {
    return ROLE_PERMISSIONS[role];
}
// ============================================================================
// Mock Guards for Testing
// ============================================================================
export function createMockAuthGuards() {
    const requireUserId = async (_ctx) => {
        // Mock implementation for testing
        return "test-user-id";
    };
    const assertMembership = async (_ctx, userId, workspaceId, _minRole = "viewer") => {
        // Mock implementation for testing
        return {
            userId,
            workspaceId,
            role: "editor",
        };
    };
    const checkPermission = async (_ctx, _userId, _workspaceId, _permission) => {
        // Mock implementation for testing - grant all permissions
        return true;
    };
    return {
        requireUserId,
        assertMembership,
        checkPermission,
    };
}
