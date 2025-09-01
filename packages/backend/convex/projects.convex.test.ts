/**
 * Projects System Tests
 * Tests project creation, management, member operations, and statistics
 */

import { convexTest } from "convex-test";
import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("Projects System", () => {
  let t: ReturnType<typeof convexTest>;
  let adminUserId: any;
  let editorUserId: any;
  let viewerUserId: any;
  let workspaceId: any;
  let clientId: any;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    // Setup test users
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

    editorUserId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("users", {
        name: "Editor User",
        email: "editor@test.com",
        tokenIdentifier: "test|editor123",
        createdAt: now,
        updatedAt: now,
      });
    });

    viewerUserId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("users", {
        name: "Viewer User",
        email: "viewer@test.com",
        tokenIdentifier: "test|viewer123",
        createdAt: now,
        updatedAt: now,
      });
    });

    // Setup test workspace
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

    // Setup workspace memberships
    await t.run(async (ctx) => {
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: adminUserId,
        role: "admin",
        createdAt: Date.now(),
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: editorUserId,
        role: "editor",
        createdAt: Date.now(),
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: viewerUserId,
        role: "viewer",
        createdAt: Date.now(),
      });
    });

    // Setup test client
    clientId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("clients", {
        workspaceId,
        name: "Test Client",
        email: "client@test.com",
        phone: "+1234567890",
        website: "https://testclient.com",
        status: "active",
        address: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zip: "12345",
          country: "Test Country",
        },
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  afterEach(async () => {
    await t.run(async (ctx) => {
      const tables = [
        "projectMembers", "projectClients", "projects", "clients", 
        "workspaceMembers", "workspaces", "users", "events", "tasks", "taskComments"
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

  describe("Project Creation", () => {
    test("Given_EditorUser_When_CreatesProject_Then_CreatesProjectWithCorrectFields", async () => {
      const result = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Test Project",
          description: "A test project",
          priority: "high",
          startDate: Date.now(),
          endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          clientId,
          tags: ["tag1", "tag2"],
          color: "#ff0000",
          budget: 10000,
          estimatedHours: 100,
        });

      expect(result).toBeDefined();

      const project = await t.run(async (ctx) => {
        return await ctx.db.get(result);
      });

      expect(project).toMatchObject({
        workspaceId,
        name: "Test Project",
        description: "A test project",
        status: "active",
        priority: "high",
        ownerId: editorUserId,
        clientId,
        tags: ["tag1", "tag2"],
        color: "#ff0000",
        budget: 10000,
        estimatedHours: 100,
        actualHours: 0,
        progress: 0,
        isTemplate: false,
        sortKey: 1,
        createdBy: editorUserId,
      });
    });

    test("Given_AdminUser_When_CreatesProjectWithOwner_Then_SetsSpecifiedOwner", async () => {
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Admin Project",
          ownerId: viewerUserId,
        });

      const project = await t.run(async (ctx) => {
        return await ctx.db.get(result);
      });

      expect(project?.ownerId).toBe(viewerUserId);

      // Check that owner was added as project member
      const members = await t.run(async (ctx) => {
        return await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", result))
          .collect();
      });

      expect(members).toHaveLength(1);
      expect(members[0]).toMatchObject({
        userId: viewerUserId,
        role: "owner",
        canEditTasks: true,
        canManageMembers: true,
      });
    });

    test("Given_EditorUser_When_CreatesTemplate_Then_SetsTemplateFlag", async () => {
      const result = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Project Template",
          isTemplate: true,
        });

      const project = await t.run(async (ctx) => {
        return await ctx.db.get(result);
      });

      expect(project?.isTemplate).toBe(true);
    });

    test("Given_EmptyName_When_CreatesProject_Then_ThrowsValidationError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.create, {
            workspaceId,
            name: "   ",
          })
      ).rejects.toThrow("Project name is required");
    });

    test("Given_InvalidDateRange_When_CreatesProject_Then_ThrowsValidationError", async () => {
      const startDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      const endDate = Date.now();

      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.create, {
            workspaceId,
            name: "Invalid Date Project",
            startDate,
            endDate,
          })
      ).rejects.toThrow("Start date must be before end date");
    });

    test("Given_InvalidClient_When_CreatesProject_Then_ThrowsValidationError", async () => {
      const fakeClientId = await t.run(async (ctx) => {
        const now = Date.now();
        const tempId = await ctx.db.insert("clients", {
          workspaceId,
          name: "Temp",
          status: "active",
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.delete(tempId);
        return tempId;
      });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.create, {
            workspaceId,
            name: "Invalid Client Project",
            clientId: fakeClientId,
          })
      ).rejects.toThrow("Client not found or not in workspace");
    });

    test("Given_ViewerUser_When_CreatesProject_Then_ThrowsPermissionError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|viewer123" })
          .mutation(api.projects.create, {
            workspaceId,
            name: "Unauthorized Project",
          })
      ).rejects.toThrow();
    });

    test("Given_MultipleProjects_When_Created_Then_AssignsSortKeysCorrectly", async () => {
      const project1 = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "First Project",
        });

      const project2 = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Second Project",
        });

      const projects = await t.run(async (ctx) => {
        return await Promise.all([
          ctx.db.get(project1),
          ctx.db.get(project2),
        ]);
      });

      expect(projects[0]?.sortKey).toBe(1);
      expect(projects[1]?.sortKey).toBe(2);
    });
  });

  describe("Project Retrieval", () => {
    let projectId: any;

    beforeEach(async () => {
      projectId = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Retrieval Test Project",
          description: "For testing retrieval",
        });
    });

    test("Given_ValidProjectId_When_GetsCalled_Then_ReturnsProject", async () => {
      const result = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.get, {
          workspaceId,
          projectId,
        });

      expect(result).toMatchObject({
        name: "Retrieval Test Project",
        description: "For testing retrieval",
        workspaceId,
      });
    });

    test("Given_NonExistentProject_When_GetsCalled_Then_ReturnsNull", async () => {
      const fakeId = await t.run(async (ctx) => {
        const now = Date.now();
        const tempId = await ctx.db.insert("projects", {
          workspaceId,
          name: "Temp",
          status: "active",
          priority: "medium",
          ownerId: adminUserId,
          sortKey: 999,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.delete(tempId);
        return tempId;
      });

      const result = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.get, {
          workspaceId,
          projectId: fakeId,
        });

      expect(result).toBeNull();
    });

    test("Given_DeletedProject_When_GetsCalled_Then_ReturnsNull", async () => {
      await t.run(async (ctx) => {
        await ctx.db.patch(projectId, {
          deletedAt: Date.now(),
        });
      });

      const result = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.get, {
          workspaceId,
          projectId,
        });

      expect(result).toBeNull();
    });

    test("Given_ProjectFromDifferentWorkspace_When_GetsCalled_Then_ThrowsError", async () => {
      const otherWorkspaceId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("workspaces", {
          name: "Other Workspace",
          type: "shared",
          isPersonal: false,
          plan: "free",
          createdAt: now,
          updatedAt: now,
        });
      });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|viewer123" })
          .query(api.projects.get, {
            workspaceId: otherWorkspaceId,
            projectId,
          })
      ).rejects.toThrow("Not a workspace member");
    });
  });

  describe("Project Listing", () => {
    let activeProjectId: any;
    let completedProjectId: any;
    let onHoldProjectId: any;

    beforeEach(async () => {
      activeProjectId = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Active Project",
        });

      completedProjectId = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Completed Project",
        });

      onHoldProjectId = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "On Hold Project",
        });

      // Update statuses
      await t.run(async (ctx) => {
        await ctx.db.patch(completedProjectId, { status: "completed" });
        await ctx.db.patch(onHoldProjectId, { status: "on_hold" });
      });
    });

    test("Given_ProjectsInWorkspace_When_ListsCalled_Then_ReturnsAllActiveProjects", async () => {
      const result = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.list, {
          workspaceId,
        });

      expect(result).toHaveLength(3);
      expect(result.map(p => p.name)).toContain("Active Project");
      expect(result.map(p => p.name)).toContain("Completed Project");
      expect(result.map(p => p.name)).toContain("On Hold Project");
    });

    test("Given_StatusFilter_When_ListsCalled_Then_ReturnsFilteredProjects", async () => {
      const result = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.list, {
          workspaceId,
          status: "completed",
        });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Completed Project");
    });

    test("Given_DeletedProject_When_ListsCalled_Then_ExcludesDeletedProjects", async () => {
      await t.run(async (ctx) => {
        await ctx.db.patch(activeProjectId, { deletedAt: Date.now() });
      });

      const result = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.list, {
          workspaceId,
        });

      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).not.toContain("Active Project");
    });

    test("Given_ProjectsWithSortKeys_When_ListsCalled_Then_ReturnsInCorrectOrder", async () => {
      const result = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.list, {
          workspaceId,
        });

      expect(result[0].name).toBe("Active Project");
      expect(result[1].name).toBe("Completed Project");
      expect(result[2].name).toBe("On Hold Project");
    });
  });

  describe("Project Updates", () => {
    let projectId: any;

    beforeEach(async () => {
      projectId = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Update Test Project",
          description: "Original description",
          priority: "medium",
        });
    });

    test("Given_ValidUpdates_When_UpdateCalled_Then_UpdatesFieldsCorrectly", async () => {
      const updatedProject = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.update, {
          projectId,
          name: "Updated Project Name",
          description: "Updated description",
          priority: "high",
          progress: 50,
        });

      expect(updatedProject).toMatchObject({
        name: "Updated Project Name",
        description: "Updated description",
        priority: "high",
        progress: 50,
      });
    });

    test("Given_StatusCompleted_When_UpdateCalled_Then_SetsProgressTo100", async () => {
      const updatedProject = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.update, {
          projectId,
          status: "completed",
        });

      expect(updatedProject?.progress).toBe(100);
    });

    test("Given_ProgressOutOfRange_When_UpdateCalled_Then_ClampsProgress", async () => {
      const updatedProject1 = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.update, {
          projectId,
          progress: -10,
        });

      expect(updatedProject1?.progress).toBe(0);

      const updatedProject2 = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.update, {
          projectId,
          progress: 150,
        });

      expect(updatedProject2?.progress).toBe(100);
    });

    test("Given_EmptyName_When_UpdateCalled_Then_ThrowsValidationError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.update, {
            projectId,
            name: "   ",
          })
      ).rejects.toThrow("Project name cannot be empty");
    });

    test("Given_InvalidDateRange_When_UpdateCalled_Then_ThrowsValidationError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.update, {
            projectId,
            startDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            endDate: Date.now(),
          })
      ).rejects.toThrow("Start date must be before end date");
    });

    test("Given_ViewerUser_When_UpdateCalled_Then_ThrowsPermissionError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|viewer123" })
          .mutation(api.projects.update, {
            projectId,
            name: "Unauthorized Update",
          })
      ).rejects.toThrow();
    });

    test("Given_NonExistentProject_When_UpdateCalled_Then_ThrowsNotFoundError", async () => {
      const fakeId = await t.run(async (ctx) => {
        const now = Date.now();
        const tempId = await ctx.db.insert("projects", {
          workspaceId,
          name: "Temp",
          status: "active",
          priority: "medium",
          ownerId: adminUserId,
          sortKey: 999,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.delete(tempId);
        return tempId;
      });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.update, {
            projectId: fakeId,
            name: "Non-existent Update",
          })
      ).rejects.toThrow("Project not found");
    });
  });

  describe("Project Deletion", () => {
    let projectId: any;

    beforeEach(async () => {
      projectId = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Delete Test Project",
        });
    });

    test("Given_AdminUser_When_DeleteCalled_Then_SoftDeletesProject", async () => {
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.deleteProject, {
          projectId,
        });

      const project = await t.run(async (ctx) => {
        return await ctx.db.get(projectId);
      });

      expect(project?.deletedAt).toBeDefined();
      expect(project?.deletedAt).toBeGreaterThan(0);
    });

    test("Given_EditorUser_When_DeleteCalled_Then_ThrowsPermissionError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.deleteProject, {
            projectId,
          })
      ).rejects.toThrow();
    });

    test("Given_NonExistentProject_When_DeleteCalled_Then_ThrowsNotFoundError", async () => {
      const fakeId = await t.run(async (ctx) => {
        const now = Date.now();
        const tempId = await ctx.db.insert("projects", {
          workspaceId,
          name: "Temp",
          status: "active",
          priority: "medium",
          ownerId: adminUserId,
          sortKey: 999,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.delete(tempId);
        return tempId;
      });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api.projects.deleteProject, {
            projectId: fakeId,
          })
      ).rejects.toThrow("Project not found");
    });
  });

  describe("Project Reordering", () => {
    let project1Id: any;
    let project2Id: any;
    let project3Id: any;

    beforeEach(async () => {
      project1Id = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Project 1",
        });

      project2Id = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Project 2",
        });

      project3Id = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Project 3",
        });
    });

    test("Given_ValidProjectOrder_When_ReorderCalled_Then_UpdatesSortKeys", async () => {
      await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.reorder, {
          workspaceId,
          projectIds: [project3Id, project1Id, project2Id],
        });

      const projects = await t.run(async (ctx) => {
        return await Promise.all([
          ctx.db.get(project1Id),
          ctx.db.get(project2Id),
          ctx.db.get(project3Id),
        ]);
      });

      expect(projects[2]?.sortKey).toBe(1); // project3
      expect(projects[0]?.sortKey).toBe(2); // project1
      expect(projects[1]?.sortKey).toBe(3); // project2
    });

    test("Given_InvalidProjectId_When_ReorderCalled_Then_ThrowsValidationError", async () => {
      const fakeId = await t.run(async (ctx) => {
        const now = Date.now();
        const tempId = await ctx.db.insert("projects", {
          workspaceId,
          name: "Temp",
          status: "active",
          priority: "medium",
          ownerId: adminUserId,
          sortKey: 999,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.delete(tempId);
        return tempId;
      });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|editor123" })
          .mutation(api.projects.reorder, {
            workspaceId,
            projectIds: [project1Id, fakeId, project2Id],
          })
      ).rejects.toThrow("Invalid project ID or project not in workspace");
    });

    test("Given_ViewerUser_When_ReorderCalled_Then_ThrowsPermissionError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|viewer123" })
          .mutation(api.projects.reorder, {
            workspaceId,
            projectIds: [project1Id, project2Id, project3Id],
          })
      ).rejects.toThrow();
    });
  });

  describe("Project Member Management", () => {
    let projectId: any;

    beforeEach(async () => {
      projectId = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Member Test Project",
        });
    });

    test("Given_ProjectOwner_When_AddsMember_Then_AddsSuccessfully", async () => {
      const memberId = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.addMember, {
          projectId,
          userId: editorUserId,
          role: "member",
          canEditTasks: true,
          canManageMembers: false,
        });

      expect(memberId).toBeDefined();

      const members = await t.run(async (ctx) => {
        return await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .collect();
      });

      expect(members).toHaveLength(2); // Owner + new member
      const newMember = members.find(m => m.userId === editorUserId);
      expect(newMember).toMatchObject({
        role: "member",
        canEditTasks: true,
        canManageMembers: false,
      });
    });

    test("Given_ExistingMember_When_AddsSameMember_Then_ThrowsConflictError", async () => {
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.addMember, {
          projectId,
          userId: editorUserId,
          role: "member",
        });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api.projects.addMember, {
            projectId,
            userId: editorUserId,
            role: "manager",
          })
      ).rejects.toThrow("User is already a project member");
    });

    test("Given_NonWorkspaceMember_When_AddsMember_Then_ThrowsForbiddenError", async () => {
      const outsideUserId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          name: "Outside User",
          email: "outside@test.com",
          tokenIdentifier: "test|outside123",
          createdAt: now,
          updatedAt: now,
        });
      });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api.projects.addMember, {
            projectId,
            userId: outsideUserId,
            role: "member",
          })
      ).rejects.toThrow("User is not a workspace member");
    });

    test("Given_ProjectMember_When_UpdatesRole_Then_UpdatesSuccessfully", async () => {
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.addMember, {
          projectId,
          userId: editorUserId,
          role: "member",
        });

      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.updateMember, {
          projectId,
          userId: editorUserId,
          role: "manager",
          canManageMembers: true,
        });

      const member = await t.run(async (ctx) => {
        return await ctx.db
          .query("projectMembers")
          .withIndex("by_project_user", (q) =>
            q.eq("projectId", projectId).eq("userId", editorUserId)
          )
          .first();
      });

      expect(member).toMatchObject({
        role: "manager",
        canManageMembers: true,
      });
    });

    test("Given_ProjectMember_When_RemovesMember_Then_RemovesSuccessfully", async () => {
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.addMember, {
          projectId,
          userId: editorUserId,
          role: "member",
        });

      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.removeMember, {
          projectId,
          userId: editorUserId,
        });

      const member = await t.run(async (ctx) => {
        return await ctx.db
          .query("projectMembers")
          .withIndex("by_project_user", (q) =>
            q.eq("projectId", projectId).eq("userId", editorUserId)
          )
          .first();
      });

      expect(member).toBeNull();
    });

    test("Given_ProjectOwner_When_RemovesOwner_Then_ThrowsForbiddenError", async () => {
      await expect(
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api.projects.removeMember, {
            projectId,
            userId: adminUserId, // Try to remove owner
          })
      ).rejects.toThrow("Cannot remove project owner");
    });

    test("Given_ProjectMembers_When_ListsCalled_Then_ReturnsEnrichedMembers", async () => {
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.addMember, {
          projectId,
          userId: editorUserId,
          role: "member",
        });

      const members = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.listMembers, {
          workspaceId,
          projectId,
        });

      expect(members).toHaveLength(2);
      
      const ownerMember = members.find(m => m.role === "owner");
      expect(ownerMember?.user).toMatchObject({
        name: "Admin User",
        email: "admin@test.com",
      });

      const regularMember = members.find(m => m.role === "member");
      expect(regularMember?.user).toMatchObject({
        name: "Editor User",
        email: "editor@test.com",
      });
    });
  });

  describe("Project Statistics", () => {
    let projectId: any;

    beforeEach(async () => {
      projectId = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Stats Test Project",
          estimatedHours: 100,
        });

      // Add some tasks for statistics
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("tasks", {
          workspaceId,
          projectId,
          name: "Completed Task",
          status: "done",
          priority: "medium",
          reporterId: adminUserId,
          position: 1,
          sortKey: 1,
          estimatedHours: 10,
          actualHours: 12,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.insert("tasks", {
          workspaceId,
          projectId,
          name: "In Progress Task",
          status: "in_progress",
          priority: "medium",
          reporterId: adminUserId,
          position: 2,
          sortKey: 2,
          estimatedHours: 20,
          actualHours: 15,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.insert("tasks", {
          workspaceId,
          projectId,
          name: "Todo Task",
          status: "todo",
          priority: "medium",
          reporterId: adminUserId,
          position: 3,
          sortKey: 3,
          estimatedHours: 15,
          actualHours: 0,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.insert("tasks", {
          workspaceId,
          projectId,
          name: "Overdue Task",
          status: "todo",
          priority: "medium",
          reporterId: adminUserId,
          position: 4,
          sortKey: 4,
          dueDate: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
          estimatedHours: 5,
          actualHours: 0,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });
      });
    });

    test("Given_ProjectWithTasks_When_GetStatsCalledForProject_Then_ReturnsDetailedStats", async () => {
      const stats = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.getStats, {
          workspaceId,
          projectId,
        });

      expect(stats.project.name).toBe("Stats Test Project");
      expect(stats.tasks).toMatchObject({
        total: 4,
        completed: 1,
        inProgress: 1,
        todo: 2,
        overdue: 1,
      });
      expect(stats.members).toBe(1); // Only owner
      expect(stats.timeTracking).toMatchObject({
        estimatedHours: 50, // 10 + 20 + 15 + 5
        actualHours: 27, // 12 + 15 + 0 + 0
        efficiency: expect.any(Number),
      });
      expect(stats.progress).toBe(0);
    });

    test("Given_MultipleProjects_When_GetStatsCalledForWorkspace_Then_ReturnsWorkspaceStats", async () => {
      // Create additional projects
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Completed Project",
        });

      await t.run(async (ctx) => {
        const completedProject = await ctx.db
          .query("projects")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .filter((q) => q.eq(q.field("name"), "Completed Project"))
          .first();

        if (completedProject) {
          await ctx.db.patch(completedProject._id, { status: "completed" });
        }
      });

      const stats = await t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .query(api.projects.getStats, {
          workspaceId,
        });

      expect(stats.projects).toMatchObject({
        total: 2,
        active: 1,
        completed: 1,
        onHold: 0,
        overdue: 0,
      });
    });

    test("Given_NonExistentProject_When_GetStatsCalledForProject_Then_ThrowsNotFoundError", async () => {
      const fakeId = await t.run(async (ctx) => {
        const now = Date.now();
        const tempId = await ctx.db.insert("projects", {
          workspaceId,
          name: "Temp",
          status: "active",
          priority: "medium",
          ownerId: adminUserId,
          sortKey: 999,
          createdBy: adminUserId,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.delete(tempId);
        return tempId;
      });

      await expect(
        t.withIdentity({ tokenIdentifier: "test|viewer123" })
          .query(api.projects.getStats, {
            workspaceId,
            projectId: fakeId,
          })
      ).rejects.toThrow("Project not found");
    });
  });

  describe("Project Event Logging", () => {
    test("Given_ProjectCreation_When_Created_Then_LogsEvent", async () => {
      const projectId = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Event Test Project",
        });

      const events = await t.run(async (ctx) => {
        return await ctx.db
          .query("events")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .filter((q) => q.eq(q.field("type"), "project_created"))
          .collect();
      });

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "project_created",
        entity: "project",
        entityId: projectId,
      });
    });

    test("Given_ProjectUpdate_When_Updated_Then_LogsEvent", async () => {
      const projectId = await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.create, {
          workspaceId,
          name: "Update Event Test",
        });

      await t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.projects.update, {
          projectId,
          name: "Updated Name",
        });

      const events = await t.run(async (ctx) => {
        return await ctx.db
          .query("events")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .filter((q) => q.eq(q.field("type"), "project_updated"))
          .collect();
      });

      expect(events).toHaveLength(1);
      expect(events[0].meta?.updatedFields).toContain("name");
    });
  });
});