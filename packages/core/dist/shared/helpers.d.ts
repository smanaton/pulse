/**
 * Shared Helper Functions
 */
export declare function sanitizeContent(content: string): string;
export declare function sanitizeTitle(title: string): string;
export declare function formatDate(timestamp: number, locale?: string): string;
export declare function formatDateTime(timestamp: number, locale?: string): string;
export declare function getTimeAgo(timestamp: number): string;
export declare function truncate(text: string, length: number, suffix?: string): string;
export declare function capitalize(text: string): string;
export declare function slugify(text: string): string;
export declare function extractPlainText(markdown: string): string;
export declare function isValidUrl(url: string): boolean;
export declare function isValidEmail(email: string): boolean;
export declare function isValidSlug(slug: string): boolean;
export declare function unique<T>(array: T[]): T[];
export declare function groupBy<T, K extends string | number | symbol>(array: T[], key: (item: T) => K): Record<K, T[]>;
export declare function sortBy<T>(array: T[], key: (item: T) => any): T[];
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export declare function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
export declare function simpleHash(str: string): string;
export declare function retry<T>(fn: () => Promise<T>, attempts?: number, delay?: number): Promise<T>;
//# sourceMappingURL=helpers.d.ts.map