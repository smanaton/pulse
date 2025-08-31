/**
 * Tests for data transformers
 */

import { describe, expect, it } from "vitest";
import type {
	CreateFolderInput,
	CreateIdeaInput,
	CreateTagInput,
	UpdateIdeaInput,
} from "../types";
import {
	buildSearchTerms,
	extractKeywordsFromContent,
	extractPlainTextFromMarkdown,
	generateTagColor,
	normalizeTagName,
	transformCreateFolderInput,
	transformCreateIdeaInput,
	transformCreateTagInput,
	transformSearchQuery,
	transformUpdateIdeaInput,
} from "./index";

// Mock the sanitize functions from @pulse/core
const mockSanitizeContent = (content: string) =>
	content.replace(/<script.*?<\/script>/gi, "");
const mockSanitizeTitle = (title: string) => title.trim().substring(0, 200);

// Mock @pulse/core/shared module
vi.mock("../../../core/src/shared", () => ({
	sanitizeContent: mockSanitizeContent,
	sanitizeTitle: mockSanitizeTitle,
}));

describe("Data Transformers", () => {
	describe("Idea Transformers", () => {
		it("should transform create idea input correctly", () => {
			const input: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "  Test Idea  ",
				contentMD: 'Test content with <script>alert("xss")</script>',
				createdBy: "user123" as any,
			};

			const result = transformCreateIdeaInput(input);

			expect(result.title).toBe("Test Idea"); // Trimmed
			expect(result.contentMD).not.toContain("<script>"); // Sanitized
			expect(result.status).toBe("draft");
			expect(result.workspaceId).toBe("workspace123");
			expect(result.createdBy).toBe("user123");
			expect(typeof result.createdAt).toBe("number");
			expect(typeof result.updatedAt).toBe("number");
			expect(result.createdAt).toBe(result.updatedAt);
		});

		it("should transform update idea input correctly", () => {
			const updateInput: UpdateIdeaInput = {
				title: "Updated Title",
				status: "active",
				contentMD: "Updated content",
			};

			const existingIdea = {
				title: "Old Title",
				contentMD: "Old content",
				status: "draft" as const,
				projectId: "project1" as any,
				folderId: "folder1" as any,
			};

			const result = transformUpdateIdeaInput(updateInput, existingIdea);

			expect(result.title).toBe("Updated Title");
			expect(result.status).toBe("active");
			expect(result.contentMD).toBe("Updated content");
			expect(result.projectId).toBeUndefined(); // Not being updated
			expect(result.updatedAt).toBeDefined();
			expect(typeof result.updatedAt).toBe("number");
		});

		it("should only include changed fields in update", () => {
			const updateInput: UpdateIdeaInput = {
				title: "New Title",
				// Other fields unchanged
			};

			const existingIdea = {
				title: "Old Title",
				contentMD: "Content",
				status: "draft" as const,
				projectId: "project1" as any,
				folderId: "folder1" as any,
			};

			const result = transformUpdateIdeaInput(updateInput, existingIdea);

			expect(result.title).toBe("New Title");
			expect(result.contentMD).toBeUndefined();
			expect(result.status).toBeUndefined();
		});
	});

	describe("Folder Transformers", () => {
		it("should transform create folder input correctly", () => {
			const input: CreateFolderInput = {
				workspaceId: "workspace123" as any,
				name: "  Test Folder  ",
				createdBy: "user123" as any,
			};

			const result = transformCreateFolderInput(input);

			expect(result.name).toBe("Test Folder"); // Trimmed
			expect(result.workspaceId).toBe("workspace123");
			expect(result.createdBy).toBe("user123");
			expect(typeof result.sortKey).toBe("number");
			expect(typeof result.createdAt).toBe("number");
			expect(typeof result.updatedAt).toBe("number");
		});

		it("should handle parent folder correctly", () => {
			const input: CreateFolderInput = {
				workspaceId: "workspace123" as any,
				parentId: "parent123" as any,
				name: "Child Folder",
				createdBy: "user123" as any,
			};

			const result = transformCreateFolderInput(input);

			expect(result.parentId).toBe("parent123");
		});
	});

	describe("Tag Transformers", () => {
		it("should transform create tag input correctly", () => {
			const input: CreateTagInput = {
				workspaceId: "workspace123" as any,
				name: "  Test Tag  ",
				color: "#FF6B6B",
				createdBy: "user123" as any,
			};

			const result = transformCreateTagInput(input);

			expect(result.name).toBe("test tag"); // Normalized
			expect(result.color).toBe("#FF6B6B");
			expect(result.workspaceId).toBe("workspace123");
			expect(result.createdBy).toBe("user123");
		});

		it("should generate color if not provided", () => {
			const input: CreateTagInput = {
				workspaceId: "workspace123" as any,
				name: "Test Tag",
				createdBy: "user123" as any,
			};

			const result = transformCreateTagInput(input);

			expect(result.color).toBeDefined();
			expect(result.color).toMatch(/^#[0-9A-Fa-f]{6}$/); // Hex color format
		});

		it("should normalize tag names consistently", () => {
			expect(normalizeTagName("  Test Tag  ")).toBe("test tag");
			expect(normalizeTagName("UPPERCASE")).toBe("uppercase");
			expect(normalizeTagName("Multiple   Spaces")).toBe("multiple spaces");
			expect(normalizeTagName("A".repeat(60))).toHaveLength(50); // Truncated
		});

		it("should generate consistent colors for same input", () => {
			const color1 = generateTagColor("test");
			const color2 = generateTagColor("test");
			const color3 = generateTagColor("different");

			expect(color1).toBe(color2);
			expect(color1).not.toBe(color3);
		});
	});

	describe("Content Extractors", () => {
		it("should extract plain text from markdown correctly", () => {
			const markdown = `
# Header 1
## Header 2

This is **bold** text and *italic* text.
Here's a \`code snippet\` and a [link](https://example.com).

![Image](image.jpg)

\`\`\`javascript
const code = "block";
\`\`\`
`;

			const plainText = extractPlainTextFromMarkdown(markdown);

			expect(plainText).not.toContain("#");
			expect(plainText).not.toContain("**");
			expect(plainText).not.toContain("*");
			expect(plainText).not.toContain("`");
			expect(plainText).not.toContain("[");
			expect(plainText).not.toContain("![");
			expect(plainText).toContain("Header 1");
			expect(plainText).toContain("bold");
			expect(plainText).toContain("link");
			expect(plainText).not.toContain("Image"); // Should remove image alt text
		});

		it("should extract keywords from content", () => {
			const content =
				"JavaScript React TypeScript programming development frontend backend database API testing deployment performance optimization security";

			const keywords = extractKeywordsFromContent(content, 5);

			expect(keywords).toHaveLength(5);
			expect(keywords).toContain("javascript");
			expect(keywords).not.toContain("and"); // Common words filtered
			expect(keywords).not.toContain("the"); // Common words filtered
		});

		it("should filter out common words from keywords", () => {
			const content =
				"The quick brown fox jumps over the lazy dog and runs very fast";

			const keywords = extractKeywordsFromContent(content);

			expect(keywords).not.toContain("the");
			expect(keywords).not.toContain("and");
			expect(keywords).not.toContain("over");
			expect(keywords.length).toBeGreaterThan(0);
		});
	});

	describe("Search Transformers", () => {
		it("should transform search queries correctly", () => {
			expect(transformSearchQuery("  Hello World!  ")).toBe("hello world");
			expect(transformSearchQuery("Special@#$%Characters")).toBe(
				"specialcharacters",
			);
			expect(transformSearchQuery("A".repeat(150))).toHaveLength(100); // Truncated
		});

		it("should build search terms correctly", () => {
			const terms = buildSearchTerms("hello world search");

			expect(terms).toContain("hello");
			expect(terms).toContain("world");
			expect(terms).toContain("search");
			expect(terms).toContain("search*"); // Wildcard for last term
		});

		it("should handle short queries in search terms", () => {
			const shortTerms = buildSearchTerms("hi");
			expect(shortTerms).not.toContain("hi*"); // No wildcard for short terms

			const longTerms = buildSearchTerms("hello");
			expect(longTerms).toContain("hello*"); // Wildcard for terms >= 3 chars
		});
	});

	describe("Export Transformers", () => {
		const sampleIdea = {
			_id: "idea123",
			title: "Test Idea",
			contentMD: 'Test content with "quotes" and\nnewlines',
			status: "active",
			createdAt: 1640995200000,
			updatedAt: 1640995200000,
		};

		it("should transform idea for JSON export", () => {
			const result = transformIdeaForExport(sampleIdea, "json");

			expect(result.id).toBe("idea123");
			expect(result.title).toBe("Test Idea");
			expect(result.content).toBe(sampleIdea.contentMD);
			expect(result.status).toBe("active");
			expect(result.createdAt).toBe(1640995200000);
		});

		it("should transform idea for markdown export", () => {
			const result = transformIdeaForExport(sampleIdea, "markdown");

			expect(result).toContain("# Test Idea");
			expect(result).toContain(sampleIdea.contentMD);
			expect(result).toContain("---");
			expect(result).toContain("Created:");
		});

		it("should transform idea for CSV export", () => {
			const result = transformIdeaForExport(sampleIdea, "csv");

			expect(result.id).toBe("idea123");
			expect(result.title).toBe("Test Idea");
			expect(result.content).toContain("\\n"); // Newlines escaped
			expect(result.content).toContain('""quotes""'); // Quotes escaped
			expect(result.created_at).toContain("2022"); // ISO date format
		});
	});
});
