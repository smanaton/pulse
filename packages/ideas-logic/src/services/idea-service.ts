/**
 * Idea Service
 *
 * Core business logic for idea management.
 */

import type { Id } from "../core/types";
import {
	extractKeywordsFromContent,
	transformCreateIdeaInput,
	transformUpdateIdeaInput,
} from "../transformers";
import type {
	CreateIdeaInput,
	ProcessedIdeaData,
	UpdateIdeaInput,
	ValidationResult,
} from "../types";
import {
	validateContent,
	validateCreateIdeaInput,
	validateUpdateIdeaInput,
} from "../validators";

// ============================================================================
// Idea Creation Service
// ============================================================================

export interface IdeaCreationResult {
	success: boolean;
	data?: ProcessedIdeaData;
	validation?: ValidationResult;
	errors?: string[];
}

export async function processIdeaCreation(
	input: CreateIdeaInput,
): Promise<IdeaCreationResult> {
	// Validate input
	const validation = validateCreateIdeaInput(input);
	if (!validation.valid) {
		return {
			success: false,
			validation,
			errors: validation.errors.map((e) => e.message),
		};
	}

	// Additional content validation
	const contentValidation = validateContent(input.contentMD);
	if (!contentValidation.valid) {
		return {
			success: false,
			validation: contentValidation,
			errors: contentValidation.errors.map((e) => e.message),
		};
	}

	// Transform input to database format
	const processedData = transformCreateIdeaInput(input);

	return {
		success: true,
		data: processedData,
	};
}

// ============================================================================
// Idea Update Service
// ============================================================================

export interface IdeaUpdateResult {
	success: boolean;
	data?: Partial<ProcessedIdeaData>;
	validation?: ValidationResult;
	errors?: string[];
}

export async function processIdeaUpdate(
	input: UpdateIdeaInput,
	existingIdea: {
		title: string;
		contentMD: string;
		contentBlocks?: any;
		status: "draft" | "active" | "archived";
		projectId?: Id<"projects">;
		folderId?: Id<"folders">;
	},
): Promise<IdeaUpdateResult> {
	// Validate input
	const validation = validateUpdateIdeaInput(input);
	if (!validation.valid) {
		return {
			success: false,
			validation,
			errors: validation.errors.map((e) => e.message),
		};
	}

	// Validate content if being updated
	if (input.contentMD !== undefined) {
		const contentValidation = validateContent(input.contentMD);
		if (!contentValidation.valid) {
			return {
				success: false,
				validation: contentValidation,
				errors: contentValidation.errors.map((e) => e.message),
			};
		}
	}

	// Transform input to database format
	const processedData = transformUpdateIdeaInput(input, existingIdea);

	return {
		success: true,
		data: processedData,
	};
}

// ============================================================================
// Idea Enhancement Service
// ============================================================================

export interface IdeaEnhancement {
	keywords: string[];
	suggestedTags: string[];
	readingTime: number;
	wordCount: number;
	summary?: string;
}

export function enhanceIdeaMetadata(
	title: string,
	contentMD: string,
): IdeaEnhancement {
	// Extract keywords
	const keywords = extractKeywordsFromContent(`${title} ${contentMD}`);

	// Generate suggested tags from keywords
	const suggestedTags = keywords
		.slice(0, 5) // Top 5 keywords as tag suggestions
		.map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));

	// Calculate reading time (approximate)
	const wordCount = countWords(contentMD);
	const readingTime = Math.max(1, Math.round(wordCount / 200)); // ~200 words per minute

	// Generate simple summary (first paragraph or first 150 chars)
	const summary = generateSimpleSummary(contentMD);

	return {
		keywords,
		suggestedTags,
		readingTime,
		wordCount,
		summary,
	};
}

function countWords(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

function generateSimpleSummary(contentMD: string): string {
	// Get first paragraph or first 150 characters
	const firstParagraph = contentMD.split("\n\n")[0];
	if (firstParagraph && firstParagraph.length <= 150) {
		return firstParagraph.trim();
	}

	return (
		contentMD.substring(0, 150).trim() + (contentMD.length > 150 ? "..." : "")
	);
}

// ============================================================================
// Idea Status Management
// ============================================================================

export interface StatusChangeResult {
	success: boolean;
	newStatus?: "draft" | "active" | "archived";
	errors?: string[];
}

export function processStatusChange(
	currentStatus: "draft" | "active" | "archived",
	newStatus: "draft" | "active" | "archived",
	ideaData: { title: string; contentMD: string },
): StatusChangeResult {
	// Validation rules for status changes
	switch (newStatus) {
		case "active":
			// To activate, idea must have meaningful content
			if (!ideaData.title.trim() || ideaData.title.trim().length < 3) {
				return {
					success: false,
					errors: [
						"Idea must have a title with at least 3 characters to activate",
					],
				};
			}
			if (!ideaData.contentMD.trim() || ideaData.contentMD.trim().length < 10) {
				return {
					success: false,
					errors: ["Idea must have meaningful content to activate"],
				};
			}
			break;

		case "archived":
			// Can always archive
			break;

		case "draft":
			// Can always revert to draft
			break;
	}

	return {
		success: true,
		newStatus,
	};
}

// ============================================================================
// Idea Duplication Service
// ============================================================================

export interface IdeaDuplicationResult {
	success: boolean;
	data?: ProcessedIdeaData;
	errors?: string[];
}

export function processDuplicateIdea(
	originalIdea: {
		title: string;
		contentMD: string;
		contentBlocks?: any;
		workspaceId: Id<"workspaces">;
		projectId?: Id<"projects">;
		folderId?: Id<"folders">;
	},
	createdBy: Id<"users">,
	options?: {
		newTitle?: string;
		newFolderId?: Id<"folders">;
		newProjectId?: Id<"projects">;
	},
): IdeaDuplicationResult {
	const now = Date.now();

	// Generate new title if not provided
	const newTitle = options?.newTitle || `Copy of ${originalIdea.title}`;

	const duplicatedIdea: ProcessedIdeaData = {
		workspaceId: originalIdea.workspaceId,
		projectId: options?.newProjectId || originalIdea.projectId,
		folderId: options?.newFolderId || originalIdea.folderId,
		title: newTitle,
		contentMD: originalIdea.contentMD,
		contentBlocks: originalIdea.contentBlocks
			? JSON.parse(JSON.stringify(originalIdea.contentBlocks))
			: // Deep clone
				undefined,
		status: "draft" as const, // Always start as draft
		createdBy,
		createdAt: now,
		updatedAt: now,
	};

	return {
		success: true,
		data: duplicatedIdea,
	};
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchIdeaCreationResult {
	success: boolean;
	processed: ProcessedIdeaData[];
	errors: Array<{ index: number; errors: string[] }>;
}

export async function processBatchIdeaCreation(
	inputs: CreateIdeaInput[],
): Promise<BatchIdeaCreationResult> {
	const processed: ProcessedIdeaData[] = [];
	const errors: Array<{ index: number; errors: string[] }> = [];

	for (let i = 0; i < inputs.length; i++) {
		const result = await processIdeaCreation(inputs[i]);
		if (result.success && result.data) {
			processed.push(result.data);
		} else {
			errors.push({
				index: i,
				errors: result.errors || ["Unknown error"],
			});
		}
	}

	return {
		success: errors.length === 0,
		processed,
		errors,
	};
}
