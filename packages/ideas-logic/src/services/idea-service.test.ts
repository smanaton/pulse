/**
 * Tests for idea service business logic
 */

import { describe, expect, it } from "vitest";
import type { CreateIdeaInput, UpdateIdeaInput } from "../types";
import {
	enhanceIdeaMetadata,
	processBatchIdeaCreation,
	processDuplicateIdea,
	processIdeaCreation,
	processIdeaUpdate,
	processStatusChange,
} from "./idea-service";

describe("Idea Service", () => {
	describe("Idea Creation", () => {
		it("should process valid idea creation successfully", async () => {
			const validInput: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "Test Idea",
				contentMD: "This is a test idea with meaningful content.",
				createdBy: "user123" as any,
			};

			const result = await processIdeaCreation(validInput);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data?.title).toBe("Test Idea");
			expect(result.data?.status).toBe("draft");
			expect(result.data?.workspaceId).toBe("workspace123");
			expect(result.data?.createdBy).toBe("user123");
			expect(typeof result.data?.createdAt).toBe("number");
			expect(typeof result.data?.updatedAt).toBe("number");
		});

		it("should reject invalid idea creation", async () => {
			const invalidInput: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "", // Invalid title
				contentMD: "Content",
				createdBy: "user123" as any,
			};

			const result = await processIdeaCreation(invalidInput);

			expect(result.success).toBe(false);
			expect(result.data).toBeUndefined();
			expect(result.errors).toBeDefined();
			expect(result.errors?.length).toBeGreaterThan(0);
		});

		it("should sanitize title and content", async () => {
			const inputWithWhitespace: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "   Test Idea   ",
				contentMD: '<script>alert("xss")</script>Safe content',
				createdBy: "user123" as any,
			};

			const result = await processIdeaCreation(inputWithWhitespace);

			expect(result.success).toBe(false); // Should fail due to script tag
			expect(result.errors?.some((e) => e.includes("Script tags"))).toBe(true);
		});

		it("should handle optional fields correctly", async () => {
			const inputWithOptionals: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				projectId: "project123" as any,
				folderId: "folder123" as any,
				title: "Test Idea",
				contentMD: "Content",
				contentBlocks: { type: "doc", content: [] },
				createdBy: "user123" as any,
			};

			const result = await processIdeaCreation(inputWithOptionals);

			expect(result.success).toBe(true);
			expect(result.data?.projectId).toBe("project123");
			expect(result.data?.folderId).toBe("folder123");
			expect(result.data?.contentBlocks).toBeDefined();
		});
	});

	describe("Idea Updates", () => {
		const existingIdea = {
			title: "Original Title",
			contentMD: "Original content",
			status: "draft" as const,
			projectId: "project1" as any,
			folderId: "folder1" as any,
		};

		it("should process valid idea update successfully", async () => {
			const updateInput: UpdateIdeaInput = {
				title: "Updated Title",
				status: "active",
			};

			const result = await processIdeaUpdate(updateInput, existingIdea);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data?.title).toBe("Updated Title");
			expect(result.data?.status).toBe("active");
			expect(typeof result.data?.updatedAt).toBe("number");
		});

		it("should reject invalid updates", async () => {
			const invalidUpdate: UpdateIdeaInput = {
				title: "", // Invalid empty title
			};

			const result = await processIdeaUpdate(invalidUpdate, existingIdea);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
		});

		it("should only include changed fields", async () => {
			const partialUpdate: UpdateIdeaInput = {
				title: "New Title",
				// status unchanged
			};

			const result = await processIdeaUpdate(partialUpdate, existingIdea);

			expect(result.success).toBe(true);
			expect(result.data?.title).toBe("New Title");
			expect(result.data?.status).toBeUndefined(); // Not in update data
			expect(result.data?.updatedAt).toBeDefined();
		});
	});

	describe("Idea Enhancement", () => {
		it("should generate metadata correctly", () => {
			const title = "Project Planning Meeting";
			const content =
				"We need to discuss the JavaScript implementation of our React dashboard. The API integration will require TypeScript interfaces.";

			const enhancement = enhanceIdeaMetadata(title, content);

			expect(enhancement.keywords).toBeDefined();
			expect(enhancement.keywords.length).toBeGreaterThan(0);
			expect(enhancement.suggestedTags).toBeDefined();
			expect(enhancement.readingTime).toBeGreaterThan(0);
			expect(enhancement.wordCount).toBeGreaterThan(0);
			expect(enhancement.summary).toBeDefined();
		});

		it("should calculate reading time correctly", () => {
			const shortContent = "Short text";
			const longContent = "word ".repeat(400); // ~400 words

			const shortEnhancement = enhanceIdeaMetadata("Title", shortContent);
			const longEnhancement = enhanceIdeaMetadata("Title", longContent);

			expect(shortEnhancement.readingTime).toBe(1); // Minimum 1 minute
			expect(longEnhancement.readingTime).toBe(2); // ~400 words / 200 = 2 minutes
		});

		it("should generate appropriate summary", () => {
			const content =
				"This is the first paragraph with important information.\n\nThis is the second paragraph with more details.";

			const enhancement = enhanceIdeaMetadata("Title", content);

			expect(enhancement.summary).toContain("first paragraph");
			expect(enhancement.summary?.length).toBeLessThanOrEqual(150);
		});
	});

	describe("Status Changes", () => {
		it("should allow valid status transitions", () => {
			const ideaData = {
				title: "Complete Idea",
				contentMD:
					"This is a complete idea with sufficient content for activation.",
			};

			const result = processStatusChange("draft", "active", ideaData);

			expect(result.success).toBe(true);
			expect(result.newStatus).toBe("active");
		});

		it("should reject activation of incomplete ideas", () => {
			const incompleteIdea = {
				title: "ab", // Too short
				contentMD: "Short.",
			};

			const result = processStatusChange("draft", "active", incompleteIdea);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors?.[0]).toContain("at least 3 characters");
		});

		it("should allow archiving any idea", () => {
			const ideaData = {
				title: "Any Idea",
				contentMD: "Any content",
			};

			const result = processStatusChange("active", "archived", ideaData);

			expect(result.success).toBe(true);
			expect(result.newStatus).toBe("archived");
		});
	});

	describe("Idea Duplication", () => {
		const originalIdea = {
			title: "Original Idea",
			contentMD: "Original content",
			contentBlocks: { type: "doc", content: [] },
			workspaceId: "workspace123" as any,
			projectId: "project123" as any,
			folderId: "folder123" as any,
		};

		it("should duplicate idea correctly", () => {
			const result = processDuplicateIdea(originalIdea, "user123" as any);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data?.title).toBe("Copy of Original Idea");
			expect(result.data?.contentMD).toBe("Original content");
			expect(result.data?.status).toBe("draft");
			expect(result.data?.createdBy).toBe("user123");
			expect(result.data?.workspaceId).toBe(originalIdea.workspaceId);
		});

		it("should allow custom options for duplication", () => {
			const options = {
				newTitle: "Custom Copy Title",
				newFolderId: "newfolder123" as any,
			};

			const result = processDuplicateIdea(
				originalIdea,
				"user123" as any,
				options,
			);

			expect(result.success).toBe(true);
			expect(result.data?.title).toBe("Custom Copy Title");
			expect(result.data?.folderId).toBe("newfolder123");
		});

		it("should deep clone content blocks", () => {
			const result = processDuplicateIdea(originalIdea, "user123" as any);

			expect(result.data?.contentBlocks).not.toBe(originalIdea.contentBlocks);
			expect(result.data?.contentBlocks).toEqual(originalIdea.contentBlocks);
		});
	});

	describe("Batch Operations", () => {
		it("should process multiple valid ideas", async () => {
			const ideas: CreateIdeaInput[] = [
				{
					workspaceId: "workspace123" as any,
					title: "Idea 1",
					contentMD: "Content 1",
					createdBy: "user123" as any,
				},
				{
					workspaceId: "workspace123" as any,
					title: "Idea 2",
					contentMD: "Content 2",
					createdBy: "user123" as any,
				},
			];

			const result = await processBatchIdeaCreation(ideas);

			expect(result.success).toBe(true);
			expect(result.processed).toHaveLength(2);
			expect(result.errors).toHaveLength(0);
		});

		it("should handle mixed valid and invalid ideas", async () => {
			const ideas: CreateIdeaInput[] = [
				{
					workspaceId: "workspace123" as any,
					title: "Valid Idea",
					contentMD: "Valid content",
					createdBy: "user123" as any,
				},
				{
					workspaceId: "workspace123" as any,
					title: "", // Invalid
					contentMD: "Content",
					createdBy: "user123" as any,
				},
			];

			const result = await processBatchIdeaCreation(ideas);

			expect(result.success).toBe(false);
			expect(result.processed).toHaveLength(1);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].index).toBe(1);
		});
	});
});
