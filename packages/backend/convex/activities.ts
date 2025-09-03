/**
 * Activities Tracking Functions
 *
 * Query functions for retrieving workspace activity timeline.
 * Activities are created automatically by other functions via logActivity helper.
 */

import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { assertMember } from "./helpers";
import { requireUserId } from "./server/lib/authz";

// Validation schemas
const activitiesListArgs = {
	workspaceId: v.id("workspaces"),
	entityType: v.optional(
		v.union(
			v.literal("project"),
			v.literal("idea"),
			v.literal("client"),
			v.literal("workspace"),
			v.literal("member"),
		),
	),
	entityId: v.optional(v.string()),
	actorId: v.optional(v.id("users")),
	action: v.optional(
		v.union(
			v.literal("created"),
			v.literal("updated"),
			v.literal("deleted"),
			v.literal("moved"),
			v.literal("assigned"),
			v.literal("commented"),
			v.literal("completed"),
		),
	),
	limit: v.optional(v.number()),
	cursor: v.optional(v.string()),
};

const activitiesTimelineArgs = {
	workspaceId: v.id("workspaces"),
	days: v.optional(v.number()), // How many days back to fetch
	limit: v.optional(v.number()),
};

/**
 * Get activities with filtering and pagination
 */
export const list = query({
	args: activitiesListArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("activities")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

		// Filter by entity type
		if (args.entityType) {
			query = query.filter((q) => q.eq(q.field("entityType"), args.entityType));
		}

		// Filter by specific entity
		if (args.entityId) {
			query = query.filter((q) => q.eq(q.field("entityId"), args.entityId));
		}

		// Filter by actor
		if (args.actorId) {
			query = query.filter((q) => q.eq(q.field("actorId"), args.actorId));
		}

		// Filter by action
		if (args.action) {
			query = query.filter((q) => q.eq(q.field("action"), args.action));
		}

		// Apply cursor-based pagination
		if (args.cursor) {
			const cursorTime = Number.parseInt(args.cursor, 10);
			query = query.filter((q) => q.lt(q.field("createdAt"), cursorTime));
		}

		const limit = Math.min(args.limit ?? 50, 100);
		const activities = await query.order("desc").take(limit + 1);

		// Check if there are more results
		const hasMore = activities.length > limit;
		const results = hasMore ? activities.slice(0, -1) : activities;
		const nextCursor = hasMore
			? results[results.length - 1].createdAt.toString()
			: undefined;

		// Enrich activities with actor details
		const enrichedActivities = await Promise.all(
			results.map(async (activity) => {
				let actorName = "Unknown";
				let actorAvatar = null;

				if (activity.actorType === "user") {
					const user = await ctx.db.get(activity.actorId);
					if (user) {
						actorName = user.name || user.email || "Unknown User";
						actorAvatar = user.image;
					}
				} else if (activity.actorType === "agent") {
					const agent = await ctx.db.get(
						activity.actorId as unknown as Id<"agents">,
					);
					if (agent) {
						actorName = agent.name;
						actorAvatar = agent.avatar;
					}
				}

				return {
					...activity,
					actorName,
					actorAvatar,
				};
			}),
		);

		return {
			activities: enrichedActivities,
			nextCursor,
			hasMore,
		};
	},
});

/**
 * Get recent timeline for workspace (optimized for dashboard)
 */
export const getTimeline = query({
	args: activitiesTimelineArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const days = args.days ?? 7; // Default to last 7 days
		const since = Date.now() - days * 24 * 60 * 60 * 1000;

		const limit = Math.min(args.limit ?? 20, 50);

		const activities = await ctx.db
			.query("activities")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", args.workspaceId).gte("createdAt", since),
			)
			.order("desc")
			.take(limit);

		// Group activities by date for timeline display
		const groupedActivities: Record<string, typeof activities> = {};

		for (const activity of activities) {
			const date = new Date(activity.createdAt).toDateString();
			if (!groupedActivities[date]) {
				groupedActivities[date] = [];
			}
			groupedActivities[date].push(activity);
		}

		// Enrich with actor details
		const enrichedGroups: Record<string, Doc<"activities">[]> = {};

		for (const [date, dateActivities] of Object.entries(groupedActivities)) {
			enrichedGroups[date] = await Promise.all(
				dateActivities.map(async (activity) => {
					let actorName = "Unknown";
					let actorAvatar = null;

					if (activity.actorType === "user") {
						const user = await ctx.db.get(activity.actorId);
						if (user) {
							actorName = user.name || user.email || "Unknown User";
							actorAvatar = user.image;
						}
					} else if (activity.actorType === "agent") {
						const agent = await ctx.db.get(
							activity.actorId as unknown as Id<"agents">,
						);
						if (agent) {
							actorName = agent.name;
							actorAvatar = agent.avatar;
						}
					}

					return {
						...activity,
						actorName,
						actorAvatar,
					};
				}),
			);
		}

		return {
			timeline: enrichedGroups,
			period: days,
			totalActivities: activities.length,
		};
	},
});

/**
 * Get activities for a specific entity (project, client, etc.)
 */
export const getForEntity = query({
	args: {
		workspaceId: v.id("workspaces"),
		entityType: v.union(
			v.literal("project"),
			v.literal("idea"),
			v.literal("client"),
			v.literal("workspace"),
			v.literal("member"),
		),
		entityId: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const limit = Math.min(args.limit ?? 20, 50);

		const activities = await ctx.db
			.query("activities")
			.withIndex("by_workspace_entity", (q) =>
				q
					.eq("workspaceId", args.workspaceId)
					.eq("entityType", args.entityType)
					.eq("entityId", args.entityId),
			)
			.order("desc")
			.take(limit);

		// Enrich with actor details
		const enrichedActivities = await Promise.all(
			activities.map(async (activity) => {
				let actorName = "Unknown";
				let actorAvatar = null;

				if (activity.actorType === "user") {
					const user = await ctx.db.get(activity.actorId);
					if (user) {
						actorName = user.name || user.email || "Unknown User";
						actorAvatar = user.image;
					}
				} else if (activity.actorType === "agent") {
					const agent = await ctx.db.get(
						activity.actorId as unknown as Id<"agents">,
					);
					if (agent) {
						actorName = agent.name;
						actorAvatar = agent.avatar;
					}
				}

				return {
					...activity,
					actorName,
					actorAvatar,
				};
			}),
		);

		return enrichedActivities;
	},
});

/**
 * Get activity statistics for workspace
 */
export const getStats = query({
	args: {
		workspaceId: v.id("workspaces"),
		days: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const days = args.days ?? 30; // Default to last 30 days
		const since = Date.now() - days * 24 * 60 * 60 * 1000;

		const activities = await ctx.db
			.query("activities")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", args.workspaceId).gte("createdAt", since),
			)
			.collect();

		// Aggregate statistics
		const stats = {
			totalActivities: activities.length,
			byAction: {} as Record<string, number>,
			byEntityType: {} as Record<string, number>,
			byActorType: {} as Record<string, number>,
			byDay: {} as Record<string, number>,
			topActors: {} as Record<string, { count: number; name: string }>,
		};

		for (const activity of activities) {
			// By action
			stats.byAction[activity.action] =
				(stats.byAction[activity.action] || 0) + 1;

			// By entity type
			stats.byEntityType[activity.entityType] =
				(stats.byEntityType[activity.entityType] || 0) + 1;

			// By actor type
			stats.byActorType[activity.actorType] =
				(stats.byActorType[activity.actorType] || 0) + 1;

			// By day
			const day = new Date(activity.createdAt).toISOString().split("T")[0];
			stats.byDay[day] = (stats.byDay[day] || 0) + 1;

			// Top actors (will need to enrich with names later)
			const actorId = activity.actorId;
			if (!stats.topActors[actorId]) {
				stats.topActors[actorId] = { count: 0, name: "Unknown" };
			}
			stats.topActors[actorId].count++;
		}

		// Enrich top actors with names (top 10)
		const topActorIds = Object.entries(stats.topActors)
			.sort(([, a], [, b]) => b.count - a.count)
			.slice(0, 10)
			.map(([id]) => id);

		for (const actorId of topActorIds) {
			// Try as user first
			const user = await ctx.db.get(actorId as unknown as Id<"users">);
			if (user && "name" in user) {
				stats.topActors[actorId].name =
					user.name || user.email || "Unknown User";
			} else {
				// Try as agent
				const agent = await ctx.db.get(actorId as unknown as Id<"agents">);
				if (agent && "name" in agent) {
					stats.topActors[actorId].name = agent.name;
				}
			}
		}

		// Convert topActors to array format
		const topActorsArray = Object.entries(stats.topActors)
			.map(([id, data]) => ({ id, ...data }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		return {
			...stats,
			topActors: topActorsArray,
			period: days,
		};
	},
});

/**
 * Get recent activities by specific actor (user or agent)
 */
export const getByActor = query({
	args: {
		workspaceId: v.id("workspaces"),
		actorId: v.id("users"), // Can be user or agent ID
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const limit = Math.min(args.limit ?? 20, 50);

		const activities = await ctx.db
			.query("activities")
			.withIndex("by_workspace_actor", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("actorId", args.actorId),
			)
			.order("desc")
			.take(limit);

		// Get actor details
		let actorName = "Unknown";
		let actorAvatar = null;
		let actorType: "user" | "agent" = "user";

		const user = await ctx.db.get(args.actorId);
		if (user) {
			actorName = user.name || user.email || "Unknown User";
			actorAvatar = user.image;
			actorType = "user";
		} else {
			// Try as agent
			const agent = await ctx.db.get(args.actorId as unknown as Id<"agents">);
			if (agent) {
				actorName = agent.name;
				actorAvatar = agent.avatar;
				actorType = "agent";
			}
		}

		return {
			activities: activities.map((activity) => ({
				...activity,
				actorName,
				actorAvatar,
			})),
			actor: {
				id: args.actorId,
				name: actorName,
				avatar: actorAvatar,
				type: actorType,
			},
		};
	},
});
