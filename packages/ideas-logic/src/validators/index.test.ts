/**
 * Tests for ideas-logic validators
 */

import { describe, expect, it } from "vitest";
import type { CreateIdeaInput, UpdateIdeaInput } from "../types";
import {
	validateBulkCreateIdeas,
	validateContent,
	validateCreateFolderInput,
	validateCreateIdeaInput,
	validateCreateTagInput,
	validateUpdateIdeaInput,
} from "./index";
import {
	IdeaFactory,
	FolderFactory,
	TagFactory,
	ValidationTestData,
} from "../test/factories";

describe("Ideas Logic Validators", () => {
	describe("Idea Validation", () => {
		it("should validate correct idea input", () => {
			const validInput = ValidationTestData.validIdeaInput;

			const result = validateCreateIdeaInput(validInput);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject idea without title", () => {
			const invalidInput = ValidationTestData.invalidIdeaInputs.emptyTitle;

			const result = validateCreateIdeaInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "TITLE_REQUIRED")).toBe(true);
		});

		it("should reject idea with too long title", () => {
			const invalidInput = ValidationTestData.invalidIdeaInputs.longTitle;

			const result = validateCreateIdeaInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "TITLE_TOO_LONG")).toBe(true);
		});

		it("should reject idea with too long content", () => {
			const invalidInput = ValidationTestData.invalidIdeaInputs.longContent;

			const result = validateCreateIdeaInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "CONTENT_TOO_LONG")).toBe(
				true,
			);
		});

		it("should reject idea with invalid block content", () => {
			// Test with a circular reference that can't be JSON.stringified
			const circularInput = ValidationTestData.invalidIdeaInputs.circularBlocks;

			// The validator should catch the JSON.stringify error and return validation result
			const result = validateCreateIdeaInput(circularInput);

			expect(result.valid).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].field).toBe("contentBlocks");
			expect(result.errors[0].code).toBe("INVALID_BLOCKS");
		});
	});

	describe("Idea Update Validation", () => {
		it("should validate correct update input", () => {
			const validUpdate = ValidationTestData.validIdeaUpdate;

			const result = validateUpdateIdeaInput(validUpdate);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject empty title in update", () => {
			const invalidUpdate = ValidationTestData.invalidIdeaUpdates.emptyTitle;

			const result = validateUpdateIdeaInput(invalidUpdate);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "TITLE_EMPTY")).toBe(true);
		});

		it("should reject invalid status in update", () => {
			const invalidUpdate = ValidationTestData.invalidIdeaUpdates.invalidStatus;

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
			const validInput = ValidationTestData.validFolderInput;

			const result = validateCreateFolderInput(validInput);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject folder without name", () => {
			const invalidInput = FolderFactory.createInput({ name: "" });

			const result = validateCreateFolderInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "NAME_REQUIRED")).toBe(true);
		});

		it("should reject folder with too long name", () => {
			const invalidInput = FolderFactory.longNameInput();

			const result = validateCreateFolderInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "NAME_TOO_LONG")).toBe(true);
		});
	});

	describe("Tag Validation", () => {
		it("should validate correct tag input", () => {
			const validInput = TagFactory.createInput({
				name: "Test Tag",
				color: "#FF6B6B",
			});

			const result = validateCreateTagInput(validInput);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject tag with invalid color", () => {
			const invalidInput = TagFactory.createInput({
				name: "Test Tag",
				color: "invalid-color",
			});

			const result = validateCreateTagInput(invalidInput);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.code === "INVALID_COLOR")).toBe(true);
		});

		it("should accept tag without color", () => {
			const validInput = TagFactory.createInput({
				name: "Test Tag",
			});

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
				IdeaFactory.createInput({
					title: "Idea 1",
					contentMD: "Content 1",
				}),
				IdeaFactory.createInput({
					title: "Idea 2",
					contentMD: "Content 2",
				}),
			];

			const results = validateBulkCreateIdeas(ideas);
			expect(results).toHaveLength(2);
			expect(results[0].valid).toBe(true);
			expect(results[1].valid).toBe(true);
		});

		it("should identify invalid ideas in bulk validation", () => {
			const ideas: CreateIdeaInput[] = [
				IdeaFactory.createInput({
					title: "Valid Idea",
					contentMD: "Valid content",
				}),
				IdeaFactory.createInput({
					title: "", // Invalid
					contentMD: "Content",
				}),
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
