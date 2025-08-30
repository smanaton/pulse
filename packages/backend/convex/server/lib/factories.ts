import type { Id } from "../../_generated/dataModel";
import { createWorkspaceEntity, IdeaStatus, ProjectStatus } from "./entities";

/**
 * Entity Factory Functions
 *
 * Provides type-safe, consistent factory functions for creating entities
 * with sensible defaults and proper validation.
 */

// Idea factory
export interface IdeaFactoryInput {
	title: string;
	contentMD?: string;
	status?: (typeof IdeaStatus)[keyof typeof IdeaStatus];
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
	copiedFromId?: Id<"ideas">;
}

export function createIdea(
	input: IdeaFactoryInput,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
) {
	return createWorkspaceEntity(
		{
			title: input.title.trim(),
			contentMD: input.contentMD?.trim() || "",
			status: input.status || IdeaStatus.DRAFT,
			projectId: input.projectId,
			folderId: input.folderId,
			copiedFromId: input.copiedFromId,
		},
		userId,
		workspaceId,
	);
}

// Project factory
export interface ProjectFactoryInput {
	name: string;
	description?: string;
	status?: (typeof ProjectStatus)[keyof typeof ProjectStatus];
	sortKey?: number;
}

export function createProject(
	input: ProjectFactoryInput,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
) {
	return createWorkspaceEntity(
		{
			name: input.name.trim(),
			description: input.description?.trim(),
			status: input.status || ProjectStatus.ACTIVE,
			sortKey: input.sortKey || 0,
		},
		userId,
		workspaceId,
	);
}

// Folder factory
export interface FolderFactoryInput {
	name: string;
	parentId?: Id<"folders">;
	sortKey?: number;
}

export function createFolder(
	input: FolderFactoryInput,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
) {
	return createWorkspaceEntity(
		{
			name: input.name.trim(),
			parentId: input.parentId,
			sortKey: input.sortKey || 0,
		},
		userId,
		workspaceId,
	);
}

// Tag factory
export interface TagFactoryInput {
	name: string;
	color?: string;
}

export function createTag(
	input: TagFactoryInput,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
) {
	return createWorkspaceEntity(
		{
			name: input.name.toLowerCase().trim(),
			color: input.color,
		},
		userId,
		workspaceId,
	);
}

// File factory
export interface FileFactoryInput {
	name: string;
	size: number;
	contentType: string;
	url: string;
	ideaId?: Id<"ideas">;
}

export function createFile(
	input: FileFactoryInput,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
) {
	return createWorkspaceEntity(
		{
			name: input.name.trim(),
			size: input.size,
			contentType: input.contentType,
			url: input.url,
			ideaId: input.ideaId,
		},
		userId,
		workspaceId,
	);
}

// Rate limit factory
export interface RateLimitFactoryInput {
	type:
		| "invite_per_workspace"
		| "invite_per_user"
		| "ai_tokens_daily"
		| "move_operations";
	count: number;
	windowStart: number;
	windowEnd: number;
	workspaceId?: Id<"workspaces">;
}

export function createRateLimit(
	input: RateLimitFactoryInput,
	userId: Id<"users">,
) {
	return {
		userId,
		workspaceId: input.workspaceId,
		type: input.type,
		count: input.count,
		windowStart: input.windowStart,
		windowEnd: input.windowEnd,
		updatedAt: Date.now(),
	};
}

// Move job factory
export interface MoveJobFactoryInput {
	sourceWorkspaceId: Id<"workspaces">;
	targetWorkspaceId: Id<"workspaces">;
	projectId: Id<"projects">;
	mode: "move" | "copy";
	totalItems: number;
}

export function createMoveJob(input: MoveJobFactoryInput, userId: Id<"users">) {
	const now = Date.now();
	return {
		...input,
		status: "pending" as const,
		totalItems: input.totalItems,
		itemsProcessed: 0,
		batchesProcessed: 0,
		startedBy: userId,
		startedAt: now,
	};
}

// Workspace member factory
export interface WorkspaceMemberFactoryInput {
	workspaceId: Id<"workspaces">;
	userId: Id<"users">;
	role: "owner" | "admin" | "editor" | "viewer";
	invitedBy?: Id<"users">;
	invitedAt?: number;
	joinedAt?: number;
}

export function createWorkspaceMember(input: WorkspaceMemberFactoryInput) {
	const now = Date.now();
	return {
		...input,
		invitedAt: input.invitedAt,
		joinedAt: input.joinedAt || now,
		createdAt: now,
	};
}
