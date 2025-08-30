import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { softDelete, withUpdatedAt } from "./entities";

/**
 * Specific Repository Classes
 *
 * Simple, type-safe repositories for each entity type without generics.
 * Each repository knows exactly what it's working with.
 */

/**
 * Ideas Repository - handles idea-specific operations
 */
export class IdeasRepository {
	async findByWorkspace(
		ctx: QueryCtx | MutationCtx,
		workspaceId: Id<"workspaces">,
		options?: { limit?: number; order?: "asc" | "desc" },
	): Promise<Doc<"ideas">[]> {
		const baseQuery = ctx.db
			.query("ideas")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId));

		let query = options?.order ? baseQuery.order(options.order) : baseQuery;

		query = query.filter((q) => q.eq(q.field("deletedAt"), undefined));

		if (options?.limit) {
			return await query.take(options.limit);
		}

		return await query.collect();
	}

	async findById(
		ctx: QueryCtx | MutationCtx,
		id: Id<"ideas">,
	): Promise<Doc<"ideas"> | null> {
		const idea = await ctx.db.get(id);
		if (!idea || idea.deletedAt !== undefined) return null;
		return idea;
	}

	async create(
		ctx: MutationCtx,
		data: {
			workspaceId: Id<"workspaces">;
			title: string;
			contentMD: string;
			status?: "draft" | "active" | "archived";
			projectId?: Id<"projects">;
			folderId?: Id<"folders">;
			copiedFromId?: Id<"ideas">;
		},
		userId: Id<"users">,
	): Promise<Id<"ideas">> {
		const now = Date.now();
		return await ctx.db.insert("ideas", {
			...data,
			status: data.status || "draft",
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});
	}

	async update(
		ctx: MutationCtx,
		id: Id<"ideas">,
		updates: Partial<
			Pick<
				Doc<"ideas">,
				"title" | "contentMD" | "status" | "projectId" | "folderId"
			>
		>,
	): Promise<void> {
		const updatesWithTimestamp = withUpdatedAt(updates);
		await ctx.db.patch(id, updatesWithTimestamp);
	}

	async softDelete(ctx: MutationCtx, id: Id<"ideas">): Promise<void> {
		const deleteUpdate = softDelete();
		await ctx.db.patch(id, deleteUpdate);
	}
}

/**
 * Projects Repository - handles project-specific operations
 */
export class ProjectsRepository {
	async findByWorkspace(
		ctx: QueryCtx | MutationCtx,
		workspaceId: Id<"workspaces">,
	): Promise<Doc<"projects">[]> {
		return await ctx.db
			.query("projects")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();
	}

	async findById(
		ctx: QueryCtx | MutationCtx,
		id: Id<"projects">,
	): Promise<Doc<"projects"> | null> {
		const project = await ctx.db.get(id);
		if (!project || project.deletedAt !== undefined) return null;
		return project;
	}

	async create(
		ctx: MutationCtx,
		data: {
			workspaceId: Id<"workspaces">;
			name: string;
			description?: string;
			status?: "active" | "archived";
			sortKey?: number;
		},
		userId: Id<"users">,
	): Promise<Id<"projects">> {
		const now = Date.now();
		return await ctx.db.insert("projects", {
			...data,
			status: data.status || "active",
			sortKey: data.sortKey || 0,
			ownerId: userId, // Add the required ownerId field
			priority: "medium", // Add default priority
			actualHours: 0, // Add default actual hours
			progress: 0, // Add default progress
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});
	}

	async update(
		ctx: MutationCtx,
		id: Id<"projects">,
		updates: Partial<
			Pick<Doc<"projects">, "name" | "description" | "status" | "sortKey">
		>,
	): Promise<void> {
		const updatesWithTimestamp = withUpdatedAt(updates);
		await ctx.db.patch(id, updatesWithTimestamp);
	}

	async softDelete(ctx: MutationCtx, id: Id<"projects">): Promise<void> {
		const deleteUpdate = softDelete();
		await ctx.db.patch(id, deleteUpdate);
	}
}

/**
 * Users Repository - handles user operations
 */
export class UsersRepository {
	async findById(
		ctx: QueryCtx | MutationCtx,
		id: Id<"users">,
	): Promise<Doc<"users"> | null> {
		return await ctx.db.get(id);
	}

	async update(
		ctx: MutationCtx,
		id: Id<"users">,
		updates: Partial<Pick<Doc<"users">, "name" | "email" | "image">>,
	): Promise<void> {
		const updatesWithTimestamp = withUpdatedAt(updates);
		await ctx.db.patch(id, updatesWithTimestamp);
	}
}

// Repository instances
export const ideasRepository = new IdeasRepository();
export const projectsRepository = new ProjectsRepository();
export const usersRepository = new UsersRepository();
