/**
 * Tags Management Functions
 *
 * Tags provide flexible labeling for ideas within workspaces.
 * All functions enforce workspace isolation.
 */

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertMember, assertWriteEnabled, logEvent } from "./helpers";
import { requireUserId } from "./server/lib/authz";
import { tagCreateArgs } from "./validators";

/**
 * Normalize tag name for consistent storage and comparison.
 */
function normalizeTagName(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, "-").substring(0, 50);
}

/**
 * Create a new tag.
 */
export const create = mutation({
	args: tagCreateArgs,
	handler: async (ctx, { workspaceId, name, color }) => {
		const userId = await requireUserId(ctx);

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, workspaceId, "editor");

		// Normalize and validate name
		const normalizedName = normalizeTagName(name);
		if (!normalizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Tag name is required",
			});
		}

		// Check if tag already exists
		const existing = await ctx.db
			.query("tags")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", workspaceId).eq("name", normalizedName),
			)
			.unique();

		if (existing) {
			return existing._id; // Return existing tag ID
		}

		// Validate color if provided
		let validatedColor;
		if (color) {
			const colorRegex = /^#[0-9A-Fa-f]{6}$/;
			if (colorRegex.test(color)) {
				validatedColor = color.toLowerCase();
			}
		}

		const now = Date.now();

		// Create tag
		const tagId = await ctx.db.insert("tags", {
			workspaceId,
			name: normalizedName,
			color: validatedColor,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log creation event
		await logEvent(ctx, workspaceId, "tag_created", "tag", tagId);

		return tagId;
	},
});

/**
 * List tags in a workspace.
 */
export const list = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }) => {
		// Check workspace access
		await assertMember(ctx, workspaceId, "viewer");

		const tags = await ctx.db
			.query("tags")
			.withIndex("by_workspace_created", (q) =>
				q.eq("workspaceId", workspaceId),
			)
			.order("asc")
			.collect();

		return tags;
	},
});

/**
 * Update a tag.
 */
export const update = mutation({
	args: {
		tagId: v.id("tags"),
		name: v.optional(v.string()),
		color: v.optional(v.string()),
	},
	handler: async (ctx, { tagId, name, color }) => {
		const tag = await ctx.db.get(tagId);
		if (!tag) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Tag not found",
			});
		}

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, tag.workspaceId, "editor");

		const updates: any = {
			updatedAt: Date.now(),
		};

		if (name !== undefined) {
			const normalizedName = normalizeTagName(name);
			if (!normalizedName) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Tag name cannot be empty",
				});
			}

			// Check if another tag with this name exists
			if (normalizedName !== tag.name) {
				const existing = await ctx.db
					.query("tags")
					.withIndex("by_workspace", (q) =>
						q.eq("workspaceId", tag.workspaceId).eq("name", normalizedName),
					)
					.unique();

				if (existing) {
					throw new ConvexError({
						code: "CONFLICT",
						message: "Tag with this name already exists",
					});
				}
			}

			updates.name = normalizedName;
		}

		if (color !== undefined) {
			if (color) {
				const colorRegex = /^#[0-9A-Fa-f]{6}$/;
				if (!colorRegex.test(color)) {
					throw new ConvexError({
						code: "INVALID_ARGUMENT",
						message: "Invalid color format. Use #RRGGBB format.",
					});
				}
				updates.color = color.toLowerCase();
			} else {
				updates.color = undefined;
			}
		}

		await ctx.db.patch(tagId, updates);

		return await ctx.db.get(tagId);
	},
});

/**
 * Delete a tag.
 */
export const deleteTag = mutation({
	args: {
		tagId: v.id("tags"),
	},
	handler: async (ctx, { tagId }) => {
		const tag = await ctx.db.get(tagId);
		if (!tag) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Tag not found",
			});
		}

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, tag.workspaceId, "editor");

		// Remove all idea-tag relationships first
		const ideaTags = await ctx.db
			.query("ideaTags")
			.withIndex("by_tag", (q) => q.eq("tagId", tagId))
			.collect();

		await Promise.all(
			ideaTags.map(async (ideaTag) => {
				await ctx.db.delete(ideaTag._id);
			}),
		);

		// Delete the tag
		await ctx.db.delete(tagId);

		// Log deletion event
		await logEvent(ctx, tag.workspaceId, "tag_deleted", "tag", tagId, {
			ideaCount: ideaTags.length,
		});
	},
});

/**
 * Get tag usage statistics.
 */
export const getStats = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }) => {
		// Check workspace access
		await assertMember(ctx, workspaceId, "viewer");

		const tags = await ctx.db
			.query("tags")
			.withIndex("by_workspace_created", (q) =>
				q.eq("workspaceId", workspaceId),
			)
			.collect();

		const tagStats = await Promise.all(
			tags.map(async (tag) => {
				const ideaTags = await ctx.db
					.query("ideaTags")
					.withIndex("by_tag", (q) => q.eq("tagId", tag._id))
					.collect();

				return {
					...tag,
					usageCount: ideaTags.length,
				};
			}),
		);

		// Sort by usage count descending
		return tagStats.sort((a, b) => b.usageCount - a.usageCount);
	},
});

/**
 * Find or create a tag by name (used by Move/Copy workflow).
 */
export const findOrCreate = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
		color: v.optional(v.string()),
	},
	handler: async (ctx, { workspaceId, name, color }) => {
		const userId = await requireUserId(ctx);

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, workspaceId, "editor");

		const normalizedName = normalizeTagName(name);
		if (!normalizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Tag name is required",
			});
		}

		// Try to find existing tag
		const existing = await ctx.db
			.query("tags")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", workspaceId).eq("name", normalizedName),
			)
			.unique();

		if (existing) {
			return existing;
		}

		// Create new tag
		const now = Date.now();

		// Validate color if provided
		let validatedColor;
		if (color) {
			const colorRegex = /^#[0-9A-Fa-f]{6}$/;
			if (colorRegex.test(color)) {
				validatedColor = color.toLowerCase();
			}
		}

		const tagId = await ctx.db.insert("tags", {
			workspaceId,
			name: normalizedName,
			color: validatedColor,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log creation event
		await logEvent(ctx, workspaceId, "tag_created", "tag", tagId);

		return await ctx.db.get(tagId);
	},
});

/**
 * Get popular tags (most frequently used).
 */
export const getPopular = query({
	args: {
		workspaceId: v.id("workspaces"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { workspaceId, limit = 10 }) => {
		// Check workspace access
		await assertMember(ctx, workspaceId, "viewer");

		// Get tags with usage statistics (inline to avoid circular call)
		const tags = await ctx.db
			.query("tags")
			.withIndex("by_workspace_created", (q) =>
				q.eq("workspaceId", workspaceId),
			)
			.collect();

		const tagStats = await Promise.all(
			tags.map(async (tag) => {
				const ideaTags = await ctx.db
					.query("ideaTags")
					.withIndex("by_tag", (q) => q.eq("tagId", tag._id))
					.collect();

				return {
					...tag,
					usageCount: ideaTags.length,
				};
			}),
		);

		// Sort by usage count descending, filter used tags only
		return tagStats
			.filter((tag) => tag.usageCount > 0)
			.sort((a, b) => b.usageCount - a.usageCount)
			.slice(0, limit);
	},
});

/**
 * List tags for a specific idea
 */
export const listForIdea = query({
	args: {
		ideaId: v.id("ideas"),
	},
	handler: async (ctx, { ideaId }) => {
		const _userId = await requireUserId(ctx);

		const idea = await ctx.db.get(ideaId);
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Check workspace access
		await assertMember(ctx, idea.workspaceId, "viewer");

		const ideaTags = await ctx.db
			.query("ideaTags")
			.withIndex("by_idea", (q) => q.eq("ideaId", ideaId))
			.collect();

		const tags = await Promise.all(
			ideaTags.map(async (ideaTag) => {
				const tag = await ctx.db.get(ideaTag.tagId);
				return tag;
			}),
		);

		return tags.filter(Boolean);
	},
});

/**
 * Add tag to idea
 */
export const addToIdea = mutation({
	args: {
		ideaId: v.id("ideas"),
		tagName: v.string(),
	},
	handler: async (ctx, { ideaId, tagName }) => {
		const userId = await requireUserId(ctx);

		const idea = await ctx.db.get(ideaId);
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, idea.workspaceId, "editor");

		// Create or get tag inline
		const normalizedName = normalizeTagName(tagName);
		if (!normalizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Tag name is required",
			});
		}

		// Check if tag already exists
		let tag = await ctx.db
			.query("tags")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", idea.workspaceId).eq("name", normalizedName),
			)
			.unique();

		if (!tag) {
			// Create new tag
			const now = Date.now();
			const tagId = await ctx.db.insert("tags", {
				workspaceId: idea.workspaceId,
				name: normalizedName,
				createdBy: userId,
				createdAt: now,
				updatedAt: now,
			});
			tag = await ctx.db.get(tagId);
		}

		if (!tag) {
			throw new ConvexError({
				code: "INTERNAL_ERROR",
				message: "Failed to create tag",
			});
		}

		// Check if relationship already exists
		const existingRelation = await ctx.db
			.query("ideaTags")
			.withIndex("by_idea", (q) => q.eq("ideaId", ideaId))
			.filter((q) => q.eq(q.field("tagId"), tag._id))
			.first();

		if (existingRelation) {
			return tag._id;
		}

		// Create relationship
		await ctx.db.insert("ideaTags", {
			ideaId,
			tagId: tag._id,
			createdAt: Date.now(),
		});

		return tag._id;
	},
});

/**
 * Remove tag from idea
 */
export const removeFromIdea = mutation({
	args: {
		ideaId: v.id("ideas"),
		tagId: v.id("tags"),
	},
	handler: async (ctx, { ideaId, tagId }) => {
		const _userId = await requireUserId(ctx);

		const idea = await ctx.db.get(ideaId);
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, idea.workspaceId, "editor");

		// Find and delete relationship
		const relation = await ctx.db
			.query("ideaTags")
			.withIndex("by_idea", (q) => q.eq("ideaId", ideaId))
			.filter((q) => q.eq(q.field("tagId"), tagId))
			.first();

		if (relation) {
			await ctx.db.delete(relation._id);
		}

		return tagId;
	},
});
