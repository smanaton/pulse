/**
 * Tasks System Tests
 * Tests task creation, management, status updates, comments, and kanban operations
 */

import { convexTest } from "convex-test";
import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("Tasks System", () => {
  let t: ReturnType<typeof convexTest>;
  let adminUserId: any;
  let editorUserId: any;
  let viewerUserId: any;
  let workspaceId: any;
  let projectId: any;
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

    // Setup workspace
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

    // Setup workspace members
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: adminUserId,
        role: "owner",
        joinedAt: now,
        createdAt: now,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: editorUserId,
        role: "editor",
        joinedAt: now,
        createdAt: now,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: viewerUserId,
        role: "viewer",
        joinedAt: now,
        createdAt: now,
      });
    });

    // Setup client
    clientId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("clients", {
        workspaceId,
        name: "Test Client",
        status: "active",
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Setup project
    projectId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("projects", {
        workspaceId,
        name: "Test Project",
        status: "active",
        priority: "medium",
        ownerId: adminUserId,
        clientId,
        sortKey: 1,
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Setup project members
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("projectMembers", {
        projectId,
        userId: adminUserId,
        role: "owner",
        canEditTasks: true,
        canManageMembers: true,
        addedBy: adminUserId,
        addedAt: now,
      });

      await ctx.db.insert("projectMembers", {
        projectId,
        userId: editorUserId,
        role: "member",
        canEditTasks: true,
        canManageMembers: false,
        addedBy: adminUserId,
        addedAt: now,
      });

      await ctx.db.insert("projectMembers", {
        projectId,
        userId: viewerUserId,
        role: "viewer",
        canEditTasks: false,
        canManageMembers: false,
        addedBy: adminUserId,
        addedAt: now,
      });
    });
  });

  afterEach(async () => {
    // Clean up all test data
    await t.run(async (ctx) => {
      const tables = [
        "taskComments",
        "tasks",
        "projectMembers",
        "projects", 
        "clients",
        "workspaceMembers",
        "workspaces",
        "users"
      ];

      for (const table of tables) {
        const docs = await ctx.db.query(table as any).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      }
    });
  });

  // === Task Creation Tests ===

  test("Given_ValidTaskData_When_CreatingTask_Then_TaskIsCreated", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Test Task",
        description: "A test task description",
        status: "todo",
        priority: "high",
        assignedTo: [editorUserId],
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        estimatedHours: 8,
        tags: ["frontend", "urgent"],
      });

    expect(taskId).toBeDefined();

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task).toMatchObject({
      name: "Test Task",
      description: "A test task description",
      status: "todo",
      priority: "high",
      reporterId: adminUserId,
      estimatedHours: 8,
      tags: ["frontend", "urgent"],
      assignees: expect.arrayContaining([
        expect.objectContaining({
          _id: editorUserId,
          name: "Editor User",
        }),
      ]),
    });
  });

  test("Given_MinimalTaskData_When_CreatingTask_Then_TaskIsCreatedWithDefaults", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|editor123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Simple Task",
      });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|editor123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task).toMatchObject({
      name: "Simple Task",
      status: "todo",
      priority: "medium",
      reporterId: editorUserId,
      actualHours: 0,
      progress: 0,
      assignees: [],
      tags: [],
    });
  });

  test("Given_TaskWithParentTask_When_CreatingTask_Then_SubtaskIsCreated", async () => {
    // Create parent task
    const parentTaskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Parent Task",
      });

    // Create subtask
    const subtaskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Subtask",
        parentTaskId,
      });

    const subtask = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId: subtaskId });

    expect(subtask?.parentTaskId).toBe(parentTaskId);
  });

  test("Given_InvalidProject_When_CreatingTask_Then_ThrowsNotFound", async () => {
    const invalidProjectId = await t.run(async (ctx) => {
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
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.create, {
          workspaceId,
          projectId: invalidProjectId,
          name: "Test Task",
        })
    ).rejects.toThrow("Project not found");
  });

  test("Given_NonProjectMember_When_CreatingTask_Then_ThrowsForbidden", async () => {
    // Create a user who is not a project member
    const nonMemberId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("users", {
        name: "Non Member",
        email: "nonmember@test.com",
        tokenIdentifier: "test|nonmember123",
        createdAt: now,
        updatedAt: now,
      });
    });

    // Add to workspace but not project
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: nonMemberId,
        role: "editor",
        joinedAt: now,
        createdAt: now,
      });
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|nonmember123" })
        .mutation(api.tasks.create, {
          workspaceId,
          projectId,
          name: "Test Task",
        })
    ).rejects.toThrow("Insufficient permissions");
  });

  test("Given_ViewerRole_When_CreatingTask_Then_ThrowsForbidden", async () => {
    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .mutation(api.tasks.create, {
          workspaceId,
          projectId,
          name: "Test Task",
        })
    ).rejects.toThrow("Insufficient permissions");
  });

  test("Given_EmptyTaskName_When_CreatingTask_Then_ThrowsInvalidArgument", async () => {
    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.create, {
          workspaceId,
          projectId,
          name: "   ",
        })
    ).rejects.toThrow("Task name is required");
  });

  test("Given_InvalidAssignee_When_CreatingTask_Then_ThrowsInvalidArgument", async () => {
    // Create user who is workspace member but not project member
    const nonProjectUserId = await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        name: "Non Project User",
        email: "nonproject@test.com",
        tokenIdentifier: "test|nonproject123",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId,
        role: "editor",
        joinedAt: now,
        createdAt: now,
      });

      return userId;
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.create, {
          workspaceId,
          projectId,
          name: "Test Task",
          assignedTo: [nonProjectUserId],
        })
    ).rejects.toThrow("is not a project member");
  });

  // === Task Retrieval Tests ===

  test("Given_ExistingTask_When_GettingTask_Then_ReturnsEnrichedTask", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Test Task",
        assignedTo: [editorUserId],
      });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task).toMatchObject({
      name: "Test Task",
      project: expect.objectContaining({
        _id: projectId,
        name: "Test Project",
      }),
      assignees: expect.arrayContaining([
        expect.objectContaining({
          _id: editorUserId,
          name: "Editor User",
        }),
      ]),
      reporter: expect.objectContaining({
        _id: adminUserId,
        name: "Admin User",
      }),
    });
  });

  test("Given_NonExistentTask_When_GettingTask_Then_ReturnsNull", async () => {
    const nonExistentId = await t.run(async (ctx) => {
      const now = Date.now();
      const tempId = await ctx.db.insert("tasks", {
        workspaceId,
        projectId,
        name: "Temp Task",
        status: "todo",
        priority: "medium",
        assignedTo: [],
        reporterId: adminUserId,
        position: 0,
        sortKey: 1,
        attachments: [],
        dependencies: [],
        progress: 0,
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.delete(tempId);
      return tempId;
    });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId: nonExistentId });

    expect(task).toBeNull();
  });

  test("Given_TaskFromDifferentWorkspace_When_GettingTask_Then_ThrowsForbidden", async () => {
    // Create another workspace
    const otherWorkspaceId = await t.run(async (ctx) => {
      const now = Date.now();
      const workspaceId = await ctx.db.insert("workspaces", {
        name: "Other Workspace",
        type: "shared",
        isPersonal: false,
        plan: "free",
        createdAt: now,
        updatedAt: now,
      });

      // Add admin as member of other workspace
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: adminUserId,
        role: "owner",
        joinedAt: now,
        createdAt: now,
      });

      return workspaceId;
    });

    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Test Task",
      });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api.tasks.get, { workspaceId: otherWorkspaceId, taskId })
    ).rejects.toThrow("Task does not belong to workspace");
  });

  test("Given_SoftDeletedTask_When_GettingTask_Then_ReturnsNull", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Test Task",
      });

    // Soft delete the task
    await t.run(async (ctx) => {
      await ctx.db.patch(taskId, {
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task).toBeNull();
  });

  // === Task Listing Tests ===

  test("Given_TasksInWorkspace_When_ListingTasks_Then_ReturnsEnrichedTasks", async () => {
    // Create multiple tasks
    const task1Id = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task 1",
        status: "todo",
        assignedTo: [editorUserId],
      });

    const task2Id = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task 2",
        status: "in_progress",
        assignedTo: [adminUserId],
      });

    const tasks = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.list, { workspaceId });

    expect(tasks).toHaveLength(2);
    expect(tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Task 1",
          status: "todo",
          assignees: expect.arrayContaining([
            expect.objectContaining({ name: "Editor User" })
          ]),
        }),
        expect.objectContaining({
          name: "Task 2",
          status: "in_progress",
          assignees: expect.arrayContaining([
            expect.objectContaining({ name: "Admin User" })
          ]),
        }),
      ])
    );
  });

  test("Given_TasksInProject_When_ListingTasksByProject_Then_ReturnsProjectTasks", async () => {
    // Create another project
    const otherProjectId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("projects", {
        workspaceId,
        name: "Other Project",
        status: "active",
        priority: "medium",
        ownerId: adminUserId,
        sortKey: 2,
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Create project member for other project
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("projectMembers", {
        projectId: otherProjectId,
        userId: adminUserId,
        role: "owner",
        canEditTasks: true,
        canManageMembers: true,
        addedBy: adminUserId,
        addedAt: now,
      });
    });

    // Create tasks in different projects
    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task in Project 1",
      });

    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId: otherProjectId,
        name: "Task in Project 2",
      });

    const tasks = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.list, { workspaceId, projectId });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      name: "Task in Project 1",
    });
  });

  test("Given_TasksWithDifferentStatuses_When_FilteringByStatus_Then_ReturnsFilteredTasks", async () => {
    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Todo Task",
        status: "todo",
      });

    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "In Progress Task",
        status: "in_progress",
      });

    const todoTasks = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.list, { workspaceId, status: "todo" });

    expect(todoTasks).toHaveLength(1);
    expect(todoTasks[0]).toMatchObject({
      name: "Todo Task",
      status: "todo",
    });
  });

  // === Task Update Tests ===

  test("Given_ValidTaskUpdates_When_UpdatingTask_Then_TaskIsUpdated", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Original Task",
        status: "todo",
        priority: "low",
      });

    const updatedTask = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.update, {
        taskId,
        name: "Updated Task",
        status: "in_progress",
        priority: "high",
        description: "Updated description",
        progress: 25,
        assignedTo: [editorUserId],
      });

    expect(updatedTask).toMatchObject({
      name: "Updated Task",
      status: "in_progress",
      priority: "high",
      description: "Updated description",
      progress: 25,
      assignedTo: [editorUserId],
    });
  });

  test("Given_TaskCompletedStatus_When_UpdatingTaskToDone_Then_SetsCompletionFields", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task to Complete",
        status: "in_progress",
      });

    const updatedTask = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.update, {
        taskId,
        status: "done",
      });

    expect(updatedTask?.status).toBe("done");
    expect(updatedTask?.progress).toBe(100);
    expect(updatedTask?.completedAt).toBeDefined();
    expect(updatedTask?.completedAt).toBeGreaterThan(0);
  });

  test("Given_NonExistentTask_When_UpdatingTask_Then_ThrowsNotFound", async () => {
    const nonExistentId = await t.run(async (ctx) => {
      const now = Date.now();
      const tempId = await ctx.db.insert("tasks", {
        workspaceId,
        projectId,
        name: "Temp Task",
        status: "todo",
        priority: "medium",
        assignedTo: [],
        reporterId: adminUserId,
        position: 0,
        sortKey: 1,
        attachments: [],
        dependencies: [],
        progress: 0,
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.delete(tempId);
      return tempId;
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.update, {
          taskId: nonExistentId,
          name: "Updated Name",
        })
    ).rejects.toThrow("Task not found");
  });

  test("Given_ViewerRole_When_UpdatingTask_Then_ThrowsForbidden", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Test Task",
      });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .mutation(api.tasks.update, {
          taskId,
          name: "Updated Name",
        })
    ).rejects.toThrow("Insufficient permissions");
  });

  test("Given_EmptyTaskName_When_UpdatingTask_Then_ThrowsInvalidArgument", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Test Task",
      });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.update, {
          taskId,
          name: "   ",
        })
    ).rejects.toThrow("Task name cannot be empty");
  });

  // === Task Move Tests ===

  test("Given_ValidMoveParameters_When_MovingTask_Then_TaskIsMovedSuccessfully", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task to Move",
        boardId: "board-1",
      });

    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.move, {
        taskId,
        targetBoardId: "board-2",
        targetPosition: 5,
      });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task?.boardId).toBe("board-2");
    expect(task?.position).toBe(5);
  });

  test("Given_ViewerRole_When_MovingTask_Then_ThrowsForbidden", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task to Move",
      });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|viewer123" })
        .mutation(api.tasks.move, {
          taskId,
          targetBoardId: "board-2",
          targetPosition: 5,
        })
    ).rejects.toThrow("Insufficient permissions");
  });

  // === Task Deletion Tests ===

  test("Given_ValidTaskAndOwnerRole_When_DeletingTask_Then_TaskIsSoftDeleted", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task to Delete",
      });

    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.deleteTask, { taskId });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task).toBeNull(); // Soft deleted tasks return null
  });

  test("Given_EditorRole_When_DeletingTask_Then_ThrowsForbidden", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task to Delete",
      });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.tasks.deleteTask, { taskId })
    ).rejects.toThrow("Insufficient permissions");
  });

  test("Given_NonExistentTask_When_DeletingTask_Then_ThrowsNotFound", async () => {
    const nonExistentId = await t.run(async (ctx) => {
      const now = Date.now();
      const tempId = await ctx.db.insert("tasks", {
        workspaceId,
        projectId,
        name: "Temp Task",
        status: "todo",
        priority: "medium",
        assignedTo: [],
        reporterId: adminUserId,
        position: 0,
        sortKey: 1,
        attachments: [],
        dependencies: [],
        progress: 0,
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.delete(tempId);
      return tempId;
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.deleteTask, { taskId: nonExistentId })
    ).rejects.toThrow("Task not found");
  });

  // === Task Comments Tests ===

  test("Given_ValidComment_When_AddingComment_Then_CommentIsCreated", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task with Comment",
      });

    const commentId = await t
      .withIdentity({ tokenIdentifier: "test|editor123" })
      .mutation(api.tasks.addComment, {
        taskId,
        content: "This is a test comment",
        isInternal: false,
      });

    expect(commentId).toBeDefined();

    const comments = await t
      .withIdentity({ tokenIdentifier: "test|editor123" })
      .query(api.tasks.getComments, { workspaceId, taskId });

    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      content: "This is a test comment",
      isInternal: false,
      author: expect.objectContaining({
        name: "Editor User",
      }),
    });
  });

  test("Given_ValidThreadedComment_When_AddingReply_Then_ReplyIsCreated", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task with Threaded Comment",
      });

    const parentCommentId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.addComment, {
        taskId,
        content: "Parent comment",
      });

    const replyCommentId = await t
      .withIdentity({ tokenIdentifier: "test|editor123" })
      .mutation(api.tasks.addComment, {
        taskId,
        content: "Reply comment",
        parentCommentId,
      });

    expect(replyCommentId).toBeDefined();

    const comments = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.getComments, { workspaceId, taskId });

    expect(comments).toHaveLength(2);
    
    const reply = comments.find(c => c._id === replyCommentId);
    expect(reply?.parentCommentId).toBe(parentCommentId);
  });

  test("Given_NonProjectMember_When_AddingComment_Then_ThrowsForbidden", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task with Comment",
      });

    // Create a user who is workspace member but not project member
    const nonProjectUserId = await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        name: "Non Project User",
        email: "nonproject@test.com",
        tokenIdentifier: "test|nonproject123",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId,
        role: "editor",
        joinedAt: now,
        createdAt: now,
      });

      return userId;
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|nonproject123" })
        .mutation(api.tasks.addComment, {
          taskId,
          content: "This should fail",
        })
    ).rejects.toThrow("Only project members can comment");
  });

  test("Given_ValidCommentUpdate_When_UpdatingComment_Then_CommentIsUpdated", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task with Comment",
      });

    const commentId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.addComment, {
        taskId,
        content: "Original comment",
      });

    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.updateComment, {
        commentId,
        content: "Updated comment",
      });

    const comments = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.getComments, { workspaceId, taskId });

    expect(comments[0]).toMatchObject({
      content: "Updated comment",
    });
    expect(comments[0].editedAt).toBeDefined();
  });

  test("Given_CommentByDifferentAuthor_When_UpdatingComment_Then_ThrowsForbidden", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task with Comment",
      });

    const commentId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.addComment, {
        taskId,
        content: "Admin's comment",
      });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|editor123" })
        .mutation(api.tasks.updateComment, {
          commentId,
          content: "Editor trying to update admin's comment",
        })
    ).rejects.toThrow("Only comment author can edit");
  });

  test("Given_ValidCommentDeletion_When_DeletingComment_Then_CommentIsDeleted", async () => {
    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task with Comment",
      });

    const commentId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.addComment, {
        taskId,
        content: "Comment to delete",
      });

    await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.deleteComment, { commentId });

    const comments = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.getComments, { workspaceId, taskId });

    expect(comments).toHaveLength(0);
  });

  // === Task Sorting and Positioning Tests ===

  test("Given_MultipleTasks_When_CreatingTasks_Then_TasksHaveCorrectSortOrder", async () => {
    const task1Id = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "First Task",
      });

    const task2Id = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Second Task",
      });

    const task1 = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId: task1Id });

    const task2 = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId: task2Id });

    expect(task1?.sortKey).toBe(1);
    expect(task2?.sortKey).toBe(2);
    expect(task1?.position).toBe(0);
    expect(task2?.position).toBe(1);
  });

  test("Given_TasksInDifferentBoards_When_CreatingTasks_Then_PositionsAreCorrectPerBoard", async () => {
    // Create tasks in different boards
    const task1Id = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task in Board 1",
        boardId: "board-1",
      });

    const task2Id = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task in Board 2",
        boardId: "board-2",
      });

    const task3Id = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Another Task in Board 1",
        boardId: "board-1",
      });

    const task1 = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId: task1Id });

    const task2 = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId: task2Id });

    const task3 = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId: task3Id });

    // First task in board-1 should be position 0
    expect(task1?.position).toBe(0);
    // First task in board-2 should be position 0
    expect(task2?.position).toBe(0);
    // Second task in board-1 should be position 1
    expect(task3?.position).toBe(1);
  });

  // === Edge Cases and Error Handling ===

  test("Given_LongTaskName_When_CreatingTask_Then_TaskNameIsTruncated", async () => {
    const longName = "a".repeat(300);

    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: longName,
      });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task?.name).toHaveLength(200);
    expect(task?.name).toBe("a".repeat(200));
  });

  test("Given_LongTaskDescription_When_CreatingTask_Then_DescriptionIsTruncated", async () => {
    const longDescription = "a".repeat(3000);

    const taskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId,
        name: "Task with Long Description",
        description: longDescription,
      });

    const task = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .query(api.tasks.get, { workspaceId, taskId });

    expect(task?.description).toHaveLength(2000);
    expect(task?.description).toBe("a".repeat(2000));
  });

  test("Given_TaskWithInvalidParentTask_When_CreatingTask_Then_ThrowsInvalidArgument", async () => {
    const invalidParentTaskId = await t.run(async (ctx) => {
      const now = Date.now();
      const tempId = await ctx.db.insert("tasks", {
        workspaceId,
        projectId,
        name: "Temp Task",
        status: "todo",
        priority: "medium",
        assignedTo: [],
        reporterId: adminUserId,
        position: 0,
        sortKey: 1,
        attachments: [],
        dependencies: [],
        progress: 0,
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.delete(tempId);
      return tempId;
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.create, {
          workspaceId,
          projectId,
          name: "Task with Invalid Parent",
          parentTaskId: invalidParentTaskId,
        })
    ).rejects.toThrow("Parent task not found");
  });

  test("Given_TaskWithParentFromDifferentProject_When_CreatingTask_Then_ThrowsInvalidArgument", async () => {
    // Create another project
    const otherProjectId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("projects", {
        workspaceId,
        name: "Other Project",
        status: "active",
        priority: "medium",
        ownerId: adminUserId,
        sortKey: 2,
        createdBy: adminUserId,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Create project member for other project
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("projectMembers", {
        projectId: otherProjectId,
        userId: adminUserId,
        role: "owner",
        canEditTasks: true,
        canManageMembers: true,
        addedBy: adminUserId,
        addedAt: now,
      });
    });

    // Create task in other project
    const parentTaskId = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.tasks.create, {
        workspaceId,
        projectId: otherProjectId,
        name: "Parent in Other Project",
      });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api.tasks.create, {
          workspaceId,
          projectId,
          name: "Child in Different Project",
          parentTaskId,
        })
    ).rejects.toThrow("Parent task not found or not in same project");
  });
});