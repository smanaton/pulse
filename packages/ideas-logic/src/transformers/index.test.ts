/**
 * Tests for data transformers
 */

import { describe, expect, it, vi } from "vitest";
import type { UpdateIdeaInput } from "../types";
// Local Id type alias to avoid cross-package path resolution in tests
type Id<T extends string> = string & { __tableName: T };

// Mock @pulse/core/shared module - must be hoisted before imports
vi.mock("@pulse/core/shared", () => ({
	sanitizeContent: (content: string) =>
		content.replace(/<script.*?<\/script>/gi, ""),
	sanitizeTitle: (title: string) => {
		if (!title) return "";
		// Intentionally remove ASCII control characters from test inputs without regex control escapes
		const cleaned = Array.from(title.trim())
			.filter((ch) => {
				const code = ch.charCodeAt(0);
				return code > 0x1f && code !== 0x7f; // keep non-control
			})
			.join("");
		return cleaned.substring(0, 200); // Limit title length
	},
}));

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
	transformIdeaForExport,
} from "./index";
import { IdeaFactory, FolderFactory, TagFactory } from "../test/factories";

describe("Data Transformers", () => {
	describe("Idea Transformers", () => {
		it("should transform create idea input correctly", () => {
			const input = IdeaFactory.createInput({
				title: "  Test Idea  ",
				contentMD: 'Test content with <script>alert("xss")</script>',
			});

			const result = transformCreateIdeaInput(input);

			// Transformers pass through data as-is - sanitization happens at Convex layer
			expect(result.title).toBe("  Test Idea  ");
			expect(result.contentMD).toBe(
				'Test content with <script>alert("xss")</script>',
			);
			expect(result.status).toBe("draft");
			expect(result.workspaceId).toBe(input.workspaceId);
			expect(result.createdBy).toBe(input.createdBy);
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
				projectId: "project1" as Id<"projects">,
				folderId: "folder1" as Id<"folders">,
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
				projectId: "project1" as Id<"projects">,
				folderId: "folder1" as Id<"folders">,
			};

			const result = transformUpdateIdeaInput(updateInput, existingIdea);

			expect(result.title).toBe("New Title");
			expect(result.contentMD).toBeUndefined();
			expect(result.status).toBeUndefined();
		});
	});

	describe("Folder Transformers", () => {
		it("should transform create folder input correctly", () => {
			const input = FolderFactory.createInput({
				name: "  Test Folder  ",
			});

			const result = transformCreateFolderInput(input);

			expect(result.name).toBe("Test Folder"); // Trimmed
			expect(result.workspaceId).toBe(input.workspaceId);
			expect(result.createdBy).toBe(input.createdBy);
			expect(typeof result.sortKey).toBe("number");
			expect(typeof result.createdAt).toBe("number");
			expect(typeof result.updatedAt).toBe("number");
		});

		it("should handle parent folder correctly", () => {
			const input = FolderFactory.createInput({
				parentId: "parent123" as Id<"folders">,
				name: "Child Folder",
			});

			const result = transformCreateFolderInput(input);

			expect(result.parentId).toBe("parent123");
		});
	});

	describe("Tag Transformers", () => {
		it("should transform create tag input correctly", () => {
			const input = TagFactory.createInput({
				name: "  Test Tag  ",
				color: "#FF6B6B",
			});

			const result = transformCreateTagInput(input);

			expect(result.name).toBe("test tag"); // Normalized
			expect(result.color).toBe("#FF6B6B");
			expect(result.workspaceId).toBe(input.workspaceId);
			expect(result.createdBy).toBe(input.createdBy);
		});

		it("should generate color if not provided", () => {
			const input = TagFactory.createInput({
				name: "Test Tag",
				color: undefined,
			});

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
			// The function might not perfectly remove all image references,
			// so let's test that it doesn't contain the full image markdown syntax
			expect(plainText).not.toContain("![Image](image.jpg)");
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
			const result = transformIdeaForExport(sampleIdea, "json") as {
				id: string;
				title: string;
				content: string;
				status: string;
				createdAt: number;
				updatedAt: number;
			};

			expect(result.id).toBe("idea123");
			expect(result.title).toBe("Test Idea");
			expect(result.content).toBe(sampleIdea.contentMD);
			expect(result.status).toBe("active");
			expect(result.createdAt).toBe(1640995200000);
		});

		it("should transform idea for markdown export", () => {
			const result = transformIdeaForExport(sampleIdea, "markdown") as string;

			expect(result).toContain("# Test Idea");
			expect(result).toContain(sampleIdea.contentMD);
			expect(result).toContain("---");
			expect(result).toContain("Created:");
		});

		it("should transform idea for CSV export", () => {
			const result = transformIdeaForExport(sampleIdea, "csv") as {
				id: string;
				title: string;
				content: string;
				status: string;
				created_at: string;
				updated_at: string;
			};

			expect(result.id).toBe("idea123");
			expect(result.title).toBe("Test Idea");
			expect(result.content).toContain("\\n"); // Newlines escaped
			expect(result.content).toContain('""quotes""'); // Quotes escaped
			expect(result.created_at).toContain("2022"); // ISO date format
		});
	});
});
