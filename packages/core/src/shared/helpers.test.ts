/**
 * Tests for shared helper functions
 */

import { describe, expect, it } from "vitest";
import {
	capitalize,
	extractPlainText,
	formatDate,
	formatDateTime,
	getTimeAgo,
	groupBy,
	isValidEmail,
	isValidSlug,
	isValidUrl,
	omit,
	pick,
	sanitizeContent,
	sanitizeTitle,
	simpleHash,
	slugify,
	sortBy,
	truncate,
	unique,
} from "./helpers";

describe("Shared Helpers", () => {
	describe("Content Sanitization", () => {
		it("should sanitize dangerous HTML content", () => {
			const dangerousContent =
				'<script>alert("xss")</script><p>Safe content</p>';
			const sanitized = sanitizeContent(dangerousContent);

			expect(sanitized).not.toContain("<script>");
			expect(sanitized).not.toContain("alert");
			expect(sanitized).toContain("<p>Safe content</p>");
		});

		it("should remove iframe tags", () => {
			const content = '<iframe src="evil.com"></iframe><p>Good content</p>';
			const sanitized = sanitizeContent(content);

			expect(sanitized).not.toContain("<iframe>");
			expect(sanitized).toContain("<p>Good content</p>");
		});

		it("should remove javascript protocols", () => {
			const content = '<a href="javascript:alert()">Link</a>';
			const sanitized = sanitizeContent(content);

			expect(sanitized).not.toContain("javascript:");
		});

		it("should limit content length", () => {
			const longContent = "a".repeat(60000);
			const sanitized = sanitizeContent(longContent);

			expect(sanitized.length).toBeLessThanOrEqual(50000);
		});

		it("should sanitize titles correctly", () => {
			expect(sanitizeTitle("  Valid Title  ")).toBe("Valid Title");
			expect(sanitizeTitle("A".repeat(300))).toHaveLength(200);
			expect(sanitizeTitle("")).toBe("");
		});
	});

	describe("Date Formatting", () => {
		const testDate = 1640995200000; // 2022-01-01 00:00:00 UTC

		it("should format dates correctly", () => {
			const formatted = formatDate(testDate, "en-US");
			expect(formatted).toContain("2022");
			expect(formatted).toContain("Jan");
		});

		it("should format date-time correctly", () => {
			const formatted = formatDateTime(testDate, "en-US");
			expect(formatted).toContain("2022");
			expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Time format
		});

		it("should calculate time ago correctly", () => {
			const now = Date.now();
			const oneMinuteAgo = now - 60 * 1000;
			const oneHourAgo = now - 60 * 60 * 1000;
			const oneDayAgo = now - 24 * 60 * 60 * 1000;

			expect(getTimeAgo(now - 30000)).toBe("just now");
			expect(getTimeAgo(oneMinuteAgo)).toBe("1m ago");
			expect(getTimeAgo(oneHourAgo)).toBe("1h ago");
			expect(getTimeAgo(oneDayAgo)).toBe("1d ago");
		});
	});

	describe("String Helpers", () => {
		it("should truncate text correctly", () => {
			expect(truncate("Hello World", 5)).toBe("He...");
			expect(truncate("Hi", 10)).toBe("Hi");
			expect(truncate("Hello World", 11)).toBe("Hello World");
		});

		it("should capitalize text correctly", () => {
			expect(capitalize("hello")).toBe("Hello");
			expect(capitalize("HELLO")).toBe("Hello");
			expect(capitalize("")).toBe("");
		});

		it("should create slugs correctly", () => {
			expect(slugify("Hello World!")).toBe("hello-world");
			expect(slugify("Test   Multiple    Spaces")).toBe("test-multiple-spaces");
			expect(slugify("Special@#$%Characters")).toBe("specialcharacters");
		});

		it("should extract plain text from markdown", () => {
			const markdown =
				"# Header\n**Bold** text and *italic* text\n`code` block\n[Link](url)";
			const plain = extractPlainText(markdown);

			expect(plain).not.toContain("#");
			expect(plain).not.toContain("**");
			expect(plain).not.toContain("*");
			expect(plain).not.toContain("`");
			expect(plain).not.toContain("[");
			expect(plain).toContain("Header");
			expect(plain).toContain("Bold");
			expect(plain).toContain("Link");
		});
	});

	describe("Validation Helpers", () => {
		it("should validate URLs correctly", () => {
			expect(isValidUrl("https://example.com")).toBe(true);
			expect(isValidUrl("http://test.org/path")).toBe(true);
			expect(isValidUrl("not-a-url")).toBe(false);
			expect(isValidUrl("ftp://invalid")).toBe(true); // URL constructor accepts FTP
		});

		it("should validate emails correctly", () => {
			expect(isValidEmail("test@example.com")).toBe(true);
			expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
			expect(isValidEmail("invalid-email")).toBe(false);
			expect(isValidEmail("test@")).toBe(false);
			expect(isValidEmail("@example.com")).toBe(false);
		});

		it("should validate slugs correctly", () => {
			expect(isValidSlug("valid-slug")).toBe(true);
			expect(isValidSlug("test123")).toBe(true);
			expect(isValidSlug("a")).toBe(false); // Too short
			expect(isValidSlug("a".repeat(60))).toBe(false); // Too long
			expect(isValidSlug("invalid_slug")).toBe(false); // Contains underscore
			expect(isValidSlug("-invalid")).toBe(false); // Starts with hyphen
		});
	});

	describe("Array Helpers", () => {
		it("should remove duplicates correctly", () => {
			expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
			expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
		});

		it("should group by correctly", () => {
			const items = [
				{ category: "a", value: 1 },
				{ category: "b", value: 2 },
				{ category: "a", value: 3 },
			];

			const grouped = groupBy(items, (item) => item.category);

			expect(grouped.a).toHaveLength(2);
			expect(grouped.b).toHaveLength(1);
			expect(grouped.a?.[0]?.value).toBe(1);
			expect(grouped.a?.[1]?.value).toBe(3);
		});

		it("should sort by correctly", () => {
			const items = [
				{ name: "Charlie", age: 25 },
				{ name: "Alice", age: 30 },
				{ name: "Bob", age: 20 },
			];

			const sortedByName = sortBy(items, (item) => item.name);
			const sortedByAge = sortBy(items, (item) => item.age);

			expect(sortedByName[0]?.name).toBe("Alice");
			expect(sortedByAge[0]?.age).toBe(20);
		});
	});

	describe("Object Helpers", () => {
		it("should pick properties correctly", () => {
			const obj = { a: 1, b: 2, c: 3 };
			const picked = pick(obj, ["a", "c"]);

			expect(picked).toEqual({ a: 1, c: 3 });
			expect("b" in picked).toBe(false);
		});

		it("should omit properties correctly", () => {
			const obj = { a: 1, b: 2, c: 3 };
			const omitted = omit(obj, ["b"]);

			expect(omitted).toEqual({ a: 1, c: 3 });
			expect("b" in omitted).toBe(false);
		});
	});

	describe("Hash Helper", () => {
		it("should create consistent hashes", () => {
			const hash1 = simpleHash("test string");
			const hash2 = simpleHash("test string");
			const hash3 = simpleHash("different string");

			expect(hash1).toBe(hash2);
			expect(hash1).not.toBe(hash3);
			expect(typeof hash1).toBe("string");
			expect(hash1.length).toBeGreaterThan(0);
		});
	});
});
