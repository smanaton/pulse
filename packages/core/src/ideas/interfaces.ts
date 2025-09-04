/**
 * Ideas Domain - Service Interfaces
 *
 * Business logic interfaces that define the contracts for idea management.
 * These are implemented by services and consumed by Convex adapters.
 */

import type { Id } from "../types";

// ============================================================================
// Core Domain Types
// ============================================================================

export interface IdeaCreateInput {
	workspaceId: Id<"workspaces">;
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
	title: string;
	contentMD: string;
	contentBlocks?: unknown; // BlockNote structured content
}

export interface IdeaUpdateInput {
	title?: string;
	contentMD?: string;
	contentBlocks?: unknown;
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
	status?: "draft" | "active" | "archived";
}

// Minimal domain entities used by services and repositories
export interface IdeaEntity {
	workspaceId: Id<"workspaces">;
	status: "draft" | "active" | "archived";
	createdBy: Id<"users">;
}

export interface FolderEntity {
	_id: Id<"folders">;
	workspaceId: Id<"workspaces">;
	parentId?: Id<"folders">;
}

export type FolderNode = FolderEntity & { children: FolderNode[] };

export interface IdeaSearchOptions {
	workspaceId: Id<"workspaces">;
	query?: string;
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
	status?: "draft" | "active" | "archived";
	limit?: number;
}

// ============================================================================
// Repository Interfaces (Data Access Layer)
// ============================================================================

export interface IIdeaRepository {
	create(
		data: IdeaCreateInput & { createdBy: Id<"users"> },
	): Promise<Id<"ideas">>;
	update(id: Id<"ideas">, data: Partial<IdeaUpdateInput>): Promise<void>;
	delete(id: Id<"ideas">): Promise<void>;
	findById(id: Id<"ideas">): Promise<IdeaEntity | null>;
	findByWorkspace(
		workspaceId: Id<"workspaces">,
		limit?: number,
	): Promise<IdeaEntity[]>;
	search(options: IdeaSearchOptions): Promise<unknown[]>;
}

export interface IFolderRepository {
	create(data: {
		workspaceId: Id<"workspaces">;
		name: string;
		parentId?: Id<"folders">;
		createdBy: Id<"users">;
	}): Promise<Id<"folders">>;
	findById(id: Id<"folders">): Promise<FolderEntity | null>;
	findByWorkspace(workspaceId: Id<"workspaces">): Promise<FolderEntity[]>;
	delete(id: Id<"folders">): Promise<void>;
}

// ============================================================================
// Service Interfaces (Business Logic Layer)
// ============================================================================

export interface IIdeaService {
	/**
	 * Create a new idea with validation and business rules
	 */
	create(input: IdeaCreateInput): Promise<Id<"ideas">>;

	/**
	 * Update an existing idea with ownership validation
	 */
	update(ideaId: Id<"ideas">, input: IdeaUpdateInput): Promise<void>;

	/**
	 * Delete an idea (soft delete with cleanup)
	 */
	delete(ideaId: Id<"ideas">): Promise<void>;

	/**
	 * Get idea by ID with permission checking
	 */
	get(ideaId: Id<"ideas">): Promise<unknown | null>;

	/**
	 * Search ideas with full-text and filters
	 */
	search(options: IdeaSearchOptions): Promise<unknown[]>;

	/**
	 * Move idea to different folder/project
	 */
	move(
		ideaId: Id<"ideas">,
		targetFolderId?: Id<"folders">,
		targetProjectId?: Id<"projects">,
	): Promise<void>;
}

export interface IFolderService {
	/**
	 * Create a new folder with hierarchy validation
	 */
	create(
		workspaceId: Id<"workspaces">,
		name: string,
		parentId?: Id<"folders">,
	): Promise<Id<"folders">>;

	/**
	 * Delete folder after checking for contents
	 */
	delete(folderId: Id<"folders">): Promise<void>;

	/**
	 * Get folder hierarchy for workspace
	 */
	getHierarchy(workspaceId: Id<"workspaces">): Promise<FolderNode[]>;
}

// ============================================================================
// Context Interfaces (For Dependency Injection)
// ============================================================================

export interface IConvexContext {
	db: unknown; // Database context from Convex
	storage: unknown; // Storage context from Convex
}

export interface IBusinessContext {
	userId: Id<"users">;
	workspaceId?: Id<"workspaces">;
	userRole?: string;
}

// ============================================================================
// Service Factory Interface
// ============================================================================

export interface IServiceContainer {
	ideaService: IIdeaService;
	folderService: IFolderService;
}
