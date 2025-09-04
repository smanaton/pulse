/**
 * Integration Test - Convex Functions
 * Tests actual Convex functions against local instance
 * Real database operations with seeded test data
 */

import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

// Test data builders
const createTestUser = (overrides = {}) => ({
	name: "Test User",
	email: "test@example.com",
	tokenIdentifier: "test|user123",
	createdAt: Date.now(),
	updatedAt: Date.now(),
	...overrides,
});

const createTestWorkspace = (overrides = {}) => ({
	// Required workspace fields per schema
	type: "shared" as const,
	isPersonal: false,
	plan: "free" as const,
	name: "Test Workspace",
	ownerUserId: undefined, // For shared workspaces, ownerUserId is optional
	createdAt: Date.now(),
	updatedAt: Date.now(),
	...overrides,
});

const createTestIdea = (
	workspaceId: string,
	createdBy: Id<"users">,
	overrides: Record<string, unknown> = {},
) => ({
	// Required idea fields per schema
	workspaceId,
	projectId: undefined,
	folderId: undefined,
	title: "Test Idea",
	contentMD: "This is a test idea content",
	contentBlocks: undefined,
	problem: undefined,
	hypothesis: undefined,
	value: undefined,
	risks: undefined,
	aiSummary: undefined,
	status: "draft" as const,
	createdBy,
	createdAt: Date.now(),
	updatedAt: Date.now(),
	...overrides,
});

describe("Ideas Module - Convex Integration", () => {
	let t: ReturnType<typeof convexTest>;
	let userId: Id<"users">;
	let workspaceId: Id<"workspaces">;

	beforeEach(async () => {
		t = convexTest(schema, modules);

		// Setup test data
		userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", createTestUser());
		});

		workspaceId = await t.run(async (ctx) => {
			return await ctx.db.insert("workspaces", createTestWorkspace());
		});

		// Add user to workspace
		await t.run(async (ctx) => {
			await ctx.db.insert("workspaceMembers", {
				workspaceId,
				userId,
				role: "admin",
				createdAt: Date.now(),
			});
		});
	});

	afterEach(async () => {
		// Clean up test data
		await t.run(async (ctx) => {
			const tables = ["ideas", "workspaceMembers", "workspaces", "users"];
			for (const table of tables) {
				const docs = await ctx.db.query(table).collect();
				for (const doc of docs) {
					await ctx.db.delete(doc._id);
				}
			}
		});
	});

	describe("Create Idea", () => {
		test("Given_AuthenticatedUser_When_CreatesIdea_Then_StoresWithCorrectData", async () => {
			// Act
			const ideaId = await t
				.withIdentity({ tokenIdentifier: "test|user123" })
				.mutation(api.ideas.create, {
					title: "New Test Idea",
					contentMD: "New test content",
					workspaceId,
				});

			// Assert
			const idea = await t.run(async (ctx) => {
				return await ctx.db.get(ideaId);
			});

			expect(idea).toMatchObject({
				title: "New Test Idea",
				contentMD: "New test content",
				workspaceId,
			});
			expect(idea?.createdAt).toBeGreaterThan(0);
		});

		test("Given_UnauthorizedUser_When_CreatesIdea_Then_ThrowsError", async () => {
			// Act & Assert
			await expect(
				t.mutation(api.ideas.create, {
					title: "Unauthorized Idea",
					contentMD: "Should not work",
					workspaceId,
				}),
			).rejects.toThrow("Authentication required");
		});

		test("Given_UserNotInWorkspace_When_CreatesIdea_Then_ThrowsError", async () => {
			// Arrange
			const otherWorkspaceId = await t.run(async (ctx) => {
				return await ctx.db.insert(
					"workspaces",
					createTestWorkspace({
						name: "Other Workspace",
					}),
				);
			});

			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|user123" })
					.mutation(api.ideas.create, {
						title: "Unauthorized Idea",
						contentMD: "Should not work",
						workspaceId: otherWorkspaceId,
					}),
			).rejects.toThrow("Not a workspace member");
		});

		test("Given_InvalidInput_When_CreatesIdea_Then_ValidatesAndThrows", async () => {
			// Act & Assert - Empty title
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|user123" })
					.mutation(api.ideas.create, {
						title: "",
						contentMD: "Valid content",
						workspaceId,
					}),
			).rejects.toThrow("Idea title is required");

			// Act & Assert - Title too long should be truncated, not throw
			const longTitle = "A".repeat(201);
			const ideaId = await t
				.withIdentity({ tokenIdentifier: "test|user123" })
				.mutation(api.ideas.create, {
					title: longTitle,
					contentMD: "Valid content",
					workspaceId,
				});
			const idea = await t.run(async (ctx) => ctx.db.get(ideaId));
			expect(idea?.title.length).toBe(200);
		});
	});

	describe("List Ideas", () => {
		test("Given_WorkspaceWithIdeas_When_Listed_Then_ReturnsIdeasInCorrectOrder", async () => {
			// Arrange - Create ideas with different timestamps
			const _idea1Id = await t.run(async (ctx) => {
				return await ctx.db.insert(
					"ideas",
					createTestIdea(workspaceId, userId, {
						title: "Older Idea",
						createdAt: Date.now() - 1000,
						updatedAt: Date.now() - 1000,
					}),
				);
			});

			const _idea2Id = await t.run(async (ctx) => {
				return await ctx.db.insert(
					"ideas",
					createTestIdea(workspaceId, userId, {
						title: "Newer Idea",
						createdAt: Date.now(),
						updatedAt: Date.now(),
					}),
				);
			});

			// Act
			const ideas = await t
				.withIdentity({ tokenIdentifier: "test|user123" })
				.query(api.ideas.list, { workspaceId });

			// Assert
			expect(ideas).toHaveLength(2);
			expect(ideas[0].title).toBe("Newer Idea"); // Should be newest first
			expect(ideas[1].title).toBe("Older Idea");
		});

		test("Given_EmptyWorkspace_When_Listed_Then_ReturnsEmptyArray", async () => {
			// Act
			const ideas = await t
				.withIdentity({ tokenIdentifier: "test|user123" })
				.query(api.ideas.list, { workspaceId });

			// Assert
			expect(ideas).toEqual([]);
		});

		test("Given_UserNotInWorkspace_When_Listed_Then_ThrowsError", async () => {
			// Arrange
			const otherWorkspaceId = await t.run(async (ctx) => {
				return await ctx.db.insert(
					"workspaces",
					createTestWorkspace({
						name: "Other Workspace",
					}),
				);
			});

			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|user123" })
					.query(api.ideas.list, { workspaceId: otherWorkspaceId }),
			).rejects.toThrow("Not a workspace member");
		});
	});

	describe("Update Idea", () => {
		let ideaId: Id<"ideas">;

		beforeEach(async () => {
			ideaId = await t.run(async (ctx) => {
				return await ctx.db.insert(
					"ideas",
					createTestIdea(workspaceId, userId),
				);
			});
		});

		test("Given_ValidUpdate_When_Updated_Then_ModifiesCorrectFields", async () => {
			// Get original idea for timestamp comparison
			const originalIdea = await t.run(async (ctx) => {
				return await ctx.db.get(ideaId);
			});

			// Add small delay to ensure different timestamps
			await new Promise((resolve) => setTimeout(resolve, 1));

			// Act
			await t
				.withIdentity({ tokenIdentifier: "test|user123" })
				.mutation(api.ideas.update, {
					ideaId,
					title: "Updated Title",
					contentMD: "Updated content",
				});

			// Assert
			const updatedIdea = await t.run(async (ctx) => {
				return await ctx.db.get(ideaId);
			});

			expect(updatedIdea).toMatchObject({
				title: "Updated Title",
				contentMD: "Updated content",
			});
			expect(updatedIdea?.updatedAt).toBeGreaterThan(
				originalIdea?.createdAt || 0,
			);
		});

		test("Given_PartialUpdate_When_Updated_Then_UpdatesOnlySpecifiedFields", async () => {
			// Arrange
			const originalIdea = await t.run(async (ctx) => {
				return await ctx.db.get(ideaId);
			});

			// Act - Update only title
			await t
				.withIdentity({ tokenIdentifier: "test|user123" })
				.mutation(api.ideas.update, {
					ideaId,
					title: "Only Title Updated",
				});

			// Assert
			const updatedIdea = await t.run(async (ctx) => {
				return await ctx.db.get(ideaId);
			});

			expect(updatedIdea?.title).toBe("Only Title Updated");
			expect(updatedIdea?.contentMD).toBe(originalIdea?.contentMD); // Unchanged
		});
	});

	describe("Delete Idea", () => {
		let ideaId: Id<"ideas">;

		beforeEach(async () => {
			ideaId = await t.run(async (ctx) => {
				return await ctx.db.insert(
					"ideas",
					createTestIdea(workspaceId, userId),
				);
			});
		});

		test("Given_ExistingIdea_When_Deleted_Then_RemovedFromDatabase", async () => {
			// Act
			await t
				.withIdentity({ tokenIdentifier: "test|user123" })
				.mutation(api.ideas.deleteIdea, { ideaId });

			// Assert - soft delete: document remains with deletedAt set
			const deletedIdea = await t.run(async (ctx) => {
				return await ctx.db.get(ideaId);
			});

			expect(deletedIdea?.deletedAt).toBeGreaterThan(0);
		});

		test("Given_NonExistentIdea_When_Deleted_Then_ThrowsError", async () => {
			// Arrange
			const fakeId = await t.run(async (ctx) => {
				const tempId = await ctx.db.insert(
					"ideas",
					createTestIdea(workspaceId, userId),
				);
				await ctx.db.delete(tempId);
				return tempId;
			});

			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|user123" })
					.mutation(api.ideas.deleteIdea, { ideaId: fakeId }),
			).rejects.toThrow("Idea not found");
		});
	});
});
