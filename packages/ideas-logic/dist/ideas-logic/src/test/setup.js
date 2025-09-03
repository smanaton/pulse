/**
 * Test setup for ideas-logic package
 */
// Mock @pulse/core/shared functions for testing
import { vi } from "vitest";
// Mock the sanitization functions since they're not core business logic
vi.mock("../../../core/src/shared", () => ({
    sanitizeContent: vi.fn((content) => {
        // Simple mock sanitization
        return content
            .replace(/<script[^>]*>.*?<\/script>/gi, "")
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
            .replace(/javascript:/gi, "")
            .trim()
            .substring(0, 50000);
    }),
    sanitizeTitle: vi.fn((title) => {
        return title
            .trim()
            // biome-ignore lint/suspicious/noControlCharactersInRegex: sanitize helper for test inputs
            .replace(/[\u0000-\u001F\u007F]/g, "")
            .substring(0, 200);
    }),
    formatDate: vi.fn((timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    }),
    truncate: vi.fn((text, length, suffix = "...") => {
        if (!text || text.length <= length)
            return text;
        return text.substring(0, length - suffix.length) + suffix;
    }),
    slugify: vi.fn((text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }),
}));
// Set up global test environment
global.console = {
    ...console,
    // Mock console methods to reduce test noise
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};
