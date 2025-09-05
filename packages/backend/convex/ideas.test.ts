/**
 * Ideas System Tests
 * Tests core business functionality for idea management
 */

import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import type { Id } from "./_generated/dataModel";
import { idOf } from "../test-utils";

describe("Ideas System", () => {
	let t: ReturnType<typeof convexTest>;
	let adminUserId: Id<"users">;
	let editorUserId: Id<"users">;
	let workspaceId: Id<"workspaces">;
	let projectId: Id<"projects">;
	let folderId: Id<"folders">;

	beforeEach(async () => {
		t = convexTest(schema, modules);

		// Setup admin user
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

		// Setup editor user
		editorUserId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert("users", {
				name: "Editor User",
				email: "editor@test.com",
				tokenIdentifier: "test|editor456",
				createdAt: now,
				updatedAt: now,
			});
		});

		// Setup workspace
		workspaceId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert("workspaces", {
				name: "Test Workspace",
				type: "shared",
				isPersonal: false,
				plan: "free",
				ownerUserId: adminUserId,
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

		// Add editor membership
		await t.run(async (ctx) => {
			await ctx.db.insert("workspaceMembers", {
				workspaceId,
				userId: editorUserId,
				role: "editor",
				createdAt: Date.now(),
			});
		});

		// Setup project
		projectId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert("projects", {
				workspaceId,
				name: "Test Project",
				description: "Test project for ideas",
				status: "active",
				priority: "medium",
				ownerId: adminUserId,
				sortKey: 1,
				createdBy: adminUserId,
				createdAt: now,
				updatedAt: now,
			});
		});

		// Setup folder
		folderId = await t.run(async (ctx) => {
			const now = Date.now();
			return await ctx.db.insert("folders", {
				workspaceId,
				name: "Test Folder",
				sortKey: 1000,
				createdBy: adminUserId,
				createdAt: now,
				updatedAt: now,
			});
		});
	});

	afterEach(async () => {
		// Cleanup database
		await t.run(async (ctx) => {
			const tables = [
				"users",
				"workspaces",
				"workspaceMembers",
				"projects",
				"folders",
				"ideas",
			];
			for (const table of tables) {
				try {
					const records = await ctx.db.query(table).collect();
					for (const record of records) {
						await ctx.db.delete(record._id);
					}
				} catch (_error) {
					// Table might not exist, continue
				}
			}
		});
	});

	describe("Idea Creation", () => {
		test("Given_AuthorizedUser_When_CreatesIdea_Then_CreatesIdeaSuccessfully", async () => {
			// Act
			const ideaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Revolutionary AI Assistant",
					contentMD: "# AI Assistant Idea\n\nThis could change everything!",
					problem: "Users struggle with productivity",
					hypothesis: "AI can automate repetitive tasks",
					value: "Save 2+ hours per day",
					risks: "Privacy concerns, learning curve",
				});

			const idea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.get, { ideaId });

			// Assert
			expect(ideaId).toBeDefined();
			expect(idea).toBeDefined();
			expect(idOf(idea, "idea")).toEqual(ideaId);
			expect(idea?.title).toBe("Revolutionary AI Assistant");
			expect(idea?.workspaceId).toEqual(workspaceId);
			expect(idea?.createdBy).toEqual(adminUserId);
			expect(idea?.status).toBe("draft");
		});

		test("Given_IdeaWithProject_When_CreatesIdea_Then_LinksToProject", async () => {
			// Act
			const ideaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					projectId,
					title: "Project-linked Idea",
					contentMD: "This idea belongs to a project",
				});

			const idea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.get, { ideaId });

			// Assert
			expect(idea?.projectId).toEqual(projectId);
		});

		test("Given_IdeaWithFolder_When_CreatesIdea_Then_LinksToFolder", async () => {
			// Act
			const ideaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					folderId,
					title: "Folder-organized Idea",
					contentMD: "This idea is in a folder",
				});

			const idea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.get, { ideaId });

			// Assert
			expect(idea?.folderId).toEqual(folderId);
		});

		test("Given_UnauthorizedUser_When_CreatesIdea_Then_ThrowsError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|unauthorized" })
					.mutation(api.ideas.create, {
						workspaceId,
						title: "Unauthorized Idea",
						contentMD: "Should not be created",
					}),
			).rejects.toThrow();
		});

		test("Given_EmptyTitle_When_CreatesIdea_Then_ThrowsValidationError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|admin123" })
					.mutation(api.ideas.create, {
						workspaceId,
						title: "",
						contentMD: "Content without title",
					}),
			).rejects.toThrow();
		});
	});

	describe("Idea Retrieval", () => {
		let ideaId: Id<"ideas">;

		beforeEach(async () => {
			ideaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Test Idea for Retrieval",
					contentMD: "Test content",
					problem: "Test problem",
					value: "Test value",
				});
		});

		test("Given_ExistingIdea_When_GetsIdea_Then_ReturnsIdeaData", async () => {
			// Act
			const idea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.get, { ideaId });

			// Assert
			expect(idea).toBeDefined();
			expect(idOf(idea, "idea")).toEqual(ideaId);
			expect(idea?.title).toBe("Test Idea for Retrieval");
			expect(idea?.problem).toBe("Test problem");
			expect(idea?.value).toBe("Test value");
		});

		test("Given_NonExistentIdea_When_GetsIdea_Then_ReturnsNull", async () => {
			// Arrange - Generate fake ID using proper pattern
			const fakeIdeaId = await t.run(async (ctx) => {
				const tempId = await ctx.db.insert("ideas", {
					workspaceId,
					title: "temp",
					contentMD: "",
					status: "draft",
					createdBy: adminUserId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			// Act
			const idea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.get, { ideaId: fakeIdeaId });

			// Assert
			expect(idea).toBeNull();
		});

		test("Given_UnauthorizedUser_When_GetsIdea_Then_ThrowsError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|unauthorized" })
					.query(api.ideas.get, { ideaId }),
			).rejects.toThrow();
		});
	});

	describe("Idea Updates", () => {
		let ideaId: Id<"ideas">;

		beforeEach(async () => {
			ideaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Original Title",
					contentMD: "Original content",
				});
		});

		test("Given_ExistingIdea_When_UpdatesTitle_Then_UpdatesSuccessfully", async () => {
			// Act
			const updatedIdea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.update, {
					ideaId,
					title: "Updated Title",
				});

			// Assert
			expect(updatedIdea).toBeDefined();
			expect(updatedIdea?.title).toBe("Updated Title");
			expect(updatedIdea?.contentMD).toBe("Original content"); // Unchanged
		});

		test("Given_ExistingIdea_When_UpdatesStatus_Then_UpdatesSuccessfully", async () => {
			// Act
			const updatedIdea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.update, {
					ideaId,
					status: "active",
				});

			// Assert
			expect(updatedIdea?.status).toBe("active");
		});

		test("Given_ExistingIdea_When_UpdatesStructuredFields_Then_UpdatesSuccessfully", async () => {
			// Act
			const updatedIdea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.update, {
					ideaId,
					problem: "Updated problem statement",
					hypothesis: "Updated hypothesis",
					value: "Updated value proposition",
					risks: "Updated risk analysis",
				});

			// Assert
			expect(updatedIdea?.problem).toBe("Updated problem statement");
			expect(updatedIdea?.hypothesis).toBe("Updated hypothesis");
			expect(updatedIdea?.value).toBe("Updated value proposition");
			expect(updatedIdea?.risks).toBe("Updated risk analysis");
		});

		test("Given_UnauthorizedUser_When_UpdatesIdea_Then_ThrowsError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|unauthorized" })
					.mutation(api.ideas.update, {
						ideaId,
						title: "Unauthorized Update",
					}),
			).rejects.toThrow();
		});
	});

	describe("Idea Listing", () => {
		beforeEach(async () => {
			// Create multiple ideas for testing
			const activeIdea1 = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Active Idea 1",
					contentMD: "Active content 1",
				});

			// Update to active status
			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.update, {
					ideaId: activeIdea1,
					status: "active",
				});

			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					projectId,
					title: "Project Idea",
					contentMD: "Project linked content",
				});

			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					folderId,
					title: "Folder Idea",
					contentMD: "Folder organized content",
				});

			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Draft Idea",
					contentMD: "Draft content",
				});
		});

		test("Given_WorkspaceWithIdeas_When_ListsIdeas_Then_ReturnsAllIdeas", async () => {
			// Act
			const ideas = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.list, { workspaceId });

			// Assert
			expect(ideas).toBeDefined();
			expect((ideas ?? []).length).toBe(4);
			expect(ideas.every((idea) => idea.workspaceId === workspaceId)).toBe(
				true,
			);
		});

		test("Given_ProjectFilter_When_ListsIdeas_Then_ReturnsOnlyProjectIdeas", async () => {
			// Act
			const ideas = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.list, {
					workspaceId,
					projectId,
				});

			// Assert
			expect(ideas).toBeDefined();
			expect((ideas ?? []).length).toBe(1);
			expect(ideas[0].title).toBe("Project Idea");
			expect(ideas[0].projectId).toEqual(projectId);
		});

		test("Given_FolderFilter_When_ListsIdeas_Then_ReturnsOnlyFolderIdeas", async () => {
			// Act
			const ideas = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.list, {
					workspaceId,
					folderId,
				});

			// Assert
			expect(ideas).toBeDefined();
			expect((ideas ?? []).length).toBe(1);
			expect(ideas[0].title).toBe("Folder Idea");
			expect(ideas[0].folderId).toEqual(folderId);
		});

		test("Given_StatusFilter_When_ListsIdeas_Then_ReturnsFilteredIdeas", async () => {
			// Act
			const activeIdeas = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.list, {
					workspaceId,
					status: "active",
				});

			// Assert
			expect(activeIdeas).toBeDefined();
			expect((activeIdeas ?? []).length).toBe(1);
			expect(activeIdeas[0].title).toBe("Active Idea 1");
			expect(activeIdeas[0].status).toBe("active");
		});
	});

	describe("Idea Search", () => {
		beforeEach(async () => {
			// Create searchable ideas
			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Machine Learning Algorithm",
					contentMD: "Advanced neural network concepts",
				});

			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "React Component Design",
					contentMD: "Building reusable UI components",
				});

			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Database Optimization",
					contentMD: "Improving query performance",
				});
		});

		test("Given_SearchQuery_When_SearchesIdeas_Then_ReturnsMatchingIdeas", async () => {
			// Act
			const results = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.search, {
					workspaceId,
					query: "Machine Learning",
				});

			// Assert
			expect(results).toBeDefined();
			expect((results ?? []).length).toBeGreaterThan(0);
			expect(
				results.some((idea) => idea.title.includes("Machine Learning")),
			).toBe(true);
		});

		test("Given_EmptyQuery_When_SearchesIdeas_Then_ReturnsAllIdeas", async () => {
			// Act
			const results = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.search, {
					workspaceId,
				});

			// Assert
			expect(results).toBeDefined();
			expect((results ?? []).length).toBe(3);
		});

		test("Given_LimitParameter_When_SearchesIdeas_Then_RespectsLimit", async () => {
			// Act
			const results = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.search, {
					workspaceId,
					limit: 2,
				});

			// Assert
			expect(results).toBeDefined();
			expect((results ?? []).length).toBeLessThanOrEqual(2);
		});
	});

	describe("Idea Deletion", () => {
		let ideaId: Id<"ideas">;

		beforeEach(async () => {
			ideaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Idea to Delete",
					contentMD: "This will be deleted",
				});
		});

		test("Given_ExistingIdea_When_DeletesIdea_Then_RemovesIdeaSuccessfully", async () => {
			// Act
			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.deleteIdea, { ideaId });

			// Assert - Idea should be soft deleted
			const deletedIdea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.get, { ideaId });

			expect(deletedIdea).toBeNull();
		});

		test("Given_UnauthorizedUser_When_DeletesIdea_Then_ThrowsError", async () => {
			// Act & Assert
			await expect(
				t
					.withIdentity({ tokenIdentifier: "test|unauthorized" })
					.mutation(api.ideas.deleteIdea, { ideaId }),
			).rejects.toThrow();
		});

		test("Given_NonExistentIdea_When_DeletesIdea_Then_ThrowsError", async () => {
			// Arrange - Generate fake ID using proper pattern
			const fakeIdeaId = await t.run(async (ctx) => {
				const tempId = await ctx.db.insert("ideas", {
					workspaceId,
					title: "temp",
					contentMD: "",
					status: "draft",
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
					.mutation(api.ideas.deleteIdea, { ideaId: fakeIdeaId }),
			).rejects.toThrow();
		});
	});

	describe("Idea Organization", () => {
		let sourceIdeaId: Id<"ideas">;
		let targetFolderId: Id<"folders">;
		let targetProjectId: Id<"projects">;

		beforeEach(async () => {
			// Create idea to move
			sourceIdeaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Moveable Idea",
					contentMD: "This idea will be moved",
				});

			// Create target folder
			targetFolderId = await t.run(async (ctx) => {
				const now = Date.now();
				return await ctx.db.insert("folders", {
					workspaceId,
					name: "Target Folder",
					sortKey: 2000,
					createdBy: adminUserId,
					createdAt: now,
					updatedAt: now,
				});
			});

			// Create target project
			targetProjectId = await t.run(async (ctx) => {
				const now = Date.now();
				return await ctx.db.insert("projects", {
					workspaceId,
					name: "Target Project",
					description: "Target for moving ideas",
					status: "active",
					priority: "medium",
					ownerId: adminUserId,
					actualHours: 0,
					progress: 0,
					sortKey: 2,
					createdBy: adminUserId,
					createdAt: now,
					updatedAt: now,
				});
			});
		});

		test("Given_IdeaAndTargetFolder_When_MovesIdea_Then_UpdatesFolderAssignment", async () => {
			// Act
			const movedIdea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.move, {
					ideaId: sourceIdeaId,
					targetFolderId,
				});

			// Assert
			expect(movedIdea).toBeDefined();
			expect(movedIdea?.folderId).toEqual(targetFolderId);
		});

		test("Given_IdeaAndTargetProject_When_MovesIdea_Then_UpdatesProjectAssignment", async () => {
			// Act
			const movedIdea = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.move, {
					ideaId: sourceIdeaId,
					targetProjectId,
				});

			// Assert
			expect(movedIdea).toBeDefined();
			expect(movedIdea?.projectId).toEqual(targetProjectId);
		});
	});

	describe("Folder Management", () => {
		test("Given_AuthorizedUser_When_CreatesFolder_Then_CreatesFolderSuccessfully", async () => {
			// Act
			const folder = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.createFolder, {
					workspaceId,
					name: "New Ideas Folder",
				});

			// Assert
			expect(folder).toBeDefined();
			expect(idOf(folder, "folder")).toBeDefined();
			expect(folder?.name).toBe("New Ideas Folder");
			expect(folder?.workspaceId).toEqual(workspaceId);
			expect(folder?.createdBy).toEqual(adminUserId);
		});

		test("Given_ParentFolder_When_CreatesSubfolder_Then_LinksToParent", async () => {
			// Act
			const subfolder = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.createFolder, {
					workspaceId,
					name: "Subfolder",
					parentId: folderId,
				});

			// Assert
			expect(subfolder?.parentId).toEqual(folderId);
		});

		test("Given_FolderHierarchy_When_GetsFolderHierarchy_Then_ReturnsStructure", async () => {
			// Arrange - Create nested folders
			const parentFolder = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.createFolder, {
					workspaceId,
					name: "Parent Folder",
				});

			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.createFolder, {
					workspaceId,
					name: "Child Folder",
					parentId: idOf(parentFolder, "parentFolder"),
				});

			// Act
			const hierarchy = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.getFolderHierarchy, { workspaceId });

			// Assert
			expect(hierarchy).toBeDefined();
			expect((hierarchy ?? []).length).toBeGreaterThan(0);

			// Check that Parent Folder exists at root level
			const parentInHierarchy = hierarchy.find(
				(folder) => folder?.name === "Parent Folder",
			);
			expect(parentInHierarchy).toBeDefined();

			// Check that Child Folder exists as a child of Parent Folder
			expect(parentInHierarchy?.children).toBeDefined();
			expect((parentInHierarchy?.children ?? []).length).toBeGreaterThan(0);
			expect(
				(parentInHierarchy?.children ?? []).some(
					(child) => child.name === "Child Folder",
				),
			).toBe(true);
		});

		test("Given_ExistingFolder_When_DeletesFolder_Then_RemovesFolderSuccessfully", async () => {
			// Arrange
			const folderToDelete = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.createFolder, {
					workspaceId,
					name: "Folder to Delete",
				});

			// Act
			await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.deleteFolder, {
					folderId: idOf(folderToDelete, "folderToDelete"),
				});

			// Assert - Check folder is soft deleted
			const hierarchy = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.query(api.ideas.getFolderHierarchy, { workspaceId });

			expect(
				hierarchy.some(
					(folder) => folder._id === idOf(folderToDelete, "folderToDelete"),
				),
			).toBe(false);
		});
	});

	describe("Permission Tests", () => {
		test("Given_EditorUser_When_CreatesIdea_Then_AllowsOperation", async () => {
			// Act
			const ideaId = await t
				.withIdentity({ tokenIdentifier: "test|editor456" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Editor Created Idea",
					contentMD: "Created by editor",
				});

			const idea = await t
				.withIdentity({ tokenIdentifier: "test|editor456" })
				.query(api.ideas.get, { ideaId });

			// Assert
			expect(idea).toBeDefined();
			expect(idea?.title).toBe("Editor Created Idea");
			expect(idea?.createdBy).toEqual(editorUserId);
		});

		test("Given_EditorUser_When_UpdatesIdea_Then_AllowsOperation", async () => {
			// Arrange - Admin creates idea
			const ideaId = await t
				.withIdentity({ tokenIdentifier: "test|admin123" })
				.mutation(api.ideas.create, {
					workspaceId,
					title: "Admin Created Idea",
					contentMD: "Created by admin",
				});

			// Act - Editor updates idea
			const updatedIdea = await t
				.withIdentity({ tokenIdentifier: "test|editor456" })
				.mutation(api.ideas.update, {
					ideaId,
					title: "Updated by Editor",
				});

			// Assert
			expect(updatedIdea).toBeDefined();
			expect(updatedIdea?.title).toBe("Updated by Editor");
		});
	});
});
