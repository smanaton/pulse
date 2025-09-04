/**
 * Convex Test Harness
 * Utilities for testing Convex functions with real database
 * Provides setup, teardown, and helper methods
 */

import { convexTest } from "convex-test";
import type { Id } from "@pulse/backend/convex/_generated/dataModel";
import schema from "@pulse/backend/convex/schema";
import { modules } from "@pulse/backend/convex/test.setup";

export type ConvexTestContext = ReturnType<typeof convexTest>;

/**
 * Creates a test context with authentication helper
 */
export const createTestContext = () => {
  const t = convexTest(schema, modules);

  return {
    t,
    // Helper for authenticated operations
    withAuth: (tokenIdentifier = "test|user123") =>
      t.withIdentity({ tokenIdentifier }),

    // Helper for running database operations
    run: t.run.bind(t),

    // Helper for cleanup
    reset: async () => {
      await t.run(async (ctx) => {
        // Define tables to clean up in dependency order
        const tables = [
          "ideas",
          "workspaceMembers", 
          "workspaces",
          "users",
        ] as const;

        // Delete all documents from each table
        for (const table of tables) {
          const docs = await ctx.db.query(table).collect();
          for (const doc of docs) {
            await ctx.db.delete(doc._id);
          }
        }
      });
    },

    // Helper for seeding test data
    seed: {
      user: async (userData: {
        name: string;
        email?: string;
        tokenIdentifier: string;
      }) => {
        return await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert("users", {
            name: userData.name,
            email: userData.email || `${userData.name.toLowerCase().replace(" ", "")}@test.com`,
            tokenIdentifier: userData.tokenIdentifier,
            createdAt: now,
            updatedAt: now,
          });
        });
      },

      workspace: async (workspaceData: {
        name: string;
        description?: string;
      }) => {
        return await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert("workspaces", {
            name: workspaceData.name,
            description: workspaceData.description,
            createdAt: now,
            updatedAt: now,
          });
        });
      },

      workspaceMember: async (memberData: {
        workspaceId: Id<"workspaces">;
        userId: Id<"users">;
        role: "admin" | "member" | "viewer";
      }) => {
        return await t.run(async (ctx) => {
          return await ctx.db.insert("workspaceMembers", {
            workspaceId: memberData.workspaceId,
            userId: memberData.userId,
            role: memberData.role,
            createdAt: Date.now(),
          });
        });
      },

      idea: async (ideaData: {
        title: string;
        content: string;
        workspaceId: Id<"workspaces">;
        tags?: string[];
        priority?: "low" | "medium" | "high";
      }) => {
        return await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert("ideas", {
            title: ideaData.title,
            content: ideaData.content,
            workspaceId: ideaData.workspaceId,
            tags: ideaData.tags,
            priority: ideaData.priority,
            createdAt: now,
            updatedAt: now,
          });
        });
      },
    },

    // Helper for common test scenarios
    scenarios: {
      // Creates a workspace with an admin user
      workspaceWithAdmin: async (
        workspaceName = "Test Workspace",
        tokenIdentifier = "test|admin123"
      ) => {
        const userId = await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert("users", {
            name: "Admin User",
            email: "admin@test.com",
            tokenIdentifier,
            createdAt: now,
            updatedAt: now,
          });
        });

        const workspaceId = await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert("workspaces", {
            name: workspaceName,
            createdAt: now,
            updatedAt: now,
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert("workspaceMembers", {
            workspaceId,
            userId,
            role: "admin",
            createdAt: Date.now(),
          });
        });

        return { userId, workspaceId, tokenIdentifier };
      },

      // Creates a workspace with multiple ideas
      workspaceWithIdeas: async (ideaCount = 3) => {
        const { userId, workspaceId, tokenIdentifier } = await createTestContext().scenarios.workspaceWithAdmin();

        const ideaIds = [];
        for (let i = 0; i < ideaCount; i++) {
          const ideaId = await t.run(async (ctx) => {
            const now = Date.now();
            return await ctx.db.insert("ideas", {
              title: `Test Idea ${i + 1}`,
              content: `Content for test idea ${i + 1}`,
              workspaceId,
              createdAt: now - (ideaCount - i) * 1000, // Different timestamps
              updatedAt: now,
            });
          });
          ideaIds.push(ideaId);
        }

        return { userId, workspaceId, tokenIdentifier, ideaIds };
      },

      // Creates a workspace with team members
      workspaceWithTeam: async () => {
        const adminTokenId = "test|admin123";
        const memberTokenId = "test|member123";
        const viewerTokenId = "test|viewer123";

        // Create workspace and admin
        const { workspaceId } = await createTestContext().scenarios.workspaceWithAdmin("Team Workspace", adminTokenId);

        // Create member user
        const memberId = await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert("users", {
            name: "Member User",
            email: "member@test.com",
            tokenIdentifier: memberTokenId,
            createdAt: now,
            updatedAt: now,
          });
        });

        // Create viewer user
        const viewerId = await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert("users", {
            name: "Viewer User",
            email: "viewer@test.com",
            tokenIdentifier: viewerTokenId,
            createdAt: now,
            updatedAt: now,
          });
        });

        // Add member and viewer to workspace
        await t.run(async (ctx) => {
          await ctx.db.insert("workspaceMembers", {
            workspaceId,
            userId: memberId,
            role: "member",
            createdAt: Date.now(),
          });

          await ctx.db.insert("workspaceMembers", {
            workspaceId,
            userId: viewerId,
            role: "viewer",
            createdAt: Date.now(),
          });
        });

        return {
          workspaceId,
          users: {
            admin: { id: "", tokenIdentifier: adminTokenId },
            member: { id: memberId, tokenIdentifier: memberTokenId },
            viewer: { id: viewerId, tokenIdentifier: viewerTokenId },
          },
        };
      },
    },

    // Helper for assertions
    expect: {
      // Check if user exists in workspace
      userInWorkspace: async (userId: Id<"users">, workspaceId: Id<"workspaces">) => {
        const membership = await t.run(async (ctx) => {
          return await ctx.db
            .query("workspaceMembers")
            .withIndex("by_workspace_user", (q: any) => 
              q.eq("workspaceId", workspaceId).eq("userId", userId)
            )
            .unique();
        });
        return membership !== null;
      },

      // Check if idea belongs to workspace
      ideaInWorkspace: async (ideaId: Id<"ideas">, workspaceId: Id<"workspaces">) => {
        const idea = await t.run(async (ctx) => {
          return await ctx.db.get(ideaId);
        });
        return idea?.workspaceId === workspaceId;
      },

      // Count documents in table
      countInTable: async (table: "users" | "workspaces" | "ideas" | "workspaceMembers") => {
        const docs = await t.run(async (ctx) => {
          return await ctx.db.query(table).collect();
        });
        return docs.length;
      },
    },
  };
};

/**
 * Test setup utilities
 */
export const ConvexTestUtils = {
  /**
   * Creates a fresh test context for each test
   */
  createContext: createTestContext,

  /**
   * Creates a context with pre-seeded data
   */
  createContextWithData: async () => {
    const context = createTestContext();
    const { userId, workspaceId, tokenIdentifier } = await context.scenarios.workspaceWithAdmin();
    
    return {
      ...context,
      testData: {
        userId,
        workspaceId,
        tokenIdentifier,
      },
    };
  },

  /**
   * Helper to measure test performance
   */
  measureTime: async <T>(
    operation: () => Promise<T>,
    label = "Operation"
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      console.warn(`${label} took ${duration.toFixed(2)}ms (slow)`);
    }
    
    return { result, duration };
  },

  /**
   * Helper to create test identity
   */
  createIdentity: (
    tokenIdentifier = "test|user123",
    overrides?: { name?: string; email?: string }
  ) => ({
    tokenIdentifier,
    name: overrides?.name || "Test User",
    email: overrides?.email || "test@example.com",
  }),
};

// Export types for external use
export type TestContext = ReturnType<typeof createTestContext>;
export type TestIdentity = ReturnType<typeof ConvexTestUtils.createIdentity>;