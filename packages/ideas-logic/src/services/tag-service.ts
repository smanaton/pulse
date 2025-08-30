/**
 * Tag Service
 *
 * Business logic for tag management and tagging operations.
 */

import type { Id } from "../core/types";
import {
	generateTagColor,
	normalizeTagName,
	transformCreateTagInput,
} from "../transformers";
import type {
	CreateTagInput,
	ProcessedTagData,
	TagIdeaInput,
	ValidationResult,
} from "../types";
import { validateCreateTagInput } from "../validators";

// ============================================================================
// Tag Creation Service
// ============================================================================

export interface TagCreationResult {
	success: boolean;
	data?: ProcessedTagData;
	validation?: ValidationResult;
	errors?: string[];
}

export async function processTagCreation(
	input: CreateTagInput,
	existingTagNames?: string[], // For name uniqueness check
): Promise<TagCreationResult> {
	// Validate input
	const validation = validateCreateTagInput(input);
	if (!validation.valid) {
		return {
			success: false,
			validation,
			errors: validation.errors.map((e) => e.message),
		};
	}

	// Normalize name for comparison
	const normalizedName = normalizeTagName(input.name);

	// Check for name conflicts (normalized comparison)
	if (
		existingTagNames &&
		existingTagNames.some((name) => normalizeTagName(name) === normalizedName)
	) {
		return {
			success: false,
			errors: ["A tag with this name already exists"],
		};
	}

	// Transform input to database format
	const processedData = transformCreateTagInput(input);

	return {
		success: true,
		data: processedData,
	};
}

// ============================================================================
// Tag Application Service
// ============================================================================

export interface TagApplicationResult {
	success: boolean;
	errors?: string[];
}

export function processTagApplication(
	input: TagIdeaInput,
	existingTaggedIdeas?: Id<"ideas">[], // For duplicate check
): TagApplicationResult {
	// Check if tag is already applied to this idea
	if (existingTaggedIdeas && existingTaggedIdeas.includes(input.ideaId)) {
		return {
			success: false,
			errors: ["Tag is already applied to this idea"],
		};
	}

	return {
		success: true,
	};
}

// ============================================================================
// Tag Suggestion Service
// ============================================================================

export interface TagSuggestion {
	name: string;
	color: string;
	confidence: number; // 0-1 score
	reason: string; // Why this tag was suggested
}

export function generateTagSuggestions(
	content: string,
	existingTags: Array<{ name: string; color: string }>,
	options: {
		maxSuggestions?: number;
		minConfidence?: number;
	} = {},
): TagSuggestion[] {
	const { maxSuggestions = 5, minConfidence = 0.3 } = options;
	const suggestions: TagSuggestion[] = [];

	// Extract keywords from content
	const words = content
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 2);

	const wordFreq = new Map<string, number>();
	for (const word of words) {
		wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
	}

	// Technology/programming tags
	const techKeywords = new Map([
		[
			"javascript",
			{ confidence: 0.9, reason: "Programming language detected" },
		],
		[
			"typescript",
			{ confidence: 0.9, reason: "Programming language detected" },
		],
		["react", { confidence: 0.8, reason: "Framework detected" }],
		["node", { confidence: 0.8, reason: "Runtime detected" }],
		["api", { confidence: 0.7, reason: "API-related content" }],
		["database", { confidence: 0.8, reason: "Database-related content" }],
		["security", { confidence: 0.8, reason: "Security-related content" }],
		["performance", { confidence: 0.7, reason: "Performance-related content" }],
		["testing", { confidence: 0.7, reason: "Testing-related content" }],
		["deployment", { confidence: 0.7, reason: "Deployment-related content" }],
	]);

	// Business/workflow tags
	const businessKeywords = new Map([
		["meeting", { confidence: 0.8, reason: "Meeting notes detected" }],
		["project", { confidence: 0.7, reason: "Project-related content" }],
		["client", { confidence: 0.8, reason: "Client-related content" }],
		["design", { confidence: 0.7, reason: "Design-related content" }],
		["marketing", { confidence: 0.8, reason: "Marketing-related content" }],
		["research", { confidence: 0.7, reason: "Research content detected" }],
		["planning", { confidence: 0.7, reason: "Planning content detected" }],
		["review", { confidence: 0.6, reason: "Review content detected" }],
	]);

	// Check for keyword matches
	for (const [word, freq] of wordFreq) {
		const techMatch = techKeywords.get(word);
		const businessMatch = businessKeywords.get(word);

		if (techMatch && techMatch.confidence >= minConfidence) {
			suggestions.push({
				name: capitalizeFirstLetter(word),
				color: generateTagColor(word),
				confidence: Math.min(
					1,
					techMatch.confidence * ((freq / words.length) * 100),
				),
				reason: techMatch.reason,
			});
		} else if (businessMatch && businessMatch.confidence >= minConfidence) {
			suggestions.push({
				name: capitalizeFirstLetter(word),
				color: generateTagColor(word),
				confidence: Math.min(
					1,
					businessMatch.confidence * ((freq / words.length) * 100),
				),
				reason: businessMatch.reason,
			});
		}
	}

	// Look for pattern-based suggestions
	if (
		content.toLowerCase().includes("todo") ||
		content.toLowerCase().includes("task")
	) {
		suggestions.push({
			name: "Todo",
			color: generateTagColor("todo"),
			confidence: 0.8,
			reason: "Todo/task content detected",
		});
	}

	if (
		content.toLowerCase().includes("bug") ||
		content.toLowerCase().includes("issue")
	) {
		suggestions.push({
			name: "Bug",
			color: "#FF6B6B",
			confidence: 0.9,
			reason: "Bug/issue content detected",
		});
	}

	if (
		content.toLowerCase().includes("idea") ||
		content.toLowerCase().includes("concept")
	) {
		suggestions.push({
			name: "Concept",
			color: generateTagColor("concept"),
			confidence: 0.7,
			reason: "Conceptual content detected",
		});
	}

	// Remove duplicates with existing tags
	const existingTagNames = new Set(
		existingTags.map((tag) => normalizeTagName(tag.name)),
	);
	const uniqueSuggestions = suggestions.filter(
		(suggestion) => !existingTagNames.has(normalizeTagName(suggestion.name)),
	);

	// Sort by confidence and limit results
	return uniqueSuggestions
		.sort((a, b) => b.confidence - a.confidence)
		.slice(0, maxSuggestions);
}

function capitalizeFirstLetter(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// Tag Analytics Service
// ============================================================================

export interface TagUsageStats {
	tagId: Id<"tags">;
	name: string;
	color: string;
	usageCount: number;
	lastUsed?: number;
	createdAt: number;
}

export interface TagAnalytics {
	totalTags: number;
	totalTaggedIdeas: number;
	averageTagsPerIdea: number;
	mostUsedTags: TagUsageStats[];
	recentlyUsedTags: TagUsageStats[];
	unusedTags: TagUsageStats[];
}

export function calculateTagAnalytics(
	tags: Array<{
		_id: Id<"tags">;
		name: string;
		color: string;
		createdAt: number;
	}>,
	tagUsage: Map<Id<"tags">, { count: number; lastUsed?: number }>,
): TagAnalytics {
	const tagStats: TagUsageStats[] = tags.map((tag) => {
		const usage = tagUsage.get(tag._id) || { count: 0 };
		return {
			tagId: tag._id,
			name: tag.name,
			color: tag.color || generateTagColor(tag.name),
			usageCount: usage.count,
			lastUsed: usage.lastUsed,
			createdAt: tag.createdAt,
		};
	});

	const totalTags = tags.length;
	const totalTaggedIdeas = Array.from(tagUsage.values()).reduce(
		(sum, usage) => sum + usage.count,
		0,
	);
	const averageTagsPerIdea =
		totalTaggedIdeas > 0
			? totalTaggedIdeas /
				new Set(Array.from(tagUsage.values()).flatMap((u) => u)).size
			: 0;

	// Most used tags (sorted by usage count)
	const mostUsedTags = [...tagStats]
		.sort((a, b) => b.usageCount - a.usageCount)
		.slice(0, 10);

	// Recently used tags (sorted by last used)
	const recentlyUsedTags = [...tagStats]
		.filter((tag) => tag.lastUsed)
		.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
		.slice(0, 10);

	// Unused tags
	const unusedTags = tagStats.filter((tag) => tag.usageCount === 0);

	return {
		totalTags,
		totalTaggedIdeas,
		averageTagsPerIdea: Math.round(averageTagsPerIdea * 100) / 100,
		mostUsedTags,
		recentlyUsedTags,
		unusedTags,
	};
}

// ============================================================================
// Tag Cleanup Service
// ============================================================================

export interface TagCleanupResult {
	success: boolean;
	cleanedTags: Id<"tags">[];
	mergedTags: Array<{
		sourceId: Id<"tags">;
		targetId: Id<"tags">;
		sourceName: string;
		targetName: string;
	}>;
}

export function processTagCleanup(
	tags: Array<{
		_id: Id<"tags">;
		name: string;
		createdAt: number;
	}>,
	tagUsage: Map<Id<"tags">, number>,
	options: {
		removeUnused?: boolean;
		mergeSimilar?: boolean;
		daysUnusedThreshold?: number;
	} = {},
): TagCleanupResult {
	const {
		removeUnused = false,
		mergeSimilar = true,
		daysUnusedThreshold = 90,
	} = options;

	const cleanedTags: Id<"tags">[] = [];
	const mergedTags: Array<{
		sourceId: Id<"tags">;
		targetId: Id<"tags">;
		sourceName: string;
		targetName: string;
	}> = [];

	// Remove unused tags if requested
	if (removeUnused) {
		const unusedThreshold =
			Date.now() - daysUnusedThreshold * 24 * 60 * 60 * 1000;

		for (const tag of tags) {
			const usage = tagUsage.get(tag._id) || 0;
			if (usage === 0 && tag.createdAt < unusedThreshold) {
				cleanedTags.push(tag._id);
			}
		}
	}

	// Merge similar tags if requested
	if (mergeSimilar) {
		const normalizedTags = new Map<string, Id<"tags">>();
		const tagNames = new Map<Id<"tags">, string>();

		for (const tag of tags) {
			if (cleanedTags.includes(tag._id)) continue; // Skip already cleaned tags

			const normalized = normalizeTagName(tag.name);
			tagNames.set(tag._id, tag.name);

			if (normalizedTags.has(normalized)) {
				// Found duplicate - merge with existing
				const existingTagId = normalizedTags.get(normalized)!;
				mergedTags.push({
					sourceId: tag._id,
					targetId: existingTagId,
					sourceName: tag.name,
					targetName: tagNames.get(existingTagId) || "",
				});
				cleanedTags.push(tag._id);
			} else {
				normalizedTags.set(normalized, tag._id);
			}
		}
	}

	return {
		success: true,
		cleanedTags,
		mergedTags,
	};
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchTagCreationResult {
	success: boolean;
	processed: ProcessedTagData[];
	errors: Array<{ index: number; errors: string[] }>;
}

export async function processBatchTagCreation(
	inputs: CreateTagInput[],
): Promise<BatchTagCreationResult> {
	const processed: ProcessedTagData[] = [];
	const errors: Array<{ index: number; errors: string[] }> = [];
	const createdNames = new Set<string>();

	for (let i = 0; i < inputs.length; i++) {
		const normalizedName = normalizeTagName(inputs[i].name);

		// Check for duplicates within the batch
		if (createdNames.has(normalizedName)) {
			errors.push({
				index: i,
				errors: ["Duplicate tag name in batch"],
			});
			continue;
		}

		const result = await processTagCreation(inputs[i]);
		if (result.success && result.data) {
			processed.push(result.data);
			createdNames.add(normalizedName);
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
