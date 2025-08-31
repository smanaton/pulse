/**
 * Events and Telemetry Functions
 *
 * Functions for querying and managing telemetry events.
 * Events are logged automatically by other functions.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { assertMember } from "./helpers";

/**
 * List events for a workspace.
 */
export const list = query({
	args: {
		workspaceId: v.id("workspaces"),
		type: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { workspaceId, type, limit = 50 }) => {
		// Check workspace access
		await assertMember(ctx, workspaceId, "viewer");

		const query = ctx.db
			.query("events")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.order("desc");

		const events = await query.take(limit);

		// Filter by type if specified
		if (type) {
			return events.filter((event) => event.type === type);
		}

		return events;
	},
});

/**
 * Get event statistics for a workspace.
 */
export const getStats = query({
	args: {
		workspaceId: v.id("workspaces"),
		since: v.optional(v.number()), // Timestamp to filter events since
	},
	handler: async (ctx, { workspaceId, since }) => {
		// Check workspace access
		await assertMember(ctx, workspaceId, "viewer");

		const sinceTime = since || Date.now() - 30 * 24 * 60 * 60 * 1000; // Default to last 30 days

		const events = await ctx.db
			.query("events")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.filter((q) => q.gte(q.field("createdAt"), sinceTime))
			.collect();

		// Count events by type
		const eventsByType: Record<string, number> = {};
		events.forEach((event) => {
			eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
		});

		// Count events by day
		const eventsByDay: Record<string, number> = {};
		events.forEach((event) => {
			const day = new Date(event.createdAt).toISOString().split("T")[0];
			eventsByDay[day] = (eventsByDay[day] || 0) + 1;
		});

		return {
			totalEvents: events.length,
			eventsByType,
			eventsByDay,
			dateRange: {
				start: sinceTime,
				end: Date.now(),
			},
		};
	},
});
