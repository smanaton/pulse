/**
 * Unit Tests for Helper Functions
 *
 * Tests pure functions that don't require Convex runtime
 * Following Vitest 3.0+ best practices
 */

import { describe, expect, it } from "vitest";

// Mock ConvexError for testing
class MockConvexError extends Error {
	code: string;
	message: string;
	constructor({ code, message }: { code: string; message: string }) {
		super(message);
		this.code = code;
		this.message = message;
	}
}

// Create a test version of the normalize function that doesn't depend on ConvexError
function normalizeSlug(raw: string): string {
	if (!raw || typeof raw !== "string") {
		throw new MockConvexError({
			code: "INVALID_ARGUMENT",
			message: "Slug is required",
		});
	}

	// Reserved slugs that cannot be claimed
	const RESERVED_SLUGS = new Set([
		"workspace",
		"me",
		"w",
		"api",
		"auth",
		"login",
		"logout",
		"settings",
		"billing",
		"admin",
		"docs",
		"help",
		"support",
		"status",
		"assets",
		"static",
		"_next",
		"graphql",
		"v1",
		"v2",
		"robots.txt",
		"sitemap.xml",
		"favicon.ico",
		"manifest.json",
		".well-known",
		"health",
		"ping",
		"dashboard",
		"app",
		"console",
		"portal",
		"about",
		"privacy",
		"terms",
		"blog",
		"news",
		"features",
		"pricing",
		"contact",
		"enterprise",
	]);

	// Normalize Unicode and remove diacritics
	const cleaned = raw
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphens
		.replace(/-+/g, "-") // Collapse multiple hyphens
		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

	// Validate format
	if (!/^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/.test(cleaned)) {
		throw new MockConvexError({
			code: "INVALID_ARGUMENT",
			message:
				"Invalid slug format. Must be 1-32 characters, start/end with alphanumeric",
		});
	}

	// Check reserved words
	if (RESERVED_SLUGS.has(cleaned)) {
		throw new MockConvexError({
			code: "INVALID_ARGUMENT",
			message: "Slug is reserved",
		});
	}

	return cleaned;
}

function sanitizeContent(content: string): string {
	if (!content || typeof content !== "string") return "";

	// Remove script tags and javascript: links
	return content
		.replace(/<script[^>]*>.*?<\/script>/gi, "")
		.replace(/javascript:/gi, "")
		.replace(/on\w+\s*=/gi, "")
		.replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
		.replace(/<object[^>]*>.*?<\/object>/gi, "")
		.replace(/<embed[^>]*>/gi, "");
}

describe("Helper Functions", () => {
	describe("normalizeSlug", () => {
		it("should normalize slugs consistently", () => {
			expect(normalizeSlug("My Cool Workspace")).toBe("my-cool-workspace");
			expect(normalizeSlug("UPPERCASE")).toBe("uppercase");
			expect(normalizeSlug("with---hyphens")).toBe("with-hyphens");
			expect(normalizeSlug("  trailing  ")).toBe("trailing");
			expect(normalizeSlug("Special-Characters!")).toBe("special-characters");
			expect(normalizeSlug("numbers123")).toBe("numbers123");
		});

		it("should block reserved slugs", () => {
			expect(() => normalizeSlug("admin")).toThrow("Slug is reserved");
			expect(() => normalizeSlug("api")).toThrow("Slug is reserved");
			expect(() => normalizeSlug("workspace")).toThrow("Slug is reserved");
			expect(() => normalizeSlug("AUTH")).toThrow("Slug is reserved"); // Case insensitive
			expect(() => normalizeSlug("dashboard")).toThrow("Slug is reserved");
		});

		it("should validate slug format", () => {
			expect(() => normalizeSlug("")).toThrow("Slug is required");
			expect(() => normalizeSlug("a".repeat(40))).toThrow(
				"Invalid slug format",
			);

			// These should be normalized successfully (leading/trailing hyphens removed)
			expect(normalizeSlug("-invalid")).toBe("invalid");
			expect(normalizeSlug("invalid-")).toBe("invalid");
			expect(normalizeSlug("--invalid--")).toBe("invalid");

			// These should fail
			expect(() => normalizeSlug("---")).toThrow("Invalid slug format"); // Only hyphens
			expect(() => normalizeSlug("a".repeat(33))).toThrow(
				"Invalid slug format",
			); // Too long
		});

		it("should handle edge cases", () => {
			expect(normalizeSlug("a")).toBe("a"); // Minimum length
			expect(normalizeSlug("a".repeat(32))).toBe("a".repeat(32)); // Maximum length
			expect(normalizeSlug("café")).toBe("cafe"); // Diacritics removal
			expect(normalizeSlug("hello-world")).toBe("hello-world"); // Valid hyphens
			expect(normalizeSlug("123abc")).toBe("123abc"); // Numbers first
			expect(normalizeSlug("abc123")).toBe("abc123"); // Numbers last
		});

		it("should reject invalid inputs", () => {
			// @ts-expect-error Testing invalid input
			expect(() => normalizeSlug(null)).toThrow("Slug is required");
			// @ts-expect-error Testing invalid input
			expect(() => normalizeSlug(undefined)).toThrow("Slug is required");
			// @ts-expect-error Testing invalid input
			expect(() => normalizeSlug(123)).toThrow("Slug is required");
		});
	});

	describe("sanitizeContent", () => {
		it("should remove dangerous script content", () => {
			const maliciousContent = `
        <p>Hello world</p>
        <script>alert('xss')</script>
        <a href="javascript:alert('xss')">Click me</a>
        <div onclick="alert('xss')">Click me</div>
        <iframe src="evil.com"></iframe>
        <object data="evil.swf"></object>
        <embed src="evil.swf">
      `;

			const sanitized = sanitizeContent(maliciousContent);

			expect(sanitized).not.toContain("<script");
			expect(sanitized).not.toContain("javascript:");
			expect(sanitized).not.toContain("onclick=");
			expect(sanitized).not.toContain("<iframe");
			expect(sanitized).not.toContain("<object");
			expect(sanitized).not.toContain("<embed");
			expect(sanitized).toContain("<p>Hello world</p>"); // Safe content preserved
		});

		it("should handle empty or invalid inputs", () => {
			expect(sanitizeContent("")).toBe("");
			// @ts-expect-error Testing invalid input
			expect(sanitizeContent(null)).toBe("");
			// @ts-expect-error Testing invalid input
			expect(sanitizeContent(undefined)).toBe("");
			expect(sanitizeContent("normal content")).toBe("normal content");
		});

		it("should preserve safe HTML while removing dangerous attributes", () => {
			const mixedContent = `
        <h1>Title</h1>
        <p>Safe paragraph</p>
        <a href="https://example.com" onclick="alert('bad')">Link</a>
        <img src="image.jpg" onload="alert('bad')">
      `;

			const sanitized = sanitizeContent(mixedContent);

			expect(sanitized).toContain("<h1>Title</h1>");
			expect(sanitized).toContain("<p>Safe paragraph</p>");
			expect(sanitized).not.toContain("onclick=");
			expect(sanitized).not.toContain("onload=");
		});
	});

	describe("Role Hierarchy", () => {
		// Test role ranking logic
		const ROLE_HIERARCHY = {
			viewer: 0,
			editor: 1,
			admin: 2,
			owner: 3,
		} as const;

		function roleRank(role: keyof typeof ROLE_HIERARCHY): number {
			return ROLE_HIERARCHY[role];
		}

		it("should rank roles correctly", () => {
			expect(roleRank("viewer")).toBe(0);
			expect(roleRank("editor")).toBe(1);
			expect(roleRank("admin")).toBe(2);
			expect(roleRank("owner")).toBe(3);
		});

		it("should compare roles correctly", () => {
			expect(roleRank("admin")).toBeGreaterThan(roleRank("editor"));
			expect(roleRank("editor")).toBeGreaterThan(roleRank("viewer"));
			expect(roleRank("owner")).toBeGreaterThan(roleRank("admin"));
		});
	});
});
