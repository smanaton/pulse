/**
 * Integration Test - Convex Functions
 * Tests actual Convex functions against local instance
 * Real database operations with seeded test data
 */

import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { api } from "./_generated/api";
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
  name: "Test Workspace",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

const createTestIdea = (workspaceId: string, overrides = {}) => ({
  title: "Test Idea",
  content: "This is a test idea content",
  workspaceId,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe("Ideas Module - Convex Integration", () => {
  let t: ReturnType<typeof convexTest>;
  let userId: any;
  let workspaceId: any;

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
          content: "New test content",
          workspaceId,
        });

      // Assert
      const idea = await t.run(async (ctx) => {
        return await ctx.db.get(ideaId);
      });

      expect(idea).toMatchObject({
        title: "New Test Idea",
        content: "New test content",
        workspaceId,
      });
      expect(idea?.createdAt).toBeGreaterThan(0);
    });

    test("Given_UnauthorizedUser_When_CreatesIdea_Then_ThrowsError", async () => {
      // Act & Assert
      await expect(
        t.mutation(api.ideas.create, {
          title: "Unauthorized Idea",
          content: "Should not work",
          workspaceId,
        })
      ).rejects.toThrow("Authentication required");
    });

    test("Given_UserNotInWorkspace_When_CreatesIdea_Then_ThrowsError", async () => {
      // Arrange
      const otherWorkspaceId = await t.run(async (ctx) => {
        return await ctx.db.insert("workspaces", createTestWorkspace({
          name: "Other Workspace"
        }));
      });

      // Act & Assert
      await expect(
        t
          .withIdentity({ tokenIdentifier: "test|user123" })
          .mutation(api.ideas.create, {
            title: "Unauthorized Idea",
            content: "Should not work",
            workspaceId: otherWorkspaceId,
          })
      ).rejects.toThrow("Access denied");
    });

    test("Given_InvalidInput_When_CreatesIdea_Then_ValidatesAndThrows", async () => {
      // Act & Assert - Empty title
      await expect(
        t
          .withIdentity({ tokenIdentifier: "test|user123" })
          .mutation(api.ideas.create, {
            title: "",
            content: "Valid content",
            workspaceId,
          })
      ).rejects.toThrow("Title is required");

      // Act & Assert - Title too long
      const longTitle = "A".repeat(201);
      await expect(
        t
          .withIdentity({ tokenIdentifier: "test|user123" })
          .mutation(api.ideas.create, {
            title: longTitle,
            content: "Valid content",
            workspaceId,
          })
      ).rejects.toThrow("Title too long");
    });
  });

  describe("List Ideas", () => {
    test("Given_WorkspaceWithIdeas_When_Listed_Then_ReturnsIdeasInCorrectOrder", async () => {
      // Arrange - Create ideas with different timestamps
      const idea1Id = await t.run(async (ctx) => {
        return await ctx.db.insert("ideas", createTestIdea(workspaceId, {
          title: "Older Idea",
          createdAt: Date.now() - 1000,
        }));
      });

      const idea2Id = await t.run(async (ctx) => {
        return await ctx.db.insert("ideas", createTestIdea(workspaceId, {
          title: "Newer Idea", 
          createdAt: Date.now(),
        }));
      });

      // Act
      const ideas = await t
        .withIdentity({ tokenIdentifier: "test|user123" })
        .query(api.ideas.listByWorkspace, { workspaceId });

      // Assert
      expect(ideas).toHaveLength(2);
      expect(ideas[0].title).toBe("Newer Idea"); // Should be newest first
      expect(ideas[1].title).toBe("Older Idea");
    });

    test("Given_EmptyWorkspace_When_Listed_Then_ReturnsEmptyArray", async () => {
      // Act
      const ideas = await t
        .withIdentity({ tokenIdentifier: "test|user123" })
        .query(api.ideas.listByWorkspace, { workspaceId });

      // Assert
      expect(ideas).toEqual([]);
    });

    test("Given_UserNotInWorkspace_When_Listed_Then_ThrowsError", async () => {
      // Arrange
      const otherWorkspaceId = await t.run(async (ctx) => {
        return await ctx.db.insert("workspaces", createTestWorkspace({
          name: "Other Workspace"
        }));
      });

      // Act & Assert
      await expect(
        t
          .withIdentity({ tokenIdentifier: "test|user123" })
          .query(api.ideas.listByWorkspace, { workspaceId: otherWorkspaceId })
      ).rejects.toThrow("Access denied");
    });
  });

  describe("Update Idea", () => {
    let ideaId: any;

    beforeEach(async () => {
      ideaId = await t.run(async (ctx) => {
        return await ctx.db.insert("ideas", createTestIdea(workspaceId));
      });
    });

    test("Given_ValidUpdate_When_Updated_Then_ModifiesCorrectFields", async () => {
      // Act
      await t
        .withIdentity({ tokenIdentifier: "test|user123" })
        .mutation(api.ideas.update, {
          ideaId,
          updates: {
            title: "Updated Title",
            content: "Updated content",
          },
        });

      // Assert
      const updatedIdea = await t.run(async (ctx) => {
        return await ctx.db.get(ideaId);
      });

      expect(updatedIdea).toMatchObject({
        title: "Updated Title",
        content: "Updated content",
      });
      expect(updatedIdea?.updatedAt).toBeGreaterThan(updatedIdea?.createdAt || 0);
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
          updates: {
            title: "Only Title Updated",
          },
        });

      // Assert
      const updatedIdea = await t.run(async (ctx) => {
        return await ctx.db.get(ideaId);
      });

      expect(updatedIdea?.title).toBe("Only Title Updated");
      expect(updatedIdea?.content).toBe(originalIdea?.content); // Unchanged
    });
  });

  describe("Delete Idea", () => {
    let ideaId: any;

    beforeEach(async () => {
      ideaId = await t.run(async (ctx) => {
        return await ctx.db.insert("ideas", createTestIdea(workspaceId));
      });
    });

    test("Given_ExistingIdea_When_Deleted_Then_RemovedFromDatabase", async () => {
      // Act
      await t
        .withIdentity({ tokenIdentifier: "test|user123" })
        .mutation(api.ideas.delete, { ideaId });

      // Assert
      const deletedIdea = await t.run(async (ctx) => {
        return await ctx.db.get(ideaId);
      });

      expect(deletedIdea).toBeNull();
    });

    test("Given_NonExistentIdea_When_Deleted_Then_ThrowsError", async () => {
      // Arrange
      const fakeId = await t.run(async (ctx) => {
        const tempId = await ctx.db.insert("ideas", createTestIdea(workspaceId));
        await ctx.db.delete(tempId);
        return tempId;
      });

      // Act & Assert
      await expect(
        t
          .withIdentity({ tokenIdentifier: "test|user123" })
          .mutation(api.ideas.delete, { ideaId: fakeId })
      ).rejects.toThrow("Idea not found");
    });
  });
});