/**
 * AI Agent Management Functions
 *
 * CRUD operations for managing AI agents within workspaces.
 * Agents are virtual team members with specific capabilities.
 */

import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { assertMember, assertWriteEnabled, logActivity } from "./helpers";
import { requireUserId } from "./server/lib/authz";

// Validation schemas
const agentCreateArgs = {
	workspaceId: v.id("workspaces"),
	name: v.string(),
	description: v.optional(v.string()),
	type: v.union(
		v.literal("assistant"),
		v.literal("automation"),
		v.literal("researcher"),
		v.literal("writer"),
	),
	capabilities: v.array(v.string()),
	config: v.optional(v.any()),
	avatar: v.optional(v.string()),
};

const agentUpdateArgs = {
	agentId: v.id("agents"),
	name: v.optional(v.string()),
	description: v.optional(v.string()),
	type: v.optional(
		v.union(
			v.literal("assistant"),
			v.literal("automation"),
			v.literal("researcher"),
			v.literal("writer"),
		),
	),
	capabilities: v.optional(v.array(v.string())),
	config: v.optional(v.any()),
	avatar: v.optional(v.string()),
	isActive: v.optional(v.boolean()),
};

const agentListArgs = {
	workspaceId: v.id("workspaces"),
	type: v.optional(
		v.union(
			v.literal("assistant"),
			v.literal("automation"),
			v.literal("researcher"),
			v.literal("writer"),
		),
	),
	isActive: v.optional(v.boolean()),
	limit: v.optional(v.number()),
};

/**
 * Create a new AI agent
 */
export const create = mutation({
	args: agentCreateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "admin"); // Only admins can create agents
		await assertWriteEnabled(ctx, args.workspaceId);

		const now = Date.now();
		const agentId = await ctx.db.insert("agents", {
			...args,
			config: args.config || {},
			isActive: true,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log activity
		await logActivity(ctx, {
			workspaceId: args.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "workspace", // Agents are workspace-level entities
			entityId: agentId,
			action: "created",
			description: `Created AI agent: ${args.name}`,
			metadata: {
				type: args.type,
				capabilities: args.capabilities.length,
			},
		});

		return await ctx.db.get(agentId);
	},
});

/**
 * Update an existing agent
 */
export const update = mutation({
	args: agentUpdateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Agent not found",
			});
		}

		await assertMember(ctx, agent.workspaceId, "admin"); // Only admins can modify agents
		await assertWriteEnabled(ctx, agent.workspaceId);

		const { agentId, ...updates } = args;
		const now = Date.now();

		await ctx.db.patch(agentId, {
			...updates,
			updatedAt: now,
		});

		// Log activity
		await logActivity(ctx, {
			workspaceId: agent.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "workspace",
			entityId: agentId,
			action: "updated",
			description: `Updated AI agent: ${agent.name}`,
			metadata: updates,
		});

		return await ctx.db.get(agentId);
	},
});

/**
 * Delete an agent
 */
export const remove = mutation({
	args: { agentId: v.id("agents") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Agent not found",
			});
		}

		await assertMember(ctx, agent.workspaceId, "admin"); // Only admins can delete agents
		await assertWriteEnabled(ctx, agent.workspaceId);

		await ctx.db.delete(args.agentId);

		// Log activity
		await logActivity(ctx, {
			workspaceId: agent.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "workspace",
			entityId: args.agentId,
			action: "deleted",
			description: `Deleted AI agent: ${agent.name}`,
		});

		return { success: true };
	},
});

/**
 * Activate or deactivate an agent
 */
export const setActive = mutation({
	args: {
		agentId: v.id("agents"),
		isActive: v.boolean(),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Agent not found",
			});
		}

		await assertMember(ctx, agent.workspaceId, "admin");
		await assertWriteEnabled(ctx, agent.workspaceId);

		const now = Date.now();
		await ctx.db.patch(args.agentId, {
			isActive: args.isActive,
			updatedAt: now,
		});

		// Log activity
		await logActivity(ctx, {
			workspaceId: agent.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "workspace",
			entityId: args.agentId,
			action: "updated",
			description: `${args.isActive ? "Activated" : "Deactivated"} AI agent: ${agent.name}`,
		});

		return await ctx.db.get(args.agentId);
	},
});

/**
 * Record agent usage (for analytics and billing)
 */
export const recordUsage = mutation({
	args: {
		agentId: v.id("agents"),
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);

		const agent = await ctx.db.get(args.agentId);
		if (!agent || !agent.isActive) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Agent not found or inactive",
			});
		}

		await assertMember(ctx, agent.workspaceId);

		const now = Date.now();
		await ctx.db.patch(args.agentId, {
			lastUsedAt: now,
			updatedAt: now,
		});

		// Log activity for agent usage
		await logActivity(ctx, {
			workspaceId: agent.workspaceId,
			actorId: args.agentId as any, // Agent is the actor here
			actorType: "agent",
			entityType: "workspace",
			entityId: agent.workspaceId,
			action: "completed", // Agent completed a task
			description: `AI agent ${agent.name} completed a task`,
			metadata: args.metadata,
		});

		return { success: true };
	},
});

/**
 * Get agent by ID
 */
export const getById = query({
	args: { agentId: v.id("agents") },
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			return null;
		}

		const _userId = await requireUserId(ctx);
		await assertMember(ctx, agent.workspaceId);

		return agent;
	},
});

/**
 * List agents in a workspace
 */
export const list = query({
	args: agentListArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("agents")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

		// Filter by type if provided
		if (args.type) {
			query = query.filter((q) => q.eq(q.field("type"), args.type));
		}

		// Filter by active status if provided
		if (args.isActive !== undefined) {
			query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
		}

		const limit = Math.min(args.limit ?? 50, 100);
		const agents = await query.order("desc").take(limit);

		return agents;
	},
});

/**
 * Get agents by type (for specific use cases)
 */
export const getByType = query({
	args: {
		workspaceId: v.id("workspaces"),
		type: v.union(
			v.literal("assistant"),
			v.literal("automation"),
			v.literal("researcher"),
			v.literal("writer"),
		),
		activeOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("agents")
			.withIndex("by_workspace_type", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("type", args.type),
			);

		// Filter by active status if requested
		if (args.activeOnly !== false) {
			query = query.filter((q) => q.eq(q.field("isActive"), true));
		}

		const agents = await query.collect();
		return agents;
	},
});

/**
 * Get agent capabilities (for UI/selection purposes)
 */
export const getCapabilities = query({
	args: {},
	handler: async () => {
		// Return available capabilities that agents can have
		return {
			assistant: [
				"general_help",
				"task_planning",
				"question_answering",
				"brainstorming",
				"decision_support",
			],
			automation: [
				"workflow_automation",
				"data_processing",
				"report_generation",
				"email_automation",
				"task_scheduling",
			],
			researcher: [
				"web_search",
				"data_analysis",
				"market_research",
				"competitive_analysis",
				"trend_monitoring",
			],
			writer: [
				"content_generation",
				"copywriting",
				"technical_writing",
				"social_media",
				"documentation",
				"email_templates",
			],
		};
	},
});

/**
 * Get agent usage analytics
 */
export const getUsageAnalytics = query({
	args: {
		workspaceId: v.id("workspaces"),
		days: v.optional(v.number()), // Default to 30 days
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const days = args.days ?? 30;
		const since = Date.now() - days * 24 * 60 * 60 * 1000;

		// Get agent activities in the time period
		const activities = await ctx.db
			.query("activities")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", args.workspaceId).gte("createdAt", since),
			)
			.filter((q) => q.eq(q.field("actorType"), "agent"))
			.collect();

		// Aggregate by agent
		const agentUsage: Record<
			string,
			{
				agentId: string;
				count: number;
				lastUsed: number;
			}
		> = {};

		for (const activity of activities) {
			const agentId = activity.actorId;
			if (!agentUsage[agentId]) {
				agentUsage[agentId] = {
					agentId,
					count: 0,
					lastUsed: 0,
				};
			}
			agentUsage[agentId].count++;
			agentUsage[agentId].lastUsed = Math.max(
				agentUsage[agentId].lastUsed,
				activity.createdAt,
			);
		}

		// Get agent details
		const usageWithDetails = await Promise.all(
			Object.values(agentUsage).map(async (usage) => {
				const agent = await ctx.db.get(usage.agentId as Id<"agents">);
				return {
					...usage,
					agent: agent
						? {
								name: agent.name,
								type: agent.type,
								isActive: agent.isActive,
							}
						: null,
				};
			}),
		);

		return {
			period: days,
			agents: usageWithDetails.filter((u) => u.agent !== null),
			totalUsage: Object.values(agentUsage).reduce(
				(sum, u) => sum + u.count,
				0,
			),
		};
	},
});
