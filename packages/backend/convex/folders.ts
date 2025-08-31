import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
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
		const _userId = await requireUserId(ctx);
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
		const _userId = await requireUserId(ctx);

		const folder = await ctx.db.get(folderId);
		if (!folder) {
			throw new Error("Folder not found");
		}

		await assertMember(ctx, folder.workspaceId);

		const updates: Partial<{ name: string; updatedAt: number }> = {
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
 * Check folder deletion status and get ideas count
 */
export const checkDeletionStatus = query({
	args: {
		folderId: v.id("folders"),
	},
	returns: v.object({
		canDelete: v.boolean(),
		ideaCount: v.number(),
		ideas: v.array(
			v.object({
				_id: v.id("ideas"),
				title: v.string(),
			}),
		),
	}),
	handler: async (ctx, { folderId }) => {
		const _userId = await requireUserId(ctx);

		const folder = await ctx.db.get(folderId);
		if (!folder) {
			throw new Error("Folder not found");
		}

		await assertMember(ctx, folder.workspaceId);

		// Get all ideas in the folder
		const ideasInFolder = await ctx.db
			.query("ideas")
			.withIndex("by_folder", (q) => q.eq("folderId", folderId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		return {
			canDelete: ideasInFolder.length === 0,
			ideaCount: ideasInFolder.length,
			ideas: ideasInFolder.map((idea) => ({
				_id: idea._id,
				title: idea.title,
			})),
		};
	},
});

/**
 * Delete folder with options for handling contained ideas
 */
export const removeWithOptions = mutation({
	args: {
		folderId: v.id("folders"),
		action: v.union(
			v.literal("moveToRoot"),
			v.literal("deleteAll"),
			v.literal("forceDelete"),
		),
	},
	returns: v.object({
		deletedFolderId: v.id("folders"),
		movedIdeas: v.number(),
		deletedIdeas: v.number(),
	}),
	handler: async (ctx, { folderId, action }) => {
		const _userId = await requireUserId(ctx);

		const folder = await ctx.db.get(folderId);
		if (!folder) {
			throw new Error("Folder not found");
		}

		await assertMember(ctx, folder.workspaceId);

		// Get all ideas in the folder
		const ideasInFolder = await ctx.db
			.query("ideas")
			.withIndex("by_folder", (q) => q.eq("folderId", folderId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		let movedIdeas = 0;
		let deletedIdeas = 0;

		// Handle ideas based on the chosen action
		if (action === "moveToRoot") {
			// Move all ideas to root (remove folderId)
			for (const idea of ideasInFolder) {
				await ctx.db.patch(idea._id, {
					folderId: undefined,
					updatedAt: Date.now(),
				});
				movedIdeas++;
			}
		} else if (action === "deleteAll") {
			// Soft delete all ideas in the folder
			for (const idea of ideasInFolder) {
				await ctx.db.patch(idea._id, {
					deletedAt: Date.now(),
					updatedAt: Date.now(),
				});
				deletedIdeas++;
			}
		}
		// For "forceDelete", we delete the folder regardless of contents

		// Delete the folder
		await ctx.db.patch(folderId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});

		return {
			deletedFolderId: folderId,
			movedIdeas,
			deletedIdeas,
		};
	},
});

/**
 * Delete folder (soft delete) - legacy function, now safer
 */
export const remove = mutation({
	args: {
		folderId: v.id("folders"),
	},
	handler: async (ctx, { folderId }) => {
		const _userId = await requireUserId(ctx);

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
		const _userId = await requireUserId(ctx);

		const path = [];
		let currentId: Id<"folders"> | undefined = folderId;

		while (currentId) {
			const folder: Doc<"folders"> | null = await ctx.db.get(currentId);
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
