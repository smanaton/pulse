/**
 * Ideas Logic Validators
 *
 * Pure validation functions that don't depend on Convex.
 * These complement the Convex validators with business logic validation.
 */

import type {
	CreateFolderInput,
	CreateIdeaInput,
	CreateTagInput,
	UpdateFolderInput,
	UpdateIdeaInput,
	ValidationError,
	ValidationResult,
} from "../types";

// ============================================================================
// Idea Validators
// ============================================================================

export function validateCreateIdeaInput(
	input: CreateIdeaInput,
): ValidationResult {
	const errors: ValidationError[] = [];

	// Title validation
	if (!input.title || input.title.trim().length === 0) {
		errors.push({
			field: "title",
			message: "Title is required",
			code: "TITLE_REQUIRED",
		});
	} else if (input.title.trim().length > 200) {
		errors.push({
			field: "title",
			message: "Title must be less than 200 characters",
			code: "TITLE_TOO_LONG",
		});
	}

	// Content validation - allow empty for frictionless capture
	if (input.contentMD && input.contentMD.length > 50000) {
		errors.push({
			field: "contentMD",
			message: "Content must be less than 50,000 characters",
			code: "CONTENT_TOO_LONG",
		});
	}

	// Block content validation
	if (input.contentBlocks) {
		try {
			JSON.stringify(input.contentBlocks);
		} catch {
			errors.push({
				field: "contentBlocks",
				message: "Invalid block content format",
				code: "INVALID_BLOCKS",
			});
		}
	}

	// Required fields
	if (!input.workspaceId) {
		errors.push({
			field: "workspaceId",
			message: "Workspace ID is required",
			code: "WORKSPACE_ID_REQUIRED",
		});
	}

	if (!input.createdBy) {
		errors.push({
			field: "createdBy",
			message: "Creator ID is required",
			code: "CREATOR_ID_REQUIRED",
		});
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

export function validateUpdateIdeaInput(
	input: UpdateIdeaInput,
): ValidationResult {
	const errors: ValidationError[] = [];

	// Title validation (if provided)
	if (input.title !== undefined) {
		if (input.title.trim().length === 0) {
			errors.push({
				field: "title",
				message: "Title cannot be empty",
				code: "TITLE_EMPTY",
			});
		} else if (input.title.trim().length > 200) {
			errors.push({
				field: "title",
				message: "Title must be less than 200 characters",
				code: "TITLE_TOO_LONG",
			});
		}
	}

	// Content validation (if provided)
	if (input.contentMD !== undefined && input.contentMD.length > 50000) {
		errors.push({
			field: "contentMD",
			message: "Content must be less than 50,000 characters",
			code: "CONTENT_TOO_LONG",
		});
	}

	// Block content validation (if provided)
	if (input.contentBlocks) {
		try {
			JSON.stringify(input.contentBlocks);
		} catch {
			errors.push({
				field: "contentBlocks",
				message: "Invalid block content format",
				code: "INVALID_BLOCKS",
			});
		}
	}

	// Status validation (if provided)
	if (input.status && !["draft", "active", "archived"].includes(input.status)) {
		errors.push({
			field: "status",
			message: "Invalid status value",
			code: "INVALID_STATUS",
		});
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

// ============================================================================
// Folder Validators
// ============================================================================

export function validateCreateFolderInput(
	input: CreateFolderInput,
): ValidationResult {
	const errors: ValidationError[] = [];

	// Name validation
	if (!input.name || input.name.trim().length === 0) {
		errors.push({
			field: "name",
			message: "Folder name is required",
			code: "NAME_REQUIRED",
		});
	} else if (input.name.trim().length > 100) {
		errors.push({
			field: "name",
			message: "Folder name must be less than 100 characters",
			code: "NAME_TOO_LONG",
		});
	}

	// Required fields
	if (!input.workspaceId) {
		errors.push({
			field: "workspaceId",
			message: "Workspace ID is required",
			code: "WORKSPACE_ID_REQUIRED",
		});
	}

	if (!input.createdBy) {
		errors.push({
			field: "createdBy",
			message: "Creator ID is required",
			code: "CREATOR_ID_REQUIRED",
		});
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

export function validateUpdateFolderInput(
	input: UpdateFolderInput,
): ValidationResult {
	const errors: ValidationError[] = [];

	// Name validation (if provided)
	if (input.name !== undefined) {
		if (input.name.trim().length === 0) {
			errors.push({
				field: "name",
				message: "Folder name cannot be empty",
				code: "NAME_EMPTY",
			});
		} else if (input.name.trim().length > 100) {
			errors.push({
				field: "name",
				message: "Folder name must be less than 100 characters",
				code: "NAME_TOO_LONG",
			});
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

// ============================================================================
// Tag Validators
// ============================================================================

export function validateCreateTagInput(
	input: CreateTagInput,
): ValidationResult {
	const errors: ValidationError[] = [];

	// Name validation
	if (!input.name || input.name.trim().length === 0) {
		errors.push({
			field: "name",
			message: "Tag name is required",
			code: "NAME_REQUIRED",
		});
	} else if (input.name.trim().length > 50) {
		errors.push({
			field: "name",
			message: "Tag name must be less than 50 characters",
			code: "NAME_TOO_LONG",
		});
	}

	// Color validation (if provided)
	if (input.color && !isValidHexColor(input.color)) {
		errors.push({
			field: "color",
			message: "Invalid color format, must be hex color",
			code: "INVALID_COLOR",
		});
	}

	// Required fields
	if (!input.workspaceId) {
		errors.push({
			field: "workspaceId",
			message: "Workspace ID is required",
			code: "WORKSPACE_ID_REQUIRED",
		});
	}

	if (!input.createdBy) {
		errors.push({
			field: "createdBy",
			message: "Creator ID is required",
			code: "CREATOR_ID_REQUIRED",
		});
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidHexColor(color: string): boolean {
	const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	return hexRegex.test(color);
}

// ============================================================================
// Content Sanitization Validators
// ============================================================================

export function validateContent(content: string): ValidationResult {
	const errors: ValidationError[] = [];

	// Check for potentially dangerous content
	if (content.includes("<script")) {
		errors.push({
			field: "content",
			message: "Script tags are not allowed",
			code: "SCRIPT_NOT_ALLOWED",
		});
	}

	if (content.includes("<iframe")) {
		errors.push({
			field: "content",
			message: "Iframe tags are not allowed",
			code: "IFRAME_NOT_ALLOWED",
		});
	}

	if (content.includes("javascript:")) {
		errors.push({
			field: "content",
			message: "JavaScript URLs are not allowed",
			code: "JAVASCRIPT_URL_NOT_ALLOWED",
		});
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

// ============================================================================
// Bulk Validation
// ============================================================================

export function validateBulkCreateIdeas(
	inputs: CreateIdeaInput[],
): ValidationResult[] {
	return inputs.map(validateCreateIdeaInput);
}

export function validateBulkCreateFolders(
	inputs: CreateFolderInput[],
): ValidationResult[] {
	return inputs.map(validateCreateFolderInput);
}

export function validateBulkCreateTags(
	inputs: CreateTagInput[],
): ValidationResult[] {
	return inputs.map(validateCreateTagInput);
}
