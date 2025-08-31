/**
 * Shared Constants
 */
// ============================================================================
// Application Constants
// ============================================================================
export const APP_NAME = "Pulse";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "Your personal productivity platform";
// ============================================================================
// Limits and Quotas
// ============================================================================
export const LIMITS = {
    // Content limits
    IDEA_TITLE_MAX_LENGTH: 200,
    IDEA_CONTENT_MAX_LENGTH: 50000,
    FOLDER_NAME_MAX_LENGTH: 100,
    TAG_NAME_MAX_LENGTH: 50,
    // Workspace limits
    WORKSPACE_NAME_MAX_LENGTH: 100,
    WORKSPACE_SLUG_MAX_LENGTH: 50,
    WORKSPACE_MEMBERS_FREE: 5,
    WORKSPACE_MEMBERS_TEAM: 50,
    WORKSPACES_PER_USER: 10,
    // User limits
    USER_NAME_MAX_LENGTH: 100,
    USER_EMAIL_MAX_LENGTH: 254,
    // API limits
    API_REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_BATCH_SIZE: 100,
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};
// ============================================================================
// Feature Flags
// ============================================================================
export const FEATURES = {
    AI_SUGGESTIONS: true,
    WEB_CLIPPER: true,
    REAL_TIME_COLLABORATION: true,
    EXPORT_TO_PDF: true,
    ADVANCED_SEARCH: true,
    CUSTOM_THEMES: false,
    INTEGRATIONS: false,
};
// ============================================================================
// Status Constants
// ============================================================================
export const IDEA_STATUS = {
    DRAFT: "draft",
    ACTIVE: "active",
    ARCHIVED: "archived",
};
export const WORKSPACE_TYPE = {
    PERSONAL: "personal",
    SHARED: "shared",
};
export const WORKSPACE_PLAN = {
    FREE: "free",
    TEAM: "team",
};
export const WORKSPACE_ROLE = {
    OWNER: "owner",
    ADMIN: "admin",
    EDITOR: "editor",
    VIEWER: "viewer",
};
// ============================================================================
// Event Types
// ============================================================================
export const EVENT_TYPES = {
    // Workspace events
    WORKSPACE_CREATED: "workspace_created",
    WORKSPACE_UPDATED: "workspace_updated",
    MEMBER_JOINED: "member_joined",
    MEMBER_LEFT: "member_left",
    // Idea events
    IDEA_CREATED: "idea_created",
    IDEA_UPDATED: "idea_updated",
    IDEA_DELETED: "idea_deleted",
    IDEA_MOVED: "idea_moved",
    // Folder events
    FOLDER_CREATED: "folder_created",
    FOLDER_UPDATED: "folder_updated",
    FOLDER_DELETED: "folder_deleted",
    // Tag events
    TAG_CREATED: "tag_created",
    TAG_APPLIED: "tag_applied",
    TAG_REMOVED: "tag_removed",
    // AI events
    AI_SUGGESTION_GENERATED: "ai_suggestion_generated",
    AI_SUMMARY_CREATED: "ai_summary_created",
    // Web clipper events
    WEB_CLIP_CREATED: "web_clip_created",
    WEB_CLIP_PROCESSED: "web_clip_processed",
};
// ============================================================================
// API Scopes
// ============================================================================
export const API_SCOPES = {
    // Read permissions
    READ: "read",
    WORKSPACE_READ: "workspace:read",
    IDEAS_READ: "ideas:read",
    // Write permissions
    WRITE: "write",
    WORKSPACE_WRITE: "workspace:write",
    IDEAS_WRITE: "ideas:write",
    // Special permissions
    ADMIN: "admin",
    CLIPPER_WRITE: "clipper:write",
};
// ============================================================================
// File Types
// ============================================================================
export const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/markdown",
];
export const IMAGE_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
];
// ============================================================================
// Colors
// ============================================================================
export const TAG_COLORS = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEAA7", // Yellow
    "#DDA0DD", // Purple
    "#98D8C8", // Mint
    "#F7DC6F", // Gold
    "#BB8FCE", // Lavender
    "#85C1E9", // Light Blue
];
// ============================================================================
// Time Constants
// ============================================================================
export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000,
};
// ============================================================================
// Rate Limit Windows
// ============================================================================
export const RATE_LIMITS = {
    INVITE_PER_WORKSPACE: {
        window: TIME.DAY,
        limit: 10,
    },
    INVITE_PER_USER: {
        window: TIME.DAY,
        limit: 50,
    },
    AI_TOKENS_DAILY: {
        window: TIME.DAY,
        limit: 100000,
    },
    MOVE_OPERATIONS: {
        window: TIME.HOUR,
        limit: 5,
    },
    WEB_CLIPS_PER_HOUR: {
        window: TIME.HOUR,
        limit: 100,
    },
};
