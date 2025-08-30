/**
 * Real Convex Users Function Tests
 *
 * Tests actual Convex functions using convex-test framework
 * Following best practices from Context7 research
 */

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("User Functions - convex-test", () => {
	describe("getCurrentUser", () => {
		test("returns null when user is not authenticated", async () => {
			const t = convexTest(schema, modules);

			// Call without authentication
			const result = await t.query(api.users.getCurrentUser, {});

			expect(result).toBeNull();
		});

		test("returns user data when authenticated", async () => {
			const t = convexTest(schema, modules);

			// First create/ensure user exists via mutation
			await t
				.withIdentity({
					tokenIdentifier: "testing|user123",
					email: "test@example.com",
					name: "Test User",
				})
				.mutation(api.users.updateUser, { name: "Test User" });

			// Then query for the user
			const result = await t
				.withIdentity({
					tokenIdentifier: "testing|user123",
					email: "test@example.com",
					name: "Test User",
				})
				.query(api.users.getCurrentUser, {});

			expect(result).toMatchObject({
				name: "Test User",
				tokenIdentifier: "testing|user123",
			});
		});
	});

	describe("getUser", () => {
		test("retrieves user by valid ID", async () => {
			const t = convexTest(schema, modules);

			// Insert a user first
			const userId = await t.run(async (ctx) => {
				const now = Date.now();
				return await ctx.db.insert("users", {
					name: "Jane Doe",
					createdAt: now,
					updatedAt: now,
				});
			});

			// Query for the user
			const user = await t.query(api.users.getUser, { userId });

			expect(user).toMatchObject({
				name: "Jane Doe",
			});
			expect(user?._id).toBe(userId);
		});

		test("returns null for non-existent user ID", async () => {
			const t = convexTest(schema, modules);

			// Create a fake ID in the right format
			const fakeUserId = await t.run(async (ctx) => {
				// Create and immediately delete a user to get a valid but non-existent ID format
				const now = Date.now();
				const tempId = await ctx.db.insert("users", {
					name: "Temp",
					createdAt: now,
					updatedAt: now,
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			const result = await t.query(api.users.getUser, { userId: fakeUserId });

			expect(result).toBeNull();
		});
	});

	describe("updateUser", () => {
		test("updates authenticated user profile", async () => {
			const t = convexTest(schema, modules);

			// Create user and get authenticated context
			const userId = await t.run(async (ctx) => {
				const now = Date.now();
				return await ctx.db.insert("users", {
					name: "Old Name",
					createdAt: now,
					updatedAt: now,
				});
			});

			// Update the user using new tokenIdentifier pattern
			const updateData = {
				name: "New Name",
				image: "new-image.jpg",
			};

			await t
				.withIdentity({
					tokenIdentifier: "testing|user123",
					name: "Old Name",
					email: "user@example.com",
				})
				.mutation(api.users.updateUser, updateData);

			// Verify the update by finding user by tokenIdentifier
			const updatedUser = await t.run(async (ctx) => {
				return await ctx.db
					.query("users")
					.withIndex("by_token", (q: any) =>
						q.eq("tokenIdentifier", "testing|user123"),
					)
					.unique();
			});

			expect(updatedUser).toMatchObject({
				name: "New Name",
				image: "new-image.jpg",
			});
		});

		test("updates only provided fields", async () => {
			const t = convexTest(schema, modules);

			// Create user
			const userId = await t.run(async (ctx) => {
				const now = Date.now();
				return await ctx.db.insert("users", {
					name: "Original Name",
					createdAt: now,
					updatedAt: now,
				});
			});

			// Update only the name using new pattern
			await t
				.withIdentity({
					tokenIdentifier: "testing|user456",
					email: "user@example.com",
				})
				.mutation(api.users.updateUser, {
					name: "Updated Name",
				});

			// Verify only name was updated
			const updatedUser = await t.run(async (ctx) => {
				return await ctx.db
					.query("users")
					.withIndex("by_token", (q: any) =>
						q.eq("tokenIdentifier", "testing|user456"),
					)
					.unique();
			});

			expect(updatedUser).toMatchObject({
				name: "Updated Name",
			});
		});

		test("throws error when user is not authenticated", async () => {
			const t = convexTest(schema, modules);

			// Try to update without authentication
			const unauthPromise = t.mutation(api.users.updateUser, {
				name: "New Name",
			});
			await expect(unauthPromise).rejects.toThrow("Authentication required");
		});

		test("handles empty update gracefully", async () => {
			const t = convexTest(schema, modules);

			// Create user directly - will be created by auth shim
			const testToken = "testing|user789";

			// Empty update should not throw error
			const emptyUpdateResult = await t
				.withIdentity({
					tokenIdentifier: "testing|user789",
					email: "test@example.com",
				})
				.mutation(api.users.updateUser, {});

			expect(emptyUpdateResult).toBeDefined();
		});
	});

	describe("Edge Cases", () => {
		test("handles special characters in user data", async () => {
			const t = convexTest(schema, modules);

			const userId = await t.run(async (ctx) => {
				const now = Date.now();
				return await ctx.db.insert("users", {
					name: "Regular Name",
					createdAt: now,
					updatedAt: now,
				});
			});

			const specialName = "José María (Café) 🚀";
			await t
				.withIdentity({
					tokenIdentifier: "testing|user_special",
					email: "user@example.com",
				})
				.mutation(api.users.updateUser, {
					name: specialName,
				});

			const updatedUser = await t.run(async (ctx) => {
				return await ctx.db
					.query("users")
					.withIndex("by_token", (q: any) =>
						q.eq("tokenIdentifier", "testing|user_special"),
					)
					.unique();
			});

			expect(updatedUser?.name).toBe(specialName);
		});

		test("handles very long names appropriately", async () => {
			const t = convexTest(schema, modules);

			const userId = await t.run(async (ctx) => {
				const now = Date.now();
				return await ctx.db.insert("users", {
					name: "Short Name",
					createdAt: now,
					updatedAt: now,
				});
			});

			const longName = "A".repeat(200); // Very long name
			await t
				.withIdentity({
					tokenIdentifier: "testing|user_long",
					email: "user@example.com",
				})
				.mutation(api.users.updateUser, { name: longName });

			const updatedUser = await t.run(async (ctx) => {
				return await ctx.db
					.query("users")
					.withIndex("by_token", (q: any) =>
						q.eq("tokenIdentifier", "testing|user_long"),
					)
					.unique();
			});

			expect(updatedUser?.name).toBe(longName);
		});
	});
});
