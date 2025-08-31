/**
 * Shared Constants
 */
export declare const APP_NAME = "Pulse";
export declare const APP_VERSION = "1.0.0";
export declare const APP_DESCRIPTION = "Your personal productivity platform";
export declare const LIMITS: {
    readonly IDEA_TITLE_MAX_LENGTH: 200;
    readonly IDEA_CONTENT_MAX_LENGTH: 50000;
    readonly FOLDER_NAME_MAX_LENGTH: 100;
    readonly TAG_NAME_MAX_LENGTH: 50;
    readonly WORKSPACE_NAME_MAX_LENGTH: 100;
    readonly WORKSPACE_SLUG_MAX_LENGTH: 50;
    readonly WORKSPACE_MEMBERS_FREE: 5;
    readonly WORKSPACE_MEMBERS_TEAM: 50;
    readonly WORKSPACES_PER_USER: 10;
    readonly USER_NAME_MAX_LENGTH: 100;
    readonly USER_EMAIL_MAX_LENGTH: 254;
    readonly API_REQUEST_TIMEOUT: 30000;
    readonly MAX_UPLOAD_SIZE: number;
    readonly MAX_BATCH_SIZE: 100;
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
};
export declare const FEATURES: {
    readonly AI_SUGGESTIONS: true;
    readonly WEB_CLIPPER: true;
    readonly REAL_TIME_COLLABORATION: true;
    readonly EXPORT_TO_PDF: true;
    readonly ADVANCED_SEARCH: true;
    readonly CUSTOM_THEMES: false;
    readonly INTEGRATIONS: false;
};
export declare const IDEA_STATUS: {
    readonly DRAFT: "draft";
    readonly ACTIVE: "active";
    readonly ARCHIVED: "archived";
};
export declare const WORKSPACE_TYPE: {
    readonly PERSONAL: "personal";
    readonly SHARED: "shared";
};
export declare const WORKSPACE_PLAN: {
    readonly FREE: "free";
    readonly TEAM: "team";
};
export declare const WORKSPACE_ROLE: {
    readonly OWNER: "owner";
    readonly ADMIN: "admin";
    readonly EDITOR: "editor";
    readonly VIEWER: "viewer";
};
export declare const EVENT_TYPES: {
    readonly WORKSPACE_CREATED: "workspace_created";
    readonly WORKSPACE_UPDATED: "workspace_updated";
    readonly MEMBER_JOINED: "member_joined";
    readonly MEMBER_LEFT: "member_left";
    readonly IDEA_CREATED: "idea_created";
    readonly IDEA_UPDATED: "idea_updated";
    readonly IDEA_DELETED: "idea_deleted";
    readonly IDEA_MOVED: "idea_moved";
    readonly FOLDER_CREATED: "folder_created";
    readonly FOLDER_UPDATED: "folder_updated";
    readonly FOLDER_DELETED: "folder_deleted";
    readonly TAG_CREATED: "tag_created";
    readonly TAG_APPLIED: "tag_applied";
    readonly TAG_REMOVED: "tag_removed";
    readonly AI_SUGGESTION_GENERATED: "ai_suggestion_generated";
    readonly AI_SUMMARY_CREATED: "ai_summary_created";
    readonly WEB_CLIP_CREATED: "web_clip_created";
    readonly WEB_CLIP_PROCESSED: "web_clip_processed";
};
export declare const API_SCOPES: {
    readonly READ: "read";
    readonly WORKSPACE_READ: "workspace:read";
    readonly IDEAS_READ: "ideas:read";
    readonly WRITE: "write";
    readonly WORKSPACE_WRITE: "workspace:write";
    readonly IDEAS_WRITE: "ideas:write";
    readonly ADMIN: "admin";
    readonly CLIPPER_WRITE: "clipper:write";
};
export declare const ALLOWED_FILE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain", "text/markdown"];
export declare const IMAGE_FILE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
export declare const TAG_COLORS: readonly ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];
export declare const TIME: {
    readonly SECOND: 1000;
    readonly MINUTE: number;
    readonly HOUR: number;
    readonly DAY: number;
    readonly WEEK: number;
    readonly MONTH: number;
    readonly YEAR: number;
};
export declare const RATE_LIMITS: {
    readonly INVITE_PER_WORKSPACE: {
        readonly window: number;
        readonly limit: 10;
    };
    readonly INVITE_PER_USER: {
        readonly window: number;
        readonly limit: 50;
    };
    readonly AI_TOKENS_DAILY: {
        readonly window: number;
        readonly limit: 100000;
    };
    readonly MOVE_OPERATIONS: {
        readonly window: number;
        readonly limit: 5;
    };
    readonly WEB_CLIPS_PER_HOUR: {
        readonly window: number;
        readonly limit: 100;
    };
};
//# sourceMappingURL=constants.d.ts.map