/**
 * Convex Repository Adapters
 *
 * These adapters implement the repository interfaces from @pulse/core
 * and provide the data access layer for Convex database operations.
 */

import type { Id } from "@pulse/core";
import type {
	IdeaCreateInput,
	IdeaSearchOptions,
	IdeaUpdateInput,
	IFolderRepository,
	IIdeaRepository,
} from "@pulse/core/ideas/interfaces";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

// ============================================================================
// Base Repository with Common Convex Operations
// ============================================================================

abstract class BaseConvexRepository {
	constructor(protected ctx: MutationCtx | QueryCtx) {}

	/**
	 * Check if context supports mutations
	 */
	protected requireMutationContext(): asserts this is { ctx: MutationCtx } {
		if (!("scheduler" in this.ctx)) {
			throw new Error("This operation requires a mutation context");
		}
	}

	/**
	 * Get current timestamp
	 */
	protected now(): number {
		return Date.now();
	}
}

// ============================================================================
// Idea Repository Implementation
// ============================================================================

export class ConvexIdeaRepository
	extends BaseConvexRepository
	implements IIdeaRepository
{
	async create(
		data: IdeaCreateInput & { createdBy: Id<"users"> },
	): Promise<Id<"ideas">> {
		this.requireMutationContext();

		const now = this.now();
		const ideaData = {
			workspaceId: data.workspaceId,
			projectId: data.projectId,
			folderId: data.folderId,
			title: data.title,
			contentMD: data.contentMD,
			contentBlocks: data.contentBlocks,
			status: "draft" as const,
			createdBy: data.createdBy,
			createdAt: now,
			updatedAt: now,
		};

		return await this.ctx.db.insert("ideas", ideaData);
	}

	async update(id: Id<"ideas">, data: Partial<IdeaUpdateInput>): Promise<void> {
		this.requireMutationContext();

		const updateData = {
			...data,
			updatedAt: this.now(),
		};

		await this.ctx.db.patch(id, updateData);
	}

	async delete(id: Id<"ideas">): Promise<void> {
		this.requireMutationContext();

		// Soft delete
		await this.ctx.db.patch(id, {
			deletedAt: this.now(),
			updatedAt: this.now(),
		});
	}

	async findById(id: Id<"ideas">): Promise<Doc<"ideas"> | null> {
		const idea = await this.ctx.db.get(id);

		// Filter out soft-deleted ideas
		if (idea?.deletedAt) {
			return null;
		}

		return idea;
	}

	async findByWorkspace(
		workspaceId: Id<"workspaces">,
		limit = 50,
	): Promise<Doc<"ideas">[]> {
		const ideas = await this.ctx.db
			.query("ideas")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.order("desc")
			.take(limit);

		return ideas;
	}

	async search(options: IdeaSearchOptions): Promise<Doc<"ideas">[]> {
		let query = this.ctx.db
			.query("ideas")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", options.workspaceId),
			)
			.filter((q) => q.eq(q.field("deletedAt"), undefined));

		// Apply additional filters
		if (options.projectId) {
			query = query.filter((q) =>
				q.eq(q.field("projectId"), options.projectId),
			);
		}

		if (options.folderId) {
			query = query.filter((q) => q.eq(q.field("folderId"), options.folderId));
		}

		if (options.status) {
			query = query.filter((q) => q.eq(q.field("status"), options.status));
		}

		const results = await query.order("desc").take(options.limit || 50);

		// If there's a text query, do client-side filtering for now
		// TODO: Implement full-text search with search indexes
		if (options.query?.trim()) {
			const searchTerm = options.query.toLowerCase();
			return results.filter(
				(idea) =>
					idea.title.toLowerCase().includes(searchTerm) ||
					idea.contentMD.toLowerCase().includes(searchTerm),
			);
		}

		return results;
	}
}

// ============================================================================
// Folder Repository Implementation
// ============================================================================

export class ConvexFolderRepository
	extends BaseConvexRepository
	implements IFolderRepository
{
	async create(data: {
		workspaceId: Id<"workspaces">;
		name: string;
		parentId?: Id<"folders">;
		createdBy: Id<"users">;
	}): Promise<Id<"folders">> {
		this.requireMutationContext();

		const now = this.now();
		const folderData = {
			workspaceId: data.workspaceId,
			parentId: data.parentId,
			name: data.name,
			sortKey: now, // Simple sort key based on creation time
			createdBy: data.createdBy,
			createdAt: now,
			updatedAt: now,
		};

		return await this.ctx.db.insert("folders", folderData);
	}

	async findById(id: Id<"folders">): Promise<Doc<"folders"> | null> {
		const folder = await this.ctx.db.get(id);

		// Filter out soft-deleted folders
		if (folder?.deletedAt) {
			return null;
		}

		return folder;
	}

	async findByWorkspace(
		workspaceId: Id<"workspaces">,
	): Promise<Doc<"folders">[]> {
		const folders = await this.ctx.db
			.query("folders")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		return folders;
	}

	async delete(id: Id<"folders">): Promise<void> {
		this.requireMutationContext();

		// Check if folder has any ideas
		const ideasInFolder = await this.ctx.db
			.query("ideas")
			.withIndex("by_folder", (q) => q.eq("folderId", id))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.first();

		if (ideasInFolder) {
			throw new Error(
				"Cannot delete folder containing ideas. Move or delete ideas first.",
			);
		}

		// Soft delete
		await this.ctx.db.patch(id, {
			deletedAt: this.now(),
			updatedAt: this.now(),
		});
	}
}

// ============================================================================
// Repository Factory
// ============================================================================

export interface IRepositoryContainer {
	ideaRepository: IIdeaRepository;
	folderRepository: IFolderRepository;
}

export function createRepositories(
	ctx: MutationCtx | QueryCtx,
): IRepositoryContainer {
	return {
		ideaRepository: new ConvexIdeaRepository(ctx),
		folderRepository: new ConvexFolderRepository(ctx),
	};
}
