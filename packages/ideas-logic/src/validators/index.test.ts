/**
 * Tests for ideas-logic validators
 */

import { describe, expect, it } from "vitest";
import type {
	CreateFolderInput,
	CreateIdeaInput,
	CreateTagInput,
	UpdateIdeaInput,
} from "../types";
import {
	validateBulkCreateIdeas,
	validateContent,
	validateCreateFolderInput,
	validateCreateIdeaInput,
	validateCreateTagInput,
	validateUpdateIdeaInput,
} from "./index";

describe("Ideas Logic Validators", () => {
	describe("Idea Validation", () => {
		it("should validate correct idea input", () => {
			const validInput: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "Test Idea",
				contentMD: "This is test content",
				createdBy: "user123" as any,
			};

			const result = validateCreateIdeaInput(validInput);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject idea without title", () => {
			const invalidInput: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "",
				contentMD: "This is test content",
				createdBy: "user123" as any,
			};

			const result = validateCreateIdeaInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "TITLE_REQUIRED")).toBe(true);
		});

		it("should reject idea with too long title", () => {
			const invalidInput: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "a".repeat(250),
				contentMD: "Content",
				createdBy: "user123" as any,
			};

			const result = validateCreateIdeaInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "TITLE_TOO_LONG")).toBe(true);
		});

		it("should reject idea with too long content", () => {
			const invalidInput: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "Valid Title",
				contentMD: "a".repeat(60000),
				createdBy: "user123" as any,
			};

			const result = validateCreateIdeaInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "CONTENT_TOO_LONG")).toBe(
				true,
			);
		});

		it("should reject idea with invalid block content", () => {
			const invalidInput: CreateIdeaInput = {
				workspaceId: "workspace123" as any,
				title: "Valid Title",
				contentMD: "Valid content",
				contentBlocks: "invalid json",
				createdBy: "user123" as any,
			};

			// This should trigger the JSON.stringify validation
			expect(() => JSON.stringify(invalidInput.contentBlocks)).not.toThrow();

			// But let's test with a circular reference
			const circular: any = {};
			circular.self = circular;

			const circularInput: CreateIdeaInput = {
				...invalidInput,
				contentBlocks: circular,
			};

			expect(() => {
				const _result = validateCreateIdeaInput(circularInput);
				// The validator uses JSON.stringify which will throw on circular references
			}).toThrow();
		});
	});

	describe("Idea Update Validation", () => {
		it("should validate correct update input", () => {
			const validUpdate: UpdateIdeaInput = {
				title: "Updated Title",
				status: "active",
			};

			const result = validateUpdateIdeaInput(validUpdate);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject empty title in update", () => {
			const invalidUpdate: UpdateIdeaInput = {
				title: "",
			};

			const result = validateUpdateIdeaInput(invalidUpdate);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "TITLE_EMPTY")).toBe(true);
		});

		it("should reject invalid status in update", () => {
			const invalidUpdate: UpdateIdeaInput = {
				status: "invalid-status" as any,
			};

			const result = validateUpdateIdeaInput(invalidUpdate);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "INVALID_STATUS")).toBe(true);
		});

		it("should allow undefined fields in update", () => {
			const validUpdate: UpdateIdeaInput = {
				// All fields are optional in update
			};

			const result = validateUpdateIdeaInput(validUpdate);
			expect(result.valid).toBe(true);
		});
	});

	describe("Folder Validation", () => {
		it("should validate correct folder input", () => {
			const validInput: CreateFolderInput = {
				workspaceId: "workspace123" as any,
				name: "Test Folder",
				createdBy: "user123" as any,
			};

			const result = validateCreateFolderInput(validInput);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject folder without name", () => {
			const invalidInput: CreateFolderInput = {
				workspaceId: "workspace123" as any,
				name: "",
				createdBy: "user123" as any,
			};

			const result = validateCreateFolderInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "NAME_REQUIRED")).toBe(true);
		});

		it("should reject folder with too long name", () => {
			const invalidInput: CreateFolderInput = {
				workspaceId: "workspace123" as any,
				name: "a".repeat(150),
				createdBy: "user123" as any,
			};

			const result = validateCreateFolderInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "NAME_TOO_LONG")).toBe(true);
		});
	});

	describe("Tag Validation", () => {
		it("should validate correct tag input", () => {
			const validInput: CreateTagInput = {
				workspaceId: "workspace123" as any,
				name: "Test Tag",
				color: "#FF6B6B",
				createdBy: "user123" as any,
			};

			const result = validateCreateTagInput(validInput);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject tag with invalid color", () => {
			const invalidInput: CreateTagInput = {
				workspaceId: "workspace123" as any,
				name: "Test Tag",
				color: "invalid-color",
				createdBy: "user123" as any,
			};

			const result = validateCreateTagInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "INVALID_COLOR")).toBe(true);
		});

		it("should accept tag without color", () => {
			const validInput: CreateTagInput = {
				workspaceId: "workspace123" as any,
				name: "Test Tag",
				createdBy: "user123" as any,
			};

			const result = validateCreateTagInput(validInput);
			expect(result.valid).toBe(true);
		});
	});

	describe("Content Validation", () => {
		it("should reject content with script tags", () => {
			const dangerousContent = '<script>alert("xss")</script>Normal content';

			const result = validateContent(dangerousContent);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "SCRIPT_NOT_ALLOWED")).toBe(
				true,
			);
		});

		it("should reject content with iframe tags", () => {
			const dangerousContent = '<iframe src="evil.com"></iframe>Normal content';

			const result = validateContent(dangerousContent);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "IFRAME_NOT_ALLOWED")).toBe(
				true,
			);
		});

		it("should reject content with javascript URLs", () => {
			const dangerousContent = '<a href="javascript:alert()">Link</a>';

			const result = validateContent(dangerousContent);
			expect(result.valid).toBe(false);
			expect(
				result.errors.some((e) => e.code === "JAVASCRIPT_URL_NOT_ALLOWED"),
			).toBe(true);
		});

		it("should accept safe content", () => {
			const safeContent =
				'<p>This is <strong>safe</strong> content with <a href="https://example.com">links</a></p>';

			const result = validateContent(safeContent);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});

	describe("Bulk Validation", () => {
		it("should validate multiple ideas correctly", () => {
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

			const results = validateBulkCreateIdeas(ideas);
			expect(results).toHaveLength(2);
			expect(results[0].valid).toBe(true);
			expect(results[1].valid).toBe(true);
		});

		it("should identify invalid ideas in bulk validation", () => {
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

			const results = validateBulkCreateIdeas(ideas);
			expect(results).toHaveLength(2);
			expect(results[0].valid).toBe(true);
			expect(results[1].valid).toBe(false);
			expect(results[1].errors.some((e) => e.code === "TITLE_REQUIRED")).toBe(
				true,
			);
		});
	});
});
