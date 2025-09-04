/**
 * Shared Helper Functions
 */

// ============================================================================
// Content Sanitization
// ============================================================================

export function sanitizeContent(content: string): string {
	if (!content) return "";

	// Basic XSS prevention - remove potentially dangerous content
	return content
		.replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
		.replace(/<iframe[^>]*>.*?<\/iframe>/gi, "") // Remove iframe tags
		.replace(/javascript:/gi, "") // Remove javascript: protocol
		.replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
		.trim()
		.substring(0, 50000); // Limit content length
}

export function sanitizeTitle(title: string): string {
	if (!title) return "";
	const trimmed = title.trim();
	let out = "";
	for (let i = 0; i < trimmed.length; i++) {
		const ch = trimmed.charCodeAt(i);
		// Skip ASCII control chars (0-31) and DEL (127)
		if (ch >= 32 && ch !== 127) {
			out += trimmed[i] as string;
			if (out.length >= 200) break;
		}
	}
	return out;
}

// ============================================================================
// Date Helpers
// ============================================================================

export function formatDate(timestamp: number, locale = "en-US"): string {
	return new Date(timestamp).toLocaleDateString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function formatDateTime(timestamp: number, locale = "en-US"): string {
	return new Date(timestamp).toLocaleString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getTimeAgo(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const week = 7 * day;
	const month = 30 * day;
	const year = 365 * day;

	if (diff < minute) return "just now";
	if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
	if (diff < day) return `${Math.floor(diff / hour)}h ago`;
	if (diff < week) return `${Math.floor(diff / day)}d ago`;
	if (diff < month) return `${Math.floor(diff / week)}w ago`;
	if (diff < year) return `${Math.floor(diff / month)}mo ago`;

	return `${Math.floor(diff / year)}y ago`;
}

// ============================================================================
// String Helpers
// ============================================================================

export function truncate(text: string, length: number, suffix = "..."): string {
	if (!text || text.length <= length) return text;
	return text.substring(0, length - suffix.length) + suffix;
}

export function capitalize(text: string): string {
	if (!text) return text;
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export function extractPlainText(markdown: string): string {
	return markdown
		.replace(/#{1,6}\s?/g, "") // Remove headers
		.replace(/\*{1,2}(.*?)\*{1,2}/g, "$1") // Remove bold/italic
		.replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Remove code blocks
		.replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links but keep text
		.replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
		.replace(/\n{2,}/g, "\n") // Reduce multiple newlines
		.trim();
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function isValidSlug(slug: string): boolean {
	const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
	return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
}

// ============================================================================
// Array Helpers
// ============================================================================

export function unique<T>(array: T[]): T[] {
	return Array.from(new Set(array));
}

export function groupBy<T, K extends string | number | symbol>(
	array: T[],
	key: (item: T) => K,
): Record<K, T[]> {
	return array.reduce(
		(groups, item) => {
			const groupKey = key(item);
			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(item);
			return groups;
		},
		{} as Record<K, T[]>,
	);
}

export function sortBy<T, K extends string | number | boolean>(
	array: T[],
	key: (item: T) => K,
): T[] {
	return [...array].sort((a, b) => {
		const aVal = key(a);
		const bVal = key(b);

		if (aVal < bVal) return -1;
		if (aVal > bVal) return 1;
		return 0;
	});
}

// ============================================================================
// Object Helpers
// ============================================================================

export function pick<T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
): Pick<T, K> {
	const result = {} as Pick<T, K>;
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return result;
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
	const result = { ...obj };
	for (const key of keys) {
		delete result[key];
	}
	return result;
}

// ============================================================================
// Hash Helpers
// ============================================================================

export function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString(36);
}

// ============================================================================
// Retry Helpers
// ============================================================================

export async function retry<T>(
	fn: () => Promise<T>,
	attempts = 3,
	delay = 1000,
): Promise<T> {
	for (let i = 0; i < attempts; i++) {
		try {
			return await fn();
		} catch (error) {
			if (i === attempts - 1) throw error;
			await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
		}
	}
	throw new Error("Retry failed"); // This should never be reached
}
