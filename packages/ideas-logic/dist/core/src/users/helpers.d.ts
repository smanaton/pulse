/**
 * User Helper Functions
 */
export declare function getDisplayName(user: {
    name?: string;
    email?: string;
}): string;
export declare function getInitials(user: {
    name?: string;
    email?: string;
}): string;
export declare function validateEmail(email: string): {
    valid: boolean;
    error?: string;
};
export declare function validateName(name: string): {
    valid: boolean;
    error?: string;
};
export declare function generateAvatarUrl(user: {
    name?: string;
    email?: string;
}, size?: number): string;
export declare function parseTokenIdentifier(tokenIdentifier: string): {
    provider: string;
    id: string;
} | null;
export declare function isTestUser(tokenIdentifier?: string): boolean;
export declare const USER_LIMITS: {
    readonly MAX_WORKSPACES: 10;
    readonly MAX_NAME_LENGTH: 100;
    readonly MAX_EMAIL_LENGTH: 254;
};
export declare const DEFAULT_USER_PREFERENCES: {
    readonly theme: "system";
    readonly language: "en";
    readonly timezone: string;
    readonly emailNotifications: true;
    readonly desktopNotifications: true;
};
//# sourceMappingURL=helpers.d.ts.map