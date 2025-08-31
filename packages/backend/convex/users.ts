import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
	getUserId,
	getUserIdReadOnly,
	requireUserId,
} from "./server/lib/authz";

// Get current user
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {

		const userId = await getUserIdReadOnly(ctx);
		if (!userId) {
			return null;
		}

		const user = await ctx.db.get(userId);
		return user;
	},
});

// Note: User creation is handled automatically by Convex Auth
// This happens during the authentication flow for OAuth providers
// and when users sign up with email/password

// Get user by ID
export const getUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	},
});

// Update current user's profile
export const updateUser = mutation({
	args: {
		name: v.optional(v.string()),
		image: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		return await ctx.db.patch(userId, args);
	},
});
