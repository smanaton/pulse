/**
 * Authentication Utilities
 *
 * Uses Convex Auth getAuthUserId for production authentication.
 * Falls back to test mode only when explicitly in a test environment.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "../../_generated/dataModel";

/**
 * For mutations: Can create users if they don't exist
 * Uses Convex Auth getAuthUserId for production authentication
 */
export async function requireUserId(ctx: any): Promise<Id<"users">> {
	const userId = await getAuthUserId(ctx);

	// In production/non-test environments, getAuthUserId returns the actual user ID
	if (userId !== null && process.env.NODE_ENV !== "test") {
		return userId as Id<"users">;
	}

	// Test environment handling - either with or without getAuthUserId result
	if (process.env.NODE_ENV === "test") {
		const identity = await ctx.auth?.getUserIdentity?.();
		const tokenIdentifier = identity?.tokenIdentifier;

		if (tokenIdentifier) {
			// Look up existing user by tokenIdentifier
			const existingUser = await ctx.db
				.query("users")
				.withIndex("by_token", (q: any) =>
					q.eq("tokenIdentifier", tokenIdentifier),
				)
				.unique();

			if (existingUser) {
				return existingUser._id;
			}

			// Create new user with tokenIdentifier (test mode only)
			const now = Date.now();
			const newUserId = await ctx.db.insert("users", {
				tokenIdentifier,
				email: identity.email ?? undefined,
				name: identity.name ?? undefined,
				createdAt: now,
				updatedAt: now,
			});

			return newUserId;
		}
	}

	// No authenticated user found
	throw new ConvexError({
		code: "UNAUTHENTICATED",
		message: "Authentication required",
	});
}

/**
 * For queries: Read-only, won't create users
 * Uses Convex Auth getAuthUserId for production authentication
 */
export async function requireUserIdReadOnly(ctx: any): Promise<Id<"users">> {
	const userId = await getAuthUserId(ctx);

	// In production/non-test environments, getAuthUserId returns the actual user ID
	if (userId !== null && process.env.NODE_ENV !== "test") {
		return userId as Id<"users">;
	}

	// Test environment handling - either with or without getAuthUserId result
	if (process.env.NODE_ENV === "test") {
		const identity = await ctx.auth?.getUserIdentity?.();
		const tokenIdentifier = identity?.tokenIdentifier;

		if (tokenIdentifier) {
			// Look up existing user by tokenIdentifier (test mode only)
			const existingUser = await ctx.db
				.query("users")
				.withIndex("by_token", (q: any) =>
					q.eq("tokenIdentifier", tokenIdentifier),
				)
				.unique();

			if (!existingUser) {
				throw new ConvexError({
					code: "USER_NOT_FOUND",
					message: "User not found. Please sign in to create your account.",
				});
			}

			return existingUser._id;
		}
	}

	// No authenticated user found
	throw new ConvexError({
		code: "UNAUTHENTICATED",
		message: "Authentication required",
	});
}

/**
 * Optional version for mutations that returns null instead of throwing
 */
export async function getUserId(ctx: any): Promise<Id<"users"> | null> {
	try {
		return await requireUserId(ctx);
	} catch (error) {
		if (
			error instanceof ConvexError &&
			error.data?.code === "UNAUTHENTICATED"
		) {
			return null;
		}
		throw error;
	}
}

/**
 * Optional version for queries that returns null instead of throwing
 */
export async function getUserIdReadOnly(ctx: any): Promise<Id<"users"> | null> {
	try {
		return await requireUserIdReadOnly(ctx);
	} catch (error) {
		if (
			error instanceof ConvexError &&
			(error.data?.code === "UNAUTHENTICATED" ||
				error.data?.code === "USER_NOT_FOUND")
		) {
			return null;
		}
		throw error;
	}
}
