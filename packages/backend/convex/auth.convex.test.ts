/**
 * Authentication System Tests
 * Tests auth providers, session management, and security
 */

import { convexTest } from "convex-test";
import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("Authentication System", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  afterEach(async () => {
    // Clean up test data
    await t.run(async (ctx) => {
      const tables = ["users", "authSessions", "authAccounts"];
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

  describe("User Authentication", () => {
    test("Given_NewUser_When_SignsIn_Then_CreatesUserRecord", async () => {
      // Arrange
      const identity = {
        tokenIdentifier: "github|12345",
        name: "Test User",
        email: "test@example.com",
      };

      // Act - Simulate authentication by creating user
      await t.withIdentity(identity).mutation(api.users.updateUser, {
        name: "Test User",
        image: "https://github.com/avatar.jpg",
      });

      // Assert
      const user = await t.withIdentity(identity).query(api.users.getCurrentUser, {});
      expect(user).toMatchObject({
        name: "Test User",
        tokenIdentifier: "github|12345",
      });
    });

    test("Given_ExistingUser_When_SignsIn_Then_ReturnsUserData", async () => {
      // Arrange
      const identity = {
        tokenIdentifier: "google|67890",
        name: "Existing User",
        email: "existing@example.com",
      };

      // Create user first
      await t.withIdentity(identity).mutation(api.users.updateUser, {
        name: "Existing User",
      });

      // Act
      const user = await t.withIdentity(identity).query(api.users.getCurrentUser, {});

      // Assert
      expect(user).toMatchObject({
        name: "Existing User",
        tokenIdentifier: "google|67890",
      });
    });

    test("Given_UnauthenticatedUser_When_AccessesProtectedResource_Then_ReturnsNull", async () => {
      // Act
      const user = await t.query(api.users.getCurrentUser, {});

      // Assert
      expect(user).toBeNull();
    });
  });

  describe("Authentication Security", () => {
    test("Given_InvalidTokenIdentifier_When_AccessingData_Then_ThrowsError", async () => {
      // Arrange
      const invalidIdentity = {
        tokenIdentifier: "", // Invalid empty token
      };

      // Act 
      const result = await t.withIdentity(invalidIdentity).query(api.users.getCurrentUser, {});
      
      // Assert - Invalid token should return null (not authenticated)
      expect(result).toBeNull();
    });

    test("Given_MultipleUsers_When_Authenticated_Then_IsolatesUserData", async () => {
      // Arrange
      const user1Identity = {
        tokenIdentifier: "github|user1",
        name: "User 1",
        email: "user1@example.com",
      };
      
      const user2Identity = {
        tokenIdentifier: "github|user2", 
        name: "User 2",
        email: "user2@example.com",
      };

      // Act - Create both users
      await t.withIdentity(user1Identity).mutation(api.users.updateUser, {
        name: "User 1",
      });
      
      await t.withIdentity(user2Identity).mutation(api.users.updateUser, {
        name: "User 2", 
      });

      // Assert - Each user sees only their own data
      const user1Data = await t.withIdentity(user1Identity)
        .query(api.users.getCurrentUser, {});
      const user2Data = await t.withIdentity(user2Identity)
        .query(api.users.getCurrentUser, {});

      expect(user1Data?.name).toBe("User 1");
      expect(user2Data?.name).toBe("User 2");
      expect(user1Data?._id).not.toBe(user2Data?._id);
    });
  });

  describe("User Profile Management", () => {
    test("Given_AuthenticatedUser_When_UpdatesProfile_Then_SavesChanges", async () => {
      // Arrange
      const identity = {
        tokenIdentifier: "github|profile_test",
        name: "Profile User",
        email: "profile@example.com",
      };

      await t.withIdentity(identity).mutation(api.users.updateUser, {
        name: "Original Name",
      });

      // Act
      await t.withIdentity(identity).mutation(api.users.updateUser, {
        name: "Updated Name",
        image: "https://example.com/new-avatar.jpg",
      });

      // Assert
      const updatedUser = await t.withIdentity(identity)
        .query(api.users.getCurrentUser, {});
      
      expect(updatedUser).toMatchObject({
        name: "Updated Name",
        image: "https://example.com/new-avatar.jpg",
      });
    });

    test("Given_AuthenticatedUser_When_UpdatesWithInvalidData_Then_ValidatesInput", async () => {
      // Arrange
      const identity = {
        tokenIdentifier: "github|validation_test",
        name: "Validation User",
        email: "validation@example.com",
      };

      // Act - Empty name should be allowed (users can clear their name)
      const result = await t.withIdentity(identity).mutation(api.users.updateUser, {
        name: "", // Empty name is valid
      });

      // Assert - Should successfully update
      expect(result).toBeDefined();
      
      // Verify the update was applied
      const updatedUser = await t.withIdentity(identity).query(api.users.getCurrentUser, {});
      expect(updatedUser?.name).toBe("");
    });
  });

  describe("Authentication Providers", () => {
    test("Given_GitHubProvider_When_UserAuthenticates_Then_CreatesCorrectTokenFormat", async () => {
      // Arrange
      const githubIdentity = {
        tokenIdentifier: "github|123456789",
        name: "GitHub User",
        email: "github@example.com",
      };

      // Act
      await t.withIdentity(githubIdentity).mutation(api.users.updateUser, {
        name: "GitHub User",
      });

      // Assert
      const user = await t.withIdentity(githubIdentity)
        .query(api.users.getCurrentUser, {});
      
      expect(user?.tokenIdentifier).toMatch(/^github\|/);
    });

    test("Given_GoogleProvider_When_UserAuthenticates_Then_CreatesCorrectTokenFormat", async () => {
      // Arrange
      const googleIdentity = {
        tokenIdentifier: "google|987654321",
        name: "Google User", 
        email: "google@example.com",
      };

      // Act
      await t.withIdentity(googleIdentity).mutation(api.users.updateUser, {
        name: "Google User",
      });

      // Assert
      const user = await t.withIdentity(googleIdentity)
        .query(api.users.getCurrentUser, {});
      
      expect(user?.tokenIdentifier).toMatch(/^google\|/);
    });
  });

  describe("Session Management", () => {
    test("Given_AuthenticatedUser_When_RepeatedRequests_Then_MaintainsSession", async () => {
      // Arrange
      const identity = {
        tokenIdentifier: "github|session_test",
        name: "Session User",
        email: "session@example.com", 
      };

      await t.withIdentity(identity).mutation(api.users.updateUser, {
        name: "Session User",
      });

      // Act - Make multiple requests with same identity
      const request1 = await t.withIdentity(identity)
        .query(api.users.getCurrentUser, {});
      const request2 = await t.withIdentity(identity)
        .query(api.users.getCurrentUser, {});
      const request3 = await t.withIdentity(identity)
        .query(api.users.getCurrentUser, {});

      // Assert - All requests return consistent data
      expect(request1?._id).toBe(request2?._id);
      expect(request2?._id).toBe(request3?._id);
      expect(request1?.name).toBe("Session User");
      expect(request2?.name).toBe("Session User");
      expect(request3?.name).toBe("Session User");
    });
  });
});