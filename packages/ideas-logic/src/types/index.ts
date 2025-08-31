/**
 * Ideas Logic Types
 */

import type { Id } from "@pulse/core/types";

// ============================================================================
// Idea Input Types
// ============================================================================

export interface CreateIdeaInput {
	workspaceId: Id<"workspaces">;
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
	title: string;
	contentMD: string;
	contentBlocks?: any; // BlockNote structured content
	createdBy: Id<"users">;
}

export interface UpdateIdeaInput {
	title?: string;
	contentMD?: string;
	contentBlocks?: any;
	status?: "draft" | "active" | "archived";
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
}

export interface IdeaSearchInput {
	workspaceId: Id<"workspaces">;
	query: string;
	folderId?: Id<"folders">;
	projectId?: Id<"projects">;
	status?: "draft" | "active" | "archived";
	limit?: number;
	offset?: number;
}

// ============================================================================
// Folder Input Types
// ============================================================================

export interface CreateFolderInput {
	workspaceId: Id<"workspaces">;
	parentId?: Id<"folders">;
	name: string;
	createdBy: Id<"users">;
}

export interface UpdateFolderInput {
	name?: string;
	parentId?: Id<"folders">;
}

export interface MoveFolderInput {
	targetParentId?: Id<"folders">;
	sortKey: number;
}

// ============================================================================
// Tag Input Types
// ============================================================================

export interface CreateTagInput {
	workspaceId: Id<"workspaces">;
	name: string;
	color?: string;
	createdBy: Id<"users">;
}

export interface UpdateTagInput {
	name?: string;
	color?: string;
}

export interface TagIdeaInput {
	ideaId: Id<"ideas">;
	tagId: Id<"tags">;
}

// ============================================================================
// Processing Result Types
// ============================================================================

export interface ProcessedIdeaData {
	title: string;
	contentMD: string;
	contentBlocks?: any;
	status: "draft" | "active" | "archived";
	workspaceId: Id<"workspaces">;
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
	createdBy: Id<"users">;
	createdAt: number;
	updatedAt: number;
}

export interface ProcessedFolderData {
	workspaceId: Id<"workspaces">;
	parentId?: Id<"folders">;
	name: string;
	sortKey: number;
	createdBy: Id<"users">;
	createdAt: number;
	updatedAt: number;
}

export interface ProcessedTagData {
	workspaceId: Id<"workspaces">;
	name: string;
	color?: string;
	createdBy: Id<"users">;
	createdAt: number;
	updatedAt: number;
}

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
}

export interface ValidationError {
	field: string;
	message: string;
	code: string;
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface IdeaFilter {
	workspaceId: Id<"workspaces">;
	folderId?: Id<"folders">;
	projectId?: Id<"projects">;
	status?: "draft" | "active" | "archived";
	tagIds?: Id<"tags">[];
	createdBy?: Id<"users">;
	dateRange?: {
		start: number;
		end: number;
	};
}

export interface FolderHierarchy {
	folder: {
		_id: Id<"folders">;
		name: string;
		parentId?: Id<"folders">;
	};
	children: FolderHierarchy[];
	ideaCount: number;
}

// ============================================================================
// Export/Import Types
// ============================================================================

export interface ExportOptions {
	format: "json" | "markdown" | "csv";
	includeDeleted: boolean;
	includeMetadata: boolean;
	dateRange?: {
		start: number;
		end: number;
	};
}

export interface ExportResult {
	format: string;
	data: any;
	metadata: {
		exportedAt: number;
		totalItems: number;
		workspaceId: Id<"workspaces">;
	};
}

export interface ImportOptions {
	format: "json" | "markdown";
	overwriteExisting: boolean;
	preserveIds: boolean;
}

export interface ImportResult {
	success: boolean;
	itemsProcessed: number;
	itemsCreated: number;
	itemsSkipped: number;
	errors: ImportError[];
}

export interface ImportError {
	item: any;
	error: string;
	line?: number;
}
