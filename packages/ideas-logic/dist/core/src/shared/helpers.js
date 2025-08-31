/**
 * Shared Helper Functions
 */
// ============================================================================
// Content Sanitization
// ============================================================================
export function sanitizeContent(content) {
    if (!content)
        return "";
    // Basic XSS prevention - remove potentially dangerous content
    return content
        .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "") // Remove iframe tags
        .replace(/javascript:/gi, "") // Remove javascript: protocol
        .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
        .trim()
        .substring(0, 50000); // Limit content length
}
export function sanitizeTitle(title) {
    if (!title)
        return "";
    return title
        .trim()
        .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
        .substring(0, 200); // Limit title length
}
// ============================================================================
// Date Helpers
// ============================================================================
export function formatDate(timestamp, locale = "en-US") {
    return new Date(timestamp).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
export function formatDateTime(timestamp, locale = "en-US") {
    return new Date(timestamp).toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;
    if (diff < minute)
        return "just now";
    if (diff < hour)
        return `${Math.floor(diff / minute)}m ago`;
    if (diff < day)
        return `${Math.floor(diff / hour)}h ago`;
    if (diff < week)
        return `${Math.floor(diff / day)}d ago`;
    if (diff < month)
        return `${Math.floor(diff / week)}w ago`;
    if (diff < year)
        return `${Math.floor(diff / month)}mo ago`;
    return `${Math.floor(diff / year)}y ago`;
}
// ============================================================================
// String Helpers
// ============================================================================
export function truncate(text, length, suffix = "...") {
    if (!text || text.length <= length)
        return text;
    return text.substring(0, length - suffix.length) + suffix;
}
export function capitalize(text) {
    if (!text)
        return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
export function extractPlainText(markdown) {
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
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function isValidSlug(slug) {
    const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
}
// ============================================================================
// Array Helpers
// ============================================================================
export function unique(array) {
    return Array.from(new Set(array));
}
export function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const groupKey = key(item);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}
export function sortBy(array, key) {
    return [...array].sort((a, b) => {
        const aVal = key(a);
        const bVal = key(b);
        if (aVal < bVal)
            return -1;
        if (aVal > bVal)
            return 1;
        return 0;
    });
}
// ============================================================================
// Object Helpers
// ============================================================================
export function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}
export function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
// ============================================================================
// Hash Helpers
// ============================================================================
export function simpleHash(str) {
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
export async function retry(fn, attempts = 3, delay = 1000) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        }
        catch (error) {
            if (i === attempts - 1)
                throw error;
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
    }
    throw new Error("Retry failed"); // This should never be reached
}
