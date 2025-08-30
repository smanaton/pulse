/**
 * Folder Service
 *
 * Business logic for folder management and hierarchy operations.
 */

import type { Id } from "../core/types";
import {
	calculateFolderSortKey,
	transformCreateFolderInput,
	transformUpdateFolderInput,
} from "../transformers";
import type {
	CreateFolderInput,
	FolderHierarchy,
	ProcessedFolderData,
	UpdateFolderInput,
	ValidationResult,
} from "../types";
import {
	validateCreateFolderInput,
	validateUpdateFolderInput,
} from "../validators";

// ============================================================================
// Folder Creation Service
// ============================================================================

export interface FolderCreationResult {
	success: boolean;
	data?: ProcessedFolderData;
	validation?: ValidationResult;
	errors?: string[];
}

export async function processFolderCreation(
	input: CreateFolderInput,
	existingFolderNames?: string[], // For name uniqueness check within parent
): Promise<FolderCreationResult> {
	// Validate input
	const validation = validateCreateFolderInput(input);
	if (!validation.valid) {
		return {
			success: false,
			validation,
			errors: validation.errors.map((e) => e.message),
		};
	}

	// Check for name conflicts within the same parent
	if (existingFolderNames && existingFolderNames.includes(input.name.trim())) {
		return {
			success: false,
			errors: ["A folder with this name already exists in this location"],
		};
	}

	// Transform input to database format
	const processedData = transformCreateFolderInput(input);

	return {
		success: true,
		data: processedData,
	};
}

// ============================================================================
// Folder Update Service
// ============================================================================

export interface FolderUpdateResult {
	success: boolean;
	data?: Partial<ProcessedFolderData>;
	validation?: ValidationResult;
	errors?: string[];
}

export async function processFolderUpdate(
	input: UpdateFolderInput,
	existingFolder: {
		name: string;
		parentId?: Id<"folders">;
	},
	existingFolderNames?: string[], // For name uniqueness check
): Promise<FolderUpdateResult> {
	// Validate input
	const validation = validateUpdateFolderInput(input);
	if (!validation.valid) {
		return {
			success: false,
			validation,
			errors: validation.errors.map((e) => e.message),
		};
	}

	// Check for name conflicts if name is being changed
	if (
		input.name !== undefined &&
		input.name.trim() !== existingFolder.name &&
		existingFolderNames &&
		existingFolderNames.includes(input.name.trim())
	) {
		return {
			success: false,
			errors: ["A folder with this name already exists in this location"],
		};
	}

	// Transform input to database format
	const processedData = transformUpdateFolderInput(input, existingFolder);

	return {
		success: true,
		data: processedData,
	};
}

// ============================================================================
// Folder Hierarchy Service
// ============================================================================

export interface FolderMoveResult {
	success: boolean;
	data?: Partial<ProcessedFolderData>;
	errors?: string[];
}

export function processFolderMove(
	folderId: Id<"folders">,
	targetParentId: Id<"folders"> | undefined,
	folderHierarchy: Map<Id<"folders">, Id<"folders"> | undefined>, // childId -> parentId
): FolderMoveResult {
	// Check for circular dependency
	if (
		targetParentId &&
		wouldCreateCircularDependency(folderId, targetParentId, folderHierarchy)
	) {
		return {
			success: false,
			errors: ["Cannot move folder: would create circular dependency"],
		};
	}

	// Calculate new sort key
	const sortKey = calculateFolderSortKey(targetParentId);

	return {
		success: true,
		data: {
			parentId: targetParentId,
			sortKey,
			updatedAt: Date.now(),
		},
	};
}

function wouldCreateCircularDependency(
	folderId: Id<"folders">,
	targetParentId: Id<"folders">,
	hierarchy: Map<Id<"folders">, Id<"folders"> | undefined>,
): boolean {
	let currentParent = targetParentId;
	const visited = new Set<Id<"folders">>();

	while (currentParent) {
		if (currentParent === folderId) {
			return true; // Circular dependency detected
		}

		if (visited.has(currentParent)) {
			return true; // Loop detected in existing hierarchy
		}

		visited.add(currentParent);
		currentParent = hierarchy.get(currentParent);
	}

	return false;
}

// ============================================================================
// Folder Hierarchy Builder
// ============================================================================

export function buildFolderHierarchy(
	folders: Array<{
		_id: Id<"folders">;
		name: string;
		parentId?: Id<"folders">;
		sortKey: number;
	}>,
	ideaCounts?: Map<Id<"folders">, number>,
): FolderHierarchy[] {
	// Create a map for quick lookup
	const folderMap = new Map(folders.map((f) => [f._id, f]));
	const children = new Map<Id<"folders"> | undefined, typeof folders>();

	// Group folders by parent
	for (const folder of folders) {
		const parentId = folder.parentId;
		if (!children.has(parentId)) {
			children.set(parentId, []);
		}
		children.get(parentId)!.push(folder);
	}

	// Build hierarchy recursively
	function buildSubtree(
		parentId: Id<"folders"> | undefined,
	): FolderHierarchy[] {
		const subfolders = children.get(parentId) || [];

		// Sort by sortKey
		subfolders.sort((a, b) => a.sortKey - b.sortKey);

		return subfolders.map((folder) => ({
			folder: {
				_id: folder._id,
				name: folder.name,
				parentId: folder.parentId,
			},
			children: buildSubtree(folder._id),
			ideaCount: ideaCounts?.get(folder._id) || 0,
		}));
	}

	return buildSubtree(undefined); // Start with root folders
}

// ============================================================================
// Folder Path Service
// ============================================================================

export interface FolderPath {
	folders: Array<{ _id: Id<"folders">; name: string }>;
	fullPath: string;
}

export function buildFolderPath(
	folderId: Id<"folders">,
	folders: Map<Id<"folders">, { name: string; parentId?: Id<"folders"> }>,
): FolderPath {
	const path: Array<{ _id: Id<"folders">; name: string }> = [];
	let currentId: Id<"folders"> | undefined = folderId;

	// Build path from child to root
	while (currentId) {
		const folder = folders.get(currentId);
		if (!folder) break;

		path.unshift({ _id: currentId, name: folder.name });
		currentId = folder.parentId;
	}

	return {
		folders: path,
		fullPath: path.map((f) => f.name).join(" / "),
	};
}

// ============================================================================
// Folder Deletion Service
// ============================================================================

export interface FolderDeletionResult {
	success: boolean;
	affectedFolders: Id<"folders">[];
	affectedIdeas: Id<"ideas">[];
	errors?: string[];
}

export function processFolderDeletion(
	folderId: Id<"folders">,
	folderHierarchy: Map<Id<"folders">, Id<"folders"> | undefined>,
	ideasInFolders: Map<Id<"folders">, Id<"ideas">[]>,
): FolderDeletionResult {
	// Find all descendant folders
	const affectedFolders = [folderId];
	const toProcess = [folderId];

	while (toProcess.length > 0) {
		const currentFolder = toProcess.shift()!;

		// Find children of current folder
		for (const [childId, parentId] of folderHierarchy.entries()) {
			if (parentId === currentFolder && !affectedFolders.includes(childId)) {
				affectedFolders.push(childId);
				toProcess.push(childId);
			}
		}
	}

	// Find all affected ideas
	const affectedIdeas: Id<"ideas">[] = [];
	for (const folder of affectedFolders) {
		const ideas = ideasInFolders.get(folder) || [];
		affectedIdeas.push(...ideas);
	}

	return {
		success: true,
		affectedFolders,
		affectedIdeas,
	};
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchFolderCreationResult {
	success: boolean;
	processed: ProcessedFolderData[];
	errors: Array<{ index: number; errors: string[] }>;
}

export async function processBatchFolderCreation(
	inputs: CreateFolderInput[],
): Promise<BatchFolderCreationResult> {
	const processed: ProcessedFolderData[] = [];
	const errors: Array<{ index: number; errors: string[] }> = [];

	for (let i = 0; i < inputs.length; i++) {
		const result = await processFolderCreation(inputs[i]);
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

// ============================================================================
// Folder Statistics
// ============================================================================

export interface FolderStats {
	totalFolders: number;
	totalIdeas: number;
	maxDepth: number;
	averageIdeasPerFolder: number;
}

export function calculateFolderStats(
	folders: Array<{ _id: Id<"folders">; parentId?: Id<"folders"> }>,
	ideaCounts: Map<Id<"folders">, number>,
): FolderStats {
	const totalFolders = folders.length;
	const totalIdeas = Array.from(ideaCounts.values()).reduce(
		(sum, count) => sum + count,
		0,
	);

	// Calculate max depth
	const folderMap = new Map(folders.map((f) => [f._id, f]));
	let maxDepth = 0;

	for (const folder of folders) {
		let depth = 1;
		let currentParent = folder.parentId;

		while (currentParent) {
			depth++;
			const parent = folderMap.get(currentParent);
			currentParent = parent?.parentId;
		}

		maxDepth = Math.max(maxDepth, depth);
	}

	const averageIdeasPerFolder =
		totalFolders > 0 ? totalIdeas / totalFolders : 0;

	return {
		totalFolders,
		totalIdeas,
		maxDepth,
		averageIdeasPerFolder: Math.round(averageIdeasPerFolder * 100) / 100, // Round to 2 decimal places
	};
}
