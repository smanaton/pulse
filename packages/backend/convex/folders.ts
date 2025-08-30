import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertMember } from "./helpers";
import { requireUserId } from "./server/lib/authz";

/**
 * List folders in a workspace
 */
export const list = query({
	args: {
		workspaceId: v.id("workspaces"),
		parentId: v.optional(v.id("folders")),
	},
	handler: async (ctx, { workspaceId, parentId }) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, workspaceId);

		const folders = await ctx.db
			.query("folders")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", workspaceId).eq("parentId", parentId ?? undefined),
			)
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.order("asc")
			.collect();

		return folders;
	},
});

/**
 * Create a new folder
 */
export const create = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		parentId: v.optional(v.id("folders")),
		name: v.string(),
	},
	handler: async (ctx, { workspaceId, parentId, name }) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, workspaceId);

		// Get sort key for new folder (last in parent)
		const lastFolder = await ctx.db
			.query("folders")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", workspaceId).eq("parentId", parentId ?? undefined),
			)
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.order("desc")
			.first();

		const sortKey = (lastFolder?.sortKey || 0) + 1;

		const now = Date.now();
		const folderId = await ctx.db.insert("folders", {
			workspaceId,
			parentId: parentId ?? undefined,
			name,
			sortKey,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		return folderId;
	},
});

/**
 * Update folder name
 */
export const update = mutation({
	args: {
		folderId: v.id("folders"),
		name: v.optional(v.string()),
	},
	handler: async (ctx, { folderId, name }) => {
		const userId = await requireUserId(ctx);

		const folder = await ctx.db.get(folderId);
		if (!folder) {
			throw new Error("Folder not found");
		}

		await assertMember(ctx, folder.workspaceId);

		const updates: any = {
			updatedAt: Date.now(),
		};

		if (name !== undefined) {
			updates.name = name;
		}

		await ctx.db.patch(folderId, updates);
		return folderId;
	},
});

/**
 * Delete folder (soft delete)
 */
export const remove = mutation({
	args: {
		folderId: v.id("folders"),
	},
	handler: async (ctx, { folderId }) => {
		const userId = await requireUserId(ctx);

		const folder = await ctx.db.get(folderId);
		if (!folder) {
			throw new Error("Folder not found");
		}

		await assertMember(ctx, folder.workspaceId);

		// Check if folder has ideas - prevent deletion if not empty
		const ideasInFolder = await ctx.db
			.query("ideas")
			.withIndex("by_folder", (q) => q.eq("folderId", folderId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.first();

		if (ideasInFolder) {
			throw new Error(
				"Cannot delete folder containing ideas. Move or delete ideas first.",
			);
		}

		await ctx.db.patch(folderId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});

		return folderId;
	},
});

/**
 * Get folder hierarchy (breadcrumb path)
 */
export const getPath = query({
	args: {
		folderId: v.id("folders"),
	},
	handler: async (ctx, { folderId }) => {
		const userId = await requireUserId(ctx);

		const path = [];
		let currentId: string | undefined = folderId;

		while (currentId) {
			const folder: any = await ctx.db.get(currentId as any);
			if (!folder) break;

			path.unshift({
				id: folder._id,
				name: folder.name,
			});

			currentId = folder.parentId;
		}

		return path;
	},
});
