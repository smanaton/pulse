/**
 * Test setup for ideas-logic package
 */

// Mock @pulse/core/shared functions for testing
import { vi } from "vitest";

// Mock the sanitization functions since they're not core business logic
vi.mock("../../../core/src/shared", () => ({
	sanitizeContent: vi.fn((content: string) => {
		// Simple mock sanitization
		return content
			.replace(/<script[^>]*>.*?<\/script>/gi, "")
			.replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
			.replace(/javascript:/gi, "")
			.trim()
			.substring(0, 50000);
	}),

	sanitizeTitle: vi.fn((title: string) => {
		// Remove ASCII control characters (U+0000–U+001F and U+007F) without regex control escapes
		const cleaned = Array.from(title.trim())
			.filter((ch) => {
				const code = ch.charCodeAt(0);
				return code > 0x1f && code !== 0x7f; // keep non-control
			})
			.join("");
		return cleaned.substring(0, 200);
	}),

	formatDate: vi.fn((timestamp: number) => {
		return new Date(timestamp).toLocaleDateString();
	}),

	truncate: vi.fn((text: string, length: number, suffix = "...") => {
		if (!text || text.length <= length) return text;
		return text.substring(0, length - suffix.length) + suffix;
	}),

	slugify: vi.fn((text: string) => {
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
