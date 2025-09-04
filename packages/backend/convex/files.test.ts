/**
 * Files System Tests
 *
 * Comprehensive test suite for the Files management system.
 * Tests file upload, retrieval, listing, and deletion operations.
 */

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import { idOf } from "../test-utils";

function createUniqueIdentity() {
	return { tokenIdentifier: `user${Date.now()}${Math.random()}` };
}

describe("Files System", () => {
	describe("File Upload", () => {
		test("Should_Upload_File_Successfully", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-upload",
				});
			if (!workspace) throw new Error("Failed to create workspace");

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "test-document.pdf",
				size: 1024 * 50, // 50KB
				contentType: "application/pdf",
			});

			expect(file).toBeDefined();
			expect(file?.name).toBe("test-document.pdf");
			expect(file?.size).toBe(1024 * 50);
			expect(file?.contentType).toBe("application/pdf");
			expect(file?.workspaceId).toBe(idOf(workspace, "workspace"));
			expect(file?.url).toContain(idOf(workspace, "workspace"));
			expect(file?.createdBy).toBeDefined();
			expect(file?.createdAt).toBeDefined();
			expect(file?.deletedAt).toBeUndefined();
		});

		test("Should_Upload_File_With_Idea_Association", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-upload-idea",
				});

			const idea = await t.withIdentity(identity).mutation(api.ideas.create, {
				workspaceId: idOf(workspace, "workspace"),
				title: "Test Idea with File",
				contentMD: "This idea will have files attached",
			});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea,
				name: "research-notes.docx",
				size: 1024 * 25,
				contentType:
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			});

			expect(file).toBeDefined();
			expect(file?.ideaId).toBe(idea);
			expect(file?.name).toBe("research-notes.docx");
		});

		test("Should_Require_Editor_Role_For_Upload", async () => {
			const t = convexTest(schema, modules);
			const ownerIdentity = createUniqueIdentity();
			const viewerIdentity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(ownerIdentity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-upload-permission",
				});

			// Create viewer user directly
			const viewerId = await t.run(async (ctx) => {
				return await ctx.db.insert("users", {
					name: "Viewer User",
					email: "viewer@example.com",
					tokenIdentifier: viewerIdentity.tokenIdentifier,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			// Add viewer to workspace
			await t.run(async (ctx) => {
				await ctx.db.insert("workspaceMembers", {
					workspaceId: idOf(workspace, "workspace"),
					userId: viewerId,
					role: "viewer",
					createdAt: Date.now(),
				});
			});

			await expect(
				t.withIdentity(viewerIdentity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "unauthorized.txt",
					size: 100,
					contentType: "text/plain",
				}),
			).rejects.toThrow();
		});

		test("Should_Validate_File_Name", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-validation",
				});

			await expect(
				t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "",
					size: 1024,
					contentType: "text/plain",
				}),
			).rejects.toThrow("File name is required");

			await expect(
				t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "   ",
					size: 1024,
					contentType: "text/plain",
				}),
			).rejects.toThrow("File name is required");
		});

		test("Should_Validate_File_Size", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-size-validation",
				});

			// Test zero size
			await expect(
				t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "empty.txt",
					size: 0,
					contentType: "text/plain",
				}),
			).rejects.toThrow("Invalid file size");

			// Test negative size
			await expect(
				t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "negative.txt",
					size: -100,
					contentType: "text/plain",
				}),
			).rejects.toThrow("Invalid file size");

			// Test oversized file (> 100MB)
			await expect(
				t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "huge.zip",
					size: 101 * 1024 * 1024, // 101MB
					contentType: "application/zip",
				}),
			).rejects.toThrow("Invalid file size");
		});

		test("Should_Validate_Idea_Workspace_Association", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			// Create two workspaces
			const workspace1 = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Workspace 1",
					slug: "workspace-1",
				});

			const workspace2 = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Workspace 2",
					slug: "workspace-2",
				});

			// Create idea in workspace2
			const idea = await t.withIdentity(identity).mutation(api.ideas.create, {
				workspaceId: idOf(workspace2, "workspace2"),
				title: "Cross-workspace idea",
				contentMD: "This idea is in workspace2",
			});

			// Try to upload file to workspace1 with idea from workspace2
			await expect(
				t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace1, "workspace1"), // Different workspace
					ideaId: idea, // Idea from workspace2
					name: "cross-workspace.txt",
					size: 1024,
					contentType: "text/plain",
				}),
			).rejects.toThrow("Idea does not belong to workspace");
		});
	});

	describe("File Retrieval", () => {
		test("Should_Get_File_By_Id", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-get",
				});

			const uploadedFile = await t
				.withIdentity(identity)
				.mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "get-test.txt",
					size: 2048,
					contentType: "text/plain",
				});

			const retrievedFile = await t
				.withIdentity(identity)
				.query(api.files.get, {
					fileId: idOf(uploadedFile, "uploadedFile"),
				});

			expect(retrievedFile).toEqual(uploadedFile);
		});

		test("Should_Require_Viewer_Role_For_Get", async () => {
			const t = convexTest(schema, modules);
			const ownerIdentity = createUniqueIdentity();
			const outsiderIdentity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(ownerIdentity)
				.mutation(api.workspaces.createShared, {
					name: "Private Workspace",
					slug: "private-get",
				});

			const file = await t
				.withIdentity(ownerIdentity)
				.mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "private.txt",
					size: 1024,
					contentType: "text/plain",
				});

			// Outsider should not be able to access
			await expect(
				t.withIdentity(outsiderIdentity).query(api.files.get, {
					fileId: idOf(file, "file"),
				}),
			).rejects.toThrow();
		});

		test("Should_Not_Return_Deleted_Files", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-deleted",
				});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "to-be-deleted.txt",
				size: 1024,
				contentType: "text/plain",
			});

			// Delete the file
			await t.withIdentity(identity).mutation(api.files.deleteFile, {
				fileId: idOf(file, "file"),
			});

			// Should not be accessible after deletion
			if (!file) throw new Error("File should exist");
			await expect(
				t.withIdentity(identity).query(api.files.get, {
					fileId: file._id,
				}),
			).rejects.toThrow("File not found");
		});

		test("Should_Handle_Nonexistent_File", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			// Create and delete a file to get a valid but nonexistent ID
			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-nonexistent",
				});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "temp-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			await t.withIdentity(identity).mutation(api.files.deleteFile, {
				fileId: idOf(file, "file"),
			});

			await expect(
				t.withIdentity(identity).query(api.files.get, {
					fileId: idOf(file, "file"),
				}),
			).rejects.toThrow("File not found");
		});
	});

	describe("File Listing", () => {
		test("Should_List_Workspace_Files", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-list",
				});

			// Upload multiple files
			const _file1 = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "file1.txt",
				size: 1024,
				contentType: "text/plain",
			});

			const _file2 = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "file2.pdf",
				size: 2048,
				contentType: "application/pdf",
			});

			const files = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
			});

			expect(files).toHaveLength(2);
			expect(files.map((f) => f.name).sort()).toEqual([
				"file1.txt",
				"file2.pdf",
			]);
		});

		test("Should_Filter_Files_By_Idea", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-list-idea",
				});

			const idea1 = await t.withIdentity(identity).mutation(api.ideas.create, {
				workspaceId: idOf(workspace, "workspace"),
				title: "Idea 1",
				contentMD: "First idea",
			});

			const idea2 = await t.withIdentity(identity).mutation(api.ideas.create, {
				workspaceId: idOf(workspace, "workspace"),
				title: "Idea 2",
				contentMD: "Second idea",
			});

			// Upload files to different ideas
			await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea1,
				name: "idea1-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea2,
				name: "idea2-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				// No ideaId - workspace general file
				name: "workspace-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			// Test filtering by idea1
			const idea1Files = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea1,
			});

			expect(idea1Files).toHaveLength(1);
			expect(idea1Files[0].name).toBe("idea1-file.txt");

			// Test filtering by idea2
			const idea2Files = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea2,
			});

			expect(idea2Files).toHaveLength(1);
			expect(idea2Files[0].name).toBe("idea2-file.txt");

			// Test all files (no idea filter)
			const allFiles = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
			});

			expect(allFiles).toHaveLength(3);
		});

		test("Should_Respect_Limit_Parameter", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-limit",
				});

			// Upload 5 files
			for (let i = 1; i <= 5; i++) {
				await t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: `file${i}.txt`,
					size: 1024,
					contentType: "text/plain",
				});
			}

			// Test limit
			const limitedFiles = await t
				.withIdentity(identity)
				.query(api.files.list, {
					workspaceId: idOf(workspace, "workspace"),
					limit: 3,
				});

			expect(limitedFiles).toHaveLength(3);

			// Test default limit (should get all 5)
			const allFiles = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
			});

			expect(allFiles).toHaveLength(5);
		});

		test("Should_Exclude_Deleted_Files_From_List", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-exclude-deleted",
				});

			const _file1 = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "active-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			const file2 = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "deleted-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			// Delete second file
			await t.withIdentity(identity).mutation(api.files.deleteFile, {
				fileId: idOf(file2, "file2"),
			});

			const files = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
			});

			expect(files).toHaveLength(1);
			expect(files[0].name).toBe("active-file.txt");
		});

		test("Should_Require_Viewer_Role_For_List", async () => {
			const t = convexTest(schema, modules);
			const ownerIdentity = createUniqueIdentity();
			const outsiderIdentity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(ownerIdentity)
				.mutation(api.workspaces.createShared, {
					name: "Private Workspace",
					slug: "private-list",
				});

			await expect(
				t.withIdentity(outsiderIdentity).query(api.files.list, {
					workspaceId: idOf(workspace, "workspace"),
				}),
			).rejects.toThrow();
		});
	});

	describe("File Deletion", () => {
		test("Should_Soft_Delete_File", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-delete",
				});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "to-delete.txt",
				size: 1024,
				contentType: "text/plain",
			});

			// Delete the file
			await t.withIdentity(identity).mutation(api.files.deleteFile, {
				fileId: idOf(file, "file"),
			});

			// File should no longer be accessible
			await expect(
				t.withIdentity(identity).query(api.files.get, {
					fileId: idOf(file, "file"),
				}),
			).rejects.toThrow("File not found");

			// File should not appear in lists
			const files = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
			});

			expect(files).toHaveLength(0);
		});

		test("Should_Require_Editor_Role_For_Delete", async () => {
			const t = convexTest(schema, modules);
			const ownerIdentity = createUniqueIdentity();
			const viewerIdentity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(ownerIdentity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-delete-permission",
				});

			const file = await t
				.withIdentity(ownerIdentity)
				.mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "protected-file.txt",
					size: 1024,
					contentType: "text/plain",
				});

			// Create viewer user directly
			const viewerId = await t.run(async (ctx) => {
				return await ctx.db.insert("users", {
					name: "Viewer User",
					email: "viewer@example.com",
					tokenIdentifier: viewerIdentity.tokenIdentifier,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			// Add viewer to workspace
			await t.run(async (ctx) => {
				await ctx.db.insert("workspaceMembers", {
					workspaceId: idOf(workspace, "workspace"),
					userId: viewerId,
					role: "viewer",
					createdAt: Date.now(),
				});
			});

			// Viewer should not be able to delete
			await expect(
				t.withIdentity(viewerIdentity).mutation(api.files.deleteFile, {
					fileId: idOf(file, "file"),
				}),
			).rejects.toThrow();
		});

		test("Should_Handle_Nonexistent_File_Delete", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-nonexistent-delete",
				});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "temp-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			// Delete it once
			await t.withIdentity(identity).mutation(api.files.deleteFile, {
				fileId: idOf(file, "file"),
			});

			// Try to delete again - since it's soft deleted, it can be deleted again
			// (soft delete just updates deletedAt timestamp)
			await expect(
				t.withIdentity(identity).mutation(api.files.deleteFile, {
					fileId: idOf(file, "file"),
				}),
			).resolves.not.toThrow();
		});
	});

	describe("Workspace Isolation", () => {
		test("Should_Isolate_Files_By_Workspace", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			// Create two workspaces
			const workspace1 = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Workspace 1",
					slug: "isolation-1",
				});

			const workspace2 = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Workspace 2",
					slug: "isolation-2",
				});

			// Upload files to each workspace
			await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace1, "workspace1"),
				name: "workspace1-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace2, "workspace2"),
				name: "workspace2-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			// Each workspace should only see its own files
			const workspace1Files = await t
				.withIdentity(identity)
				.query(api.files.list, {
					workspaceId: idOf(workspace1, "workspace1"),
				});

			const workspace2Files = await t
				.withIdentity(identity)
				.query(api.files.list, {
					workspaceId: idOf(workspace2, "workspace2"),
				});

			expect(workspace1Files).toHaveLength(1);
			expect(workspace1Files[0].name).toBe("workspace1-file.txt");

			expect(workspace2Files).toHaveLength(1);
			expect(workspace2Files[0].name).toBe("workspace2-file.txt");
		});

		test("Should_Generate_Workspace_Scoped_URLs", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-url-generation",
				});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "test file with spaces.txt",
				size: 1024,
				contentType: "text/plain",
			});

			expect(file?.url).toContain(idOf(workspace, "workspace"));
			expect(file?.url).toContain(idOf(file, "file"));
			expect(file?.url).toContain(
				encodeURIComponent("test file with spaces.txt"),
			);
			expect(file?.url).toMatch(/^\/files\//);
		});
	});

	describe("Event Logging", () => {
		test("Should_Log_File_Upload_Events", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-upload-events",
				});

			await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "event-test.txt",
				size: 2048,
				contentType: "text/plain",
			});

			// Check events table directly since activities might be a different aggregation
			const events = await t.run(async (ctx) => {
				try {
					return await ctx.db
						.query("events")
						.withIndex("by_workspace", (q) =>
							q.eq("workspaceId", idOf(workspace, "workspace")),
						)
						.collect();
				} catch (error) {
					console.error("Error querying events:", error);
					return [];
				}
			});

			const uploadEvent = events.find(
				(e: { type?: string }) => e.type === "file_uploaded",
			);
			expect(uploadEvent).toBeDefined();
			if (uploadEvent) {
				expect(uploadEvent?.type).toBe("file_uploaded");
			}
		});

		test("Should_Log_File_Deletion_Events", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-delete-events",
				});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				name: "delete-event-test.txt",
				size: 1024,
				contentType: "text/plain",
			});

			await t.withIdentity(identity).mutation(api.files.deleteFile, {
				fileId: idOf(file, "file"),
			});

			// Check events table directly
			const events = await t.run(async (ctx) => {
				try {
					return await ctx.db
						.query("events")
						.withIndex("by_workspace", (q) =>
							q.eq("workspaceId", idOf(workspace, "workspace")),
						)
						.collect();
				} catch (error) {
					console.error("Error querying events:", error);
					return [];
				}
			});

			const deleteEvent = events.find(
				(e: { type?: string }) => e.type === "file_deleted",
			);
			expect(deleteEvent).toBeDefined();
			if (deleteEvent) {
				expect(deleteEvent?.type).toBe("file_deleted");
			}
		});
	});

	describe("Integration with Ideas", () => {
		test("Should_Support_File_Attachments_To_Ideas", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-idea-integration",
				});

			const idea = await t.withIdentity(identity).mutation(api.ideas.create, {
				workspaceId: idOf(workspace, "workspace"),
				title: "Idea with Attachments",
				contentMD: "This idea has file attachments",
			});

			// Upload multiple files to the idea
			const _file1 = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea,
				name: "attachment1.pdf",
				size: 1024,
				contentType: "application/pdf",
			});

			const _file2 = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea,
				name: "attachment2.jpg",
				size: 2048,
				contentType: "image/jpeg",
			});

			// Retrieve files for the idea
			const ideaFiles = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea,
			});

			expect(ideaFiles).toHaveLength(2);
			expect(ideaFiles.every((f) => f.ideaId === idea)).toBe(true);
			expect(ideaFiles.map((f) => f.name).sort()).toEqual([
				"attachment1.pdf",
				"attachment2.jpg",
			]);
		});

		test("Should_Handle_File_Operations_After_Idea_Deletion", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-orphaned-files",
				});

			const idea = await t.withIdentity(identity).mutation(api.ideas.create, {
				workspaceId: idOf(workspace, "workspace"),
				title: "Temporary Idea",
				contentMD: "This idea will be deleted",
			});

			const file = await t.withIdentity(identity).mutation(api.files.upload, {
				workspaceId: idOf(workspace, "workspace"),
				ideaId: idea,
				name: "orphaned-file.txt",
				size: 1024,
				contentType: "text/plain",
			});

			// Delete the idea
			await t.withIdentity(identity).mutation(api.ideas.deleteIdea, {
				ideaId: idea,
			});

			// File should still exist and be accessible (orphaned files)
			const retrievedFile = await t
				.withIdentity(identity)
				.query(api.files.get, {
					fileId: idOf(file, "file"),
				});

			expect(retrievedFile).toBeDefined();
			expect(retrievedFile?.ideaId).toBe(idea); // Still references deleted idea

			// File should appear in workspace file list (no idea filter)
			const workspaceFiles = await t
				.withIdentity(identity)
				.query(api.files.list, {
					workspaceId: idOf(workspace, "workspace"),
				});

			expect(workspaceFiles).toHaveLength(1);
			expect(workspaceFiles[0]._id).toBe(idOf(file, "file"));
		});
	});

	describe("File Type and Size Handling", () => {
		test("Should_Handle_Various_Content_Types", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-content-types",
				});

			const testFiles = [
				{ name: "document.pdf", contentType: "application/pdf" },
				{ name: "image.png", contentType: "image/png" },
				{ name: "video.mp4", contentType: "video/mp4" },
				{ name: "text.txt", contentType: "text/plain" },
				{
					name: "presentation.pptx",
					contentType:
						"application/vnd.openxmlformats-officedocument.presentationml.presentation",
				},
			];

			for (const testFile of testFiles) {
				const file = await t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: testFile.name,
					size: 1024 * 10,
					contentType: testFile.contentType,
				});

				expect(file?.contentType).toBe(testFile.contentType);
				expect(file?.name).toBe(testFile.name);
			}

			const allFiles = await t.withIdentity(identity).query(api.files.list, {
				workspaceId: idOf(workspace, "workspace"),
			});

			expect(allFiles).toHaveLength(testFiles.length);
		});

		test("Should_Handle_Large_Files_Within_Limits", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-large-files",
				});

			// Test large file at the boundary (100MB exactly)
			const largeFile = await t
				.withIdentity(identity)
				.mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: "large-file.zip",
					size: 100 * 1024 * 1024, // Exactly 100MB
					contentType: "application/zip",
				});

			expect(largeFile?.size).toBe(100 * 1024 * 1024);
			expect(largeFile?.name).toBe("large-file.zip");
		});

		test("Should_Handle_Special_Characters_In_Filename", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-special-chars",
				});

			const specialNames = [
				"file with spaces.txt",
				"file-with-dashes.txt",
				"file_with_underscores.txt",
				"file (with parentheses).txt",
				"file [with brackets].txt",
				"file.multiple.dots.txt",
			];

			for (const fileName of specialNames) {
				const file = await t.withIdentity(identity).mutation(api.files.upload, {
					workspaceId: idOf(workspace, "workspace"),
					name: fileName,
					size: 1024,
					contentType: "text/plain",
				});

				expect(file?.name).toBe(fileName);
				expect(file?.url).toContain(encodeURIComponent(fileName));
			}
		});
	});
});
