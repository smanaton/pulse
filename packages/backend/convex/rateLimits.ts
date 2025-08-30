/**
 * Rate Limits Testing Functions
 *
 * Functions to manage and test rate limiting behavior.
 * These are primarily used for testing and admin purposes.
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Advance time for testing rate limits (test utility).
 */
export const advanceTime = mutation({
	args: {
		minutes: v.number(),
	},
	handler: async (ctx, { minutes }) => {
		// This is a test utility function
		// In a real app, you might want to restrict this to development/test environments

		const advanceMs = minutes * 60 * 1000;
		const now = Date.now();

		// Update all rate limit windows
		const rateLimits = await ctx.db.query("rateLimits").collect();

		await Promise.all(
			rateLimits.map(async (limit) => {
				await ctx.db.patch(limit._id, {
					windowStart: limit.windowStart - advanceMs,
					windowEnd: limit.windowEnd - advanceMs,
					updatedAt: now,
				});
			}),
		);

		return { advancedMinutes: minutes };
	},
});
