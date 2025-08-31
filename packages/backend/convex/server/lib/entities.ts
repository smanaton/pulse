import type { Id } from "../../_generated/dataModel";

/**
 * Entity Base Utilities
 *
 * Provides consistent patterns for entity creation, updates, and management
 * across all Convex backend functions.
 */

// Base entity interfaces
export interface BaseEntity {
	createdAt: number;
	updatedAt: number;
	createdBy: Id<"users">;
}

export interface SoftDeletable {
	deletedAt?: number;
}

export interface WorkspaceScoped {
	workspaceId: Id<"workspaces">;
}

// Common entity combinations
export type WorkspaceEntity = BaseEntity & WorkspaceScoped;
export type SoftDeletableEntity = BaseEntity & SoftDeletable;
export type WorkspaceSoftDeletableEntity = BaseEntity &
	WorkspaceScoped &
	SoftDeletable;

/**
 * Creates a new entity with base fields (timestamps and audit).
 * Use this for entities that don't belong to a workspace.
 */
export function createEntity<T extends Record<string, any>>(
	data: T,
	userId: Id<"users">,
): T & BaseEntity {
	const now = Date.now();
	return {
		...data,
		createdAt: now,
		updatedAt: now,
		createdBy: userId,
	};
}

/**
 * Creates a new workspace-scoped entity with base fields.
 * Use this for most entities in the system.
 */
export function createWorkspaceEntity<T extends Record<string, any>>(
	data: T,
	userId: Id<"users">,
	workspaceId: Id<"workspaces">,
): T & WorkspaceEntity {
	const now = Date.now();
	return {
		...data,
		workspaceId,
		createdAt: now,
		updatedAt: now,
		createdBy: userId,
	};
}

/**
 * Adds updatedAt timestamp to entity updates.
 * Use this for all entity patch operations.
 */
export function withUpdatedAt<T extends Record<string, any>>(
	updates: T,
): T & { updatedAt: number } {
	return {
		...updates,
		updatedAt: Date.now(),
	};
}

/**
 * Creates soft delete update object.
 * Use this instead of actual deletion to preserve data integrity.
 */
export function softDelete(): { deletedAt: number; updatedAt: number } {
	return {
		deletedAt: Date.now(),
		updatedAt: Date.now(),
	};
}

/**
 * Status enums for common entity states
 */
export const IdeaStatus = {
	DRAFT: "draft",
	ACTIVE: "active",
	ARCHIVED: "archived",
} as const;

export const ProjectStatus = {
	ACTIVE: "active",
	ARCHIVED: "archived",
} as const;

export const MoveJobStatus = {
	PENDING: "pending",
	RUNNING: "running",
	COMPLETED: "completed",
	FAILED: "failed",
	CANCELLED: "cancelled",
} as const;

export type IdeaStatus = (typeof IdeaStatus)[keyof typeof IdeaStatus];
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];
export type MoveJobStatus = (typeof MoveJobStatus)[keyof typeof MoveJobStatus];
