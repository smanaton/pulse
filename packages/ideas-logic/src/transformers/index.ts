/**
 * Data Transformers
 *
 * Pure functions that transform input data into the format needed for database storage.
 * These functions handle sanitization, normalization, and data preparation.
 */

import type { Id } from "../core/types";
import { sanitizeContent, sanitizeTitle } from "../core/shared";
import type {
	CreateFolderInput,
	CreateIdeaInput,
	CreateTagInput,
	ProcessedFolderData,
	ProcessedIdeaData,
	ProcessedTagData,
	UpdateFolderInput,
	UpdateIdeaInput,
} from "../types";

// ============================================================================
// Idea Transformers
// ============================================================================

export function transformCreateIdeaInput(
	input: CreateIdeaInput,
): ProcessedIdeaData {
	const now = Date.now();

	return {
		workspaceId: input.workspaceId,
		projectId: input.projectId,
		folderId: input.folderId,
		title: input.title, // Sanitization will be handled at the Convex layer
		contentMD: input.contentMD, // Sanitization will be handled at the Convex layer
		contentBlocks: input.contentBlocks,
		status: "draft" as const,
		createdBy: input.createdBy,
		createdAt: now,
		updatedAt: now,
	};
}

export function transformUpdateIdeaInput(
	input: UpdateIdeaInput,
	existingIdea: {
		title: string;
		contentMD: string;
		contentBlocks?: any;
		status: "draft" | "active" | "archived";
		projectId?: Id<"projects">;
		folderId?: Id<"folders">;
	},
): Partial<ProcessedIdeaData> {
	const updates: Partial<ProcessedIdeaData> = {
		updatedAt: Date.now(),
	};

	// Only include fields that are being updated
	if (input.title !== undefined) {
		updates.title = sanitizeTitle(input.title);
	}

	if (input.contentMD !== undefined) {
		updates.contentMD = sanitizeContent(input.contentMD);
	}

	if (input.contentBlocks !== undefined) {
		updates.contentBlocks = input.contentBlocks;
	}

	if (input.status !== undefined) {
		updates.status = input.status;
	}

	if (input.projectId !== undefined) {
		updates.projectId = input.projectId;
	}

	if (input.folderId !== undefined) {
		updates.folderId = input.folderId;
	}

	return updates;
}

// ============================================================================
// Folder Transformers
// ============================================================================

export function transformCreateFolderInput(
	input: CreateFolderInput,
): ProcessedFolderData {
	const now = Date.now();

	return {
		workspaceId: input.workspaceId,
		parentId: input.parentId,
		name: sanitizeTitle(input.name), // Use sanitizeTitle for folder names too
		sortKey: now, // Use timestamp as default sort key
		createdBy: input.createdBy,
		createdAt: now,
		updatedAt: now,
	};
}

export function transformUpdateFolderInput(
	input: UpdateFolderInput,
	existingFolder: { name: string; parentId?: Id<"folders"> },
): Partial<ProcessedFolderData> {
	const updates: Partial<ProcessedFolderData> = {
		updatedAt: Date.now(),
	};

	if (input.name !== undefined) {
		updates.name = sanitizeTitle(input.name);
	}

	if (input.parentId !== undefined) {
		updates.parentId = input.parentId;
	}

	return updates;
}

export function calculateFolderSortKey(
	parentId?: Id<"folders">,
	insertAfter?: number,
): number {
	// If inserting after a specific item, add a small increment
	if (insertAfter !== undefined) {
		return insertAfter + 1000; // Leave room for future insertions
	}

	// Default to current timestamp
	return Date.now();
}

// ============================================================================
// Tag Transformers
// ============================================================================

export function transformCreateTagInput(
	input: CreateTagInput,
): ProcessedTagData {
	const now = Date.now();

	return {
		workspaceId: input.workspaceId,
		name: normalizeTagName(input.name),
		color: input.color || generateTagColor(input.name),
		createdBy: input.createdBy,
		createdAt: now,
		updatedAt: now,
	};
}

export function normalizeTagName(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, " ") // Normalize whitespace
		.substring(0, 50); // Limit length
}

export function generateTagColor(name: string): string {
	// Generate a consistent color based on tag name
	const colors = [
		"#FF6B6B",
		"#4ECDC4",
		"#45B7D1",
		"#96CEB4",
		"#FFEAA7",
		"#DDA0DD",
		"#98D8C8",
		"#F7DC6F",
		"#BB8FCE",
		"#85C1E9",
	];

	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}

	return colors[Math.abs(hash) % colors.length];
}

// ============================================================================
// Content Extractors
// ============================================================================

export function extractPlainTextFromMarkdown(markdown: string): string {
	return markdown
		.replace(/#{1,6}\s?/g, "") // Remove headers
		.replace(/\*{1,2}(.*?)\*{1,2}/g, "$1") // Remove bold/italic
		.replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Remove code blocks
		.replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links but keep text
		.replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
		.replace(/\n{2,}/g, "\n") // Reduce multiple newlines
		.trim();
}

export function extractKeywordsFromContent(
	content: string,
	maxKeywords = 10,
): string[] {
	const text = extractPlainTextFromMarkdown(content).toLowerCase();

	// Simple keyword extraction (can be enhanced with NLP)
	const words = text
		.split(/\W+/)
		.filter((word) => word.length > 3 && !isCommonWord(word))
		.slice(0, maxKeywords);

	return Array.from(new Set(words)); // Remove duplicates
}

function isCommonWord(word: string): boolean {
	const commonWords = new Set([
		"the",
		"and",
		"for",
		"are",
		"but",
		"not",
		"you",
		"all",
		"can",
		"had",
		"her",
		"was",
		"one",
		"our",
		"out",
		"day",
		"get",
		"has",
		"him",
		"his",
		"how",
		"its",
		"may",
		"new",
		"now",
		"old",
		"see",
		"two",
		"way",
		"who",
		"boy",
		"did",
		"man",
		"men",
		"put",
		"say",
		"she",
		"too",
		"use",
		"with",
		"this",
		"that",
		"they",
		"have",
		"from",
		"they",
		"know",
		"want",
		"been",
		"good",
		"much",
		"some",
		"time",
		"very",
		"when",
		"come",
		"here",
		"just",
		"like",
		"long",
		"make",
		"many",
		"over",
		"such",
		"take",
		"than",
		"them",
		"well",
		"were",
		"what",
		"your",
	]);

	return commonWords.has(word);
}

// ============================================================================
// Search Transformers
// ============================================================================

export function transformSearchQuery(query: string): string {
	return query
		.trim()
		.toLowerCase()
		.replace(/[^\w\s]/g, "") // Remove special characters
		.replace(/\s+/g, " ") // Normalize whitespace
		.substring(0, 100); // Limit query length
}

export function buildSearchTerms(query: string): string[] {
	const cleanQuery = transformSearchQuery(query);
	const terms = cleanQuery.split(" ").filter((term) => term.length > 0);

	// Add partial matches for the last term (for autocomplete)
	if (terms.length > 0) {
		const lastTerm = terms[terms.length - 1];
		if (lastTerm.length >= 3) {
			terms.push(`${lastTerm}*`); // Wildcard for partial matching
		}
	}

	return terms;
}

// ============================================================================
// Export Transformers
// ============================================================================

export function transformIdeaForExport(
	idea: any,
	format: "json" | "markdown" | "csv",
): any {
	switch (format) {
		case "json":
			return {
				id: idea._id,
				title: idea.title,
				content: idea.contentMD,
				status: idea.status,
				createdAt: idea.createdAt,
				updatedAt: idea.updatedAt,
			};

		case "markdown":
			return `# ${idea.title}\n\n${idea.contentMD}\n\n---\n*Created: ${new Date(idea.createdAt).toLocaleDateString()}*`;

		case "csv":
			return {
				id: idea._id,
				title: idea.title.replace(/"/g, '""'), // Escape quotes
				content: idea.contentMD.replace(/"/g, '""').replace(/\n/g, "\\n"),
				status: idea.status,
				created_at: new Date(idea.createdAt).toISOString(),
				updated_at: new Date(idea.updatedAt).toISOString(),
			};

		default:
			return idea;
	}
}

// ============================================================================
// Bulk Operations
// ============================================================================

export function transformBulkCreateIdeas(
	inputs: CreateIdeaInput[],
): ProcessedIdeaData[] {
	return inputs.map(transformCreateIdeaInput);
}

export function transformBulkCreateFolders(
	inputs: CreateFolderInput[],
): ProcessedFolderData[] {
	return inputs.map(transformCreateFolderInput);
}

export function transformBulkCreateTags(
	inputs: CreateTagInput[],
): ProcessedTagData[] {
	return inputs.map(transformCreateTagInput);
}
