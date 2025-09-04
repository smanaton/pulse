/**
 * API Keys System Tests
 * Tests key generation, validation, security, and permissions
 */

import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

describe("API Keys System", () => {
	let t: ReturnType<typeof convexTest>;
	let adminUserId: Id<"users">;
	let workspaceId: Id<"workspaces">;
	let memberUserId: Id<"users">;

	beforeEach(async () => {
		t = convexTest(schema, modules);

		// Setup test workspace and users
		adminUserId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert("users", {
				name: "Admin User",
				email: "admin@test.com",
				tokenIdentifier: "test|admin123",
				createdAt: now,
				updatedAt: now,
			});
		});

		memberUserId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert("users", {
				name: "Member User",
				email: "member@test.com",
				tokenIdentifier: "test|member123",
				createdAt: now,
				updatedAt: now,
			});
		});

		workspaceId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert("workspaces", {
				name: "Test Workspace",
				type: "shared",
				isPersonal: false,
				plan: "free",
				createdAt: now,
				updatedAt: now,
			});
		});

		// Add admin membership
		await t.run(async (ctx) => {
			await ctx.db.insert("workspaceMembers", {
				workspaceId,
				userId: adminUserId,
				role: "admin",
				createdAt: Date.now(),
			});
		});

		// Add regular membership
		await t.run(async (ctx) => {
			await ctx.db.insert("workspaceMembers", {
				workspaceId,
				userId: memberUserId,
				role: "viewer",
				createdAt: Date.now(),
			});
		});
	});

	afterEach(async () => {
		// Clean up test data
		await t.run(async (ctx) => {
			const tables = [
				"apiKeys",
				"workspaceMembers",
				"workspaces",
				"users",
				"events",
			];
			for (const table of tables) {
				try {
					const docs = await ctx.db.query(table).collect();
					for (const doc of docs) {
						await ctx.db.delete(doc._id);
					}
				} catch {
					// Table might not exist, skip
				}
			}
		});
	});

	describe("API Key Generation", () => {
		test("Given_AdminUser_When_GeneratesKey_Then_CreatesValidKey", async () => {
			// Act
			const result = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Test Extension",
					device: "Chrome Extension v1.0",
					scopes: ["clipper:write", "ideas:read"],
				});

			// Assert
			expect(result).toMatchObject({
				name: "Test Extension",
				device: "Chrome Extension v1.0",
				scopes: ["clipper:write", "ideas:read"],
			});
			expect(result?.key).toMatch(/^pk_live_[a-f0-9]{64}$/);
			expect(result?.prefix).toMatch(/^pk_live_[a-f0-9]{4}$/);
			expect(result?.id).toBeDefined();
			expect(result?.createdAt).toBeGreaterThan(0);
		});

		test("Given_AdminUser_When_GeneratesKeyWithExpiration_Then_SetsExpiryCorrectly", async () => {
			// Arrange
			const oneYearFromNow = Date.now() + 365 * 24 * 60 * 60 * 1000;

			// Act
			const result = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Expiring Key",
					device: "Test Device",
					scopes: ["workspace:read"],
					expiresAt: oneYearFromNow,
				});

			// Assert
			expect(result?.name).toBe("Expiring Key");

			// Verify stored in database with expiration
			const storedKey = await t.run(async (ctx) => {
				return result ? await ctx.db.get(result.id) : null;
			});
			expect(storedKey?.expiresAt).toBe(oneYearFromNow);
		});

		test("Given_InvalidScopes_When_GeneratesKey_Then_ThrowsValidationError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|admin123" })
					.mutation(api.apiKeys.generate, {
						workspaceId,
						name: "Invalid Key",
						device: "Test Device",
						scopes: ["invalid:scope", "clipper:write"], // Invalid scope
					}),
			).rejects.toThrow("Invalid scope: invalid:scope");
		});

		test("Given_EmptyName_When_GeneratesKey_Then_ThrowsValidationError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|admin123" })
					.mutation(api.apiKeys.generate, {
						workspaceId,
						name: "   ", // Empty/whitespace name
						device: "Test Device",
						scopes: ["clipper:write"],
					}),
			).rejects.toThrow("API key name is required");
		});

		test("Given_NonAdminUser_When_GeneratesKey_Then_ThrowsPermissionError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|member123" })
					.mutation(api.apiKeys.generate, {
						workspaceId,
						name: "Unauthorized Key",
						device: "Test Device",
						scopes: ["clipper:write"],
					}),
			).rejects.toThrow();
		});
	});

	describe("API Key Listing", () => {
		test("Given_WorkspaceWithKeys_When_ListsCalled_Then_ReturnsKeysWithoutSecrets", async () => {
			// Arrange - Create a few API keys
			const _key1 = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Key 1",
					device: "Device 1",
					scopes: ["clipper:write"],
				});

			const _key2 = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Key 2",
					device: "Device 2",
					scopes: ["ideas:read"],
				});

			// Act
			const keys = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.apiKeys.list, { workspaceId });

			// Assert
			expect(keys).toHaveLength(2);

			// Should not include full key or hash
			for (const key of keys) {
				expect(key).not.toHaveProperty("key");
				expect(key).not.toHaveProperty("keyHash");
				expect(key).toHaveProperty("prefix");
				expect(key).toHaveProperty("name");
				expect(key).toHaveProperty("device");
				expect(key).toHaveProperty("scopes");
			}

			// Should be ordered by creation (newest first)
			const keyNames = keys.map((k) => k.name);
			expect(keyNames).toEqual(["Key 2", "Key 1"]);
		});

		test("Given_EmptyWorkspace_When_ListsCalled_Then_ReturnsEmptyArray", async () => {
			// Act
			const keys = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.apiKeys.list, { workspaceId });

			// Assert
			expect(keys).toEqual([]);
		});

		test("Given_NonAdminUser_When_ListsCalled_Then_ThrowsPermissionError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|member123" })
					.query(api.apiKeys.list, { workspaceId }),
			).rejects.toThrow();
		});
	});

	describe("API Key Validation", () => {
		test("Given_ValidKey_When_Validated_Then_ReturnsKeyInfo", async () => {
			// Arrange - Generate a key and get its hash
			const generatedKey = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Validation Test",
					device: "Test Device",
					scopes: ["clipper:write", "ideas:read"],
				});

			// Get the stored key to access the hash
			const storedKey = await t.run(async (ctx) => {
				return await ctx.db.get(generatedKey.id);
			});

			// Act
			const validationResult = await t.query(api.apiKeys.validate, {
				keyHash: storedKey?.keyHash,
			});

			// Assert
			expect(validationResult).toMatchObject({
				id: generatedKey.id,
				userId: adminUserId,
				workspaceId,
				scopes: ["clipper:write", "ideas:read"],
				device: "Test Device",
				workspace: {
					id: workspaceId,
					name: "Test Workspace",
					type: "shared",
				},
				user: {
					id: adminUserId,
					name: "Admin User",
					email: "admin@test.com",
				},
			});
		});

		test("Given_ExpiredKey_When_Validated_Then_ReturnsNull", async () => {
			// Arrange - Generate key with past expiration
			const pastDate = Date.now() - 1000; // 1 second ago

			const generatedKey = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Expired Key",
					device: "Test Device",
					scopes: ["clipper:write"],
					expiresAt: pastDate,
				});

			const storedKey = await t.run(async (ctx) => {
				return await ctx.db.get(generatedKey.id);
			});

			// Act
			const validationResult = await t.query(api.apiKeys.validate, {
				keyHash: storedKey?.keyHash,
			});

			// Assert
			expect(validationResult).toBeNull();
		});

		test("Given_NonExistentKey_When_Validated_Then_ReturnsNull", async () => {
			// Act
			const validationResult = await t.query(api.apiKeys.validate, {
				keyHash: "nonexistent_hash_12345",
			});

			// Assert
			expect(validationResult).toBeNull();
		});
	});

	describe("API Key Revocation", () => {
		test("Given_AdminUser_When_RevokesKey_Then_DeletesKeyAndLogsEvent", async () => {
			// Arrange
			const generatedKey = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Key to Revoke",
					device: "Test Device",
					scopes: ["clipper:write"],
				});

			// Act
			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.revoke, {
					apiKeyId: generatedKey.id,
				});

			// Assert - Key should be deleted
			const deletedKey = await t.run(async (ctx) => {
				return await ctx.db.get(generatedKey.id);
			});
			expect(deletedKey).toBeNull();

			// Assert - Revocation event should be logged
			const events = await t.run(async (ctx) => {
				return await ctx.db
					.query("events")
					.filter((q) => q.eq(q.field("workspaceId"), workspaceId))
					.collect();
			});

			const revocationEvent = events.find((e) => e.type === "api_key_revoked");
			expect(revocationEvent).toBeDefined();
			expect(revocationEvent?.meta).toMatchObject({
				device: "Test Device",
			});
		});

		test("Given_KeyCreator_When_RevokesOwnKey_Then_AllowsRevocation", async () => {
			// Arrange - Member creates key (if they had permission, but let's test creator access)
			// First, upgrade member to admin temporarily to create key
			await t.run(async (ctx) => {
				const membership = await ctx.db
					.query("workspaceMembers")
					.filter((q) =>
						q.and(
							q.eq(q.field("workspaceId"), workspaceId),
							q.eq(q.field("userId"), memberUserId),
						),
					)
					.unique();
				if (membership) {
					await ctx.db.patch(membership._id, { role: "admin" });
				}
			});

			const generatedKey = await t
				.withIdentity({ tokenIdentifier: "test|member123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Member Key",
					device: "Member Device",
					scopes: ["ideas:read"],
				});

			// Downgrade back to member
			await t.run(async (ctx) => {
				const membership = await ctx.db
					.query("workspaceMembers")
					.filter((q) =>
						q.and(
							q.eq(q.field("workspaceId"), workspaceId),
							q.eq(q.field("userId"), memberUserId),
						),
					)
					.unique();
				if (membership) {
					await ctx.db.patch(membership._id, { role: "viewer" });
				}
			});

			// Act - Member should be able to revoke their own key
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|member123" })
					.mutation(api.apiKeys.revoke, {
						apiKeyId: generatedKey.id,
					}),
			).resolves.not.toThrow();
		});

		test("Given_NonExistentKey_When_Revoked_Then_ThrowsNotFoundError", async () => {
			// Arrange - Create fake key ID
			const fakeKeyId = await t.run(async (ctx) => {
				const tempId = await ctx.db.insert("apiKeys", {
					userId: adminUserId,
					workspaceId,
					name: "Temp",
					keyHash: "temp",
					keyPrefix: "temp",
					device: "temp",
					scopes: [],
					createdBy: adminUserId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|admin123" })
					.mutation(api.apiKeys.revoke, {
						apiKeyId: fakeKeyId,
					}),
			).rejects.toThrow("API key not found");
		});
	});

	describe("API Key Usage Tracking", () => {
		test("Given_ApiKey_When_UpdateLastUsed_Then_UpdatesTimestamp", async () => {
			// Arrange
			const generatedKey = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Usage Tracking Key",
					device: "Test Device",
					scopes: ["clipper:write"],
				});

			const beforeUpdate = Date.now();

			// Act
			await t.mutation(api.apiKeys.updateLastUsed, {
				apiKeyId: generatedKey.id,
			});

			// Assert
			const updatedKey = await t.run(async (ctx) => {
				return await ctx.db.get(generatedKey.id);
			});

			expect(updatedKey?.lastUsed).toBeGreaterThanOrEqual(beforeUpdate);
			expect(updatedKey?.updatedAt).toBeGreaterThanOrEqual(beforeUpdate);
		});
	});

	describe("API Key Security", () => {
		test("Given_GeneratedKey_When_Stored_Then_OnlyHashIsStored", async () => {
			// Arrange & Act
			const generatedKey = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.apiKeys.generate, {
					workspaceId,
					name: "Security Test",
					device: "Test Device",
					scopes: ["clipper:write"],
				});

			// Assert - Check database storage
			const storedKey = await t.run(async (ctx) => {
				return await ctx.db.get(generatedKey.id);
			});

			// Full key should not be stored
			expect(storedKey).not.toHaveProperty("key");

			// Hash should be stored and different from original key
			expect(storedKey?.keyHash).toBeDefined();
			expect(storedKey?.keyHash).not.toBe(generatedKey.key);
			expect(storedKey?.keyHash).toHaveLength(64); // SHA-256 hex length
		});

		test("Given_ValidScopes_When_Generated_Then_OnlyAllowsValidScopes", async () => {
			// Test all valid scopes
			const validScopes = [
				"clipper:write",
				"workspace:read",
				"ideas:read",
				"ideas:write",
				"tags:read",
			];

			// Act & Assert - Should not throw for valid scopes
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|admin123" })
					.mutation(api.apiKeys.generate, {
						workspaceId,
						name: "Scope Test",
						device: "Test Device",
						scopes: validScopes,
					}),
			).resolves.not.toThrow();
		});
	});
});
