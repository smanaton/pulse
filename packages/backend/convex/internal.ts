/**
 * Internal Helper Functions
 *
 * These functions are used by actions and other internal processes.
 * They wrap the helpers functions for use in actions.
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import {
	assertMember,
	assertWriteEnabled,
	checkRateLimit,
	incrementRateLimit,
	logEvent,
} from "./helpers";
import { ideasRepository } from "./server/lib/repository";

/**
 * Internal version of assertMember for use in actions.
 */
export const assertMemberInternal = internalQuery({
	args: {
		workspaceId: v.id("workspaces"),
		minRole: v.optional(v.string()),
	},
	handler: async (ctx, { workspaceId, minRole = "viewer" }) => {
		return await assertMember(ctx, workspaceId, minRole as any);
	},
});

/**
 * Internal version of assertWriteEnabled for use in actions.
 */
export const assertWriteEnabledInternal = internalQuery({
	args: {
		workspaceId: v.id("workspaces"),
		minRole: v.optional(v.string()),
	},
	handler: async (ctx, { workspaceId, minRole = "editor" }) => {
		return await assertWriteEnabled(ctx, workspaceId, minRole as any);
	},
});

/**
 * Internal version of logEvent for use in actions.
 */
export const logEventInternal = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		type: v.string(),
		entity: v.string(),
		entityId: v.string(),
		meta: v.optional(v.any()),
	},
	handler: async (ctx, { workspaceId, type, entity, entityId, meta }) => {
		return await logEvent(ctx, workspaceId, type, entity, entityId, meta);
	},
});

/**
 * Internal version of checkRateLimit for use in actions.
 */
export const checkRateLimitInternal = internalQuery({
	args: {
		userId: v.id("users"),
		type: v.string(),
		workspaceId: v.optional(v.id("workspaces")),
		limit: v.optional(v.number()),
		windowMinutes: v.optional(v.number()),
	},
	handler: async (
		ctx,
		{ userId, type, workspaceId, limit = 10, windowMinutes = 60 },
	) => {
		return await checkRateLimit(
			ctx,
			userId,
			type,
			workspaceId,
			limit,
			windowMinutes,
		);
	},
});

/**
 * Internal version of incrementRateLimit for use in actions.
 */
export const incrementRateLimitInternal = internalMutation({
	args: {
		userId: v.id("users"),
		type: v.string(),
		workspaceId: v.optional(v.id("workspaces")),
		windowMinutes: v.optional(v.number()),
	},
	handler: async (ctx, { userId, type, workspaceId, windowMinutes = 60 }) => {
		return await incrementRateLimit(
			ctx,
			userId,
			type,
			workspaceId,
			windowMinutes,
		);
	},
});

// Internal wrappers for AI functions to avoid circular dependencies
export const ideasGetInternal = internalQuery({
	args: { ideaId: v.id("ideas") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.ideaId);
	},
});

export const ideasListInternal = internalQuery({
	args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
	handler: async (ctx, { workspaceId, limit = 50 }) => {
		return await ctx.db
			.query("ideas")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.order("desc")
			.take(limit);
	},
});

export const ideasCreateInternal = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		title: v.string(),
		contentMD: v.string(),
		userId: v.id("users"),
	},
	handler: async (ctx, { workspaceId, title, contentMD, userId }) => {
		return await ideasRepository.create(
			ctx,
			{
				workspaceId,
				title,
				contentMD,
				status: "draft",
			},
			userId,
		);
	},
});

export const ideasUpdateInternal = internalMutation({
	args: {
		ideaId: v.id("ideas"),
		contentMD: v.string(),
	},
	handler: async (ctx, { ideaId, contentMD }) => {
		return await ctx.db.patch(ideaId, {
			contentMD,
			updatedAt: Date.now(),
		});
	},
});

export const ideasSearchInternal = internalQuery({
	args: {
		workspaceId: v.id("workspaces"),
		query: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { workspaceId, query, limit = 50 }) => {
		// Simple text search - in production, use a proper search index
		const allIdeas = await ctx.db
			.query("ideas")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.take(limit * 2);

		const lowerQuery = query.toLowerCase();
		return allIdeas
			.filter(
				(idea) =>
					idea.title.toLowerCase().includes(lowerQuery) ||
					idea.contentMD.toLowerCase().includes(lowerQuery),
			)
			.slice(0, limit);
	},
});

export const tagsListInternal = internalQuery({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) => {
		return await ctx.db
			.query("tags")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.collect();
	},
});
