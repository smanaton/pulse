/**
 * Task Management Functions
 *
 * Tasks are work items within projects that can be organized in kanban boards.
 * All functions enforce workspace and project isolation.
 */

import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { assertMember, assertWriteEnabled, logEvent } from "./helpers";
import { requireUserId } from "./server/lib/authz";
import {
	taskCommentCreateArgs,
	taskCommentDeleteArgs,
	taskCommentUpdateArgs,
	taskCreateArgs,
	taskDeleteArgs,
	taskId,
	taskListArgs,
	taskMoveArgs,
	taskUpdateArgs,
	workspaceId,
} from "./validators";

/**
 * Create a new task.
 */
export const create = mutation({
	args: taskCreateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, args.workspaceId, "editor");

		// Verify project exists and belongs to workspace
		const project = await ctx.db.get(args.projectId);
		if (!project || project.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found or not in workspace",
			});
		}

		// Check if user is project member
		const projectMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", args.projectId).eq("userId", userId),
			)
			.first();

		if (
			!projectMember ||
			(!projectMember.canEditTasks && projectMember.role === "viewer")
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to create tasks in this project",
			});
		}

		// Validate parent task if provided
		if (args.parentTaskId) {
			const parentTask = await ctx.db.get(args.parentTaskId);
			if (!parentTask || parentTask.projectId !== args.projectId) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Parent task not found or not in same project",
				});
			}
		}

		// Validate assignees are project members
		if (args.assignedTo) {
			for (const assigneeId of args.assignedTo) {
				const assigneeMember = await ctx.db
					.query("projectMembers")
					.withIndex("by_project_user", (q) =>
						q.eq("projectId", args.projectId).eq("userId", assigneeId),
					)
					.first();

				if (!assigneeMember) {
					throw new ConvexError({
						code: "INVALID_ARGUMENT",
						message: `User ${assigneeId} is not a project member`,
					});
				}
			}
		}

		const now = Date.now();

		// Get next sort key and position
		const lastTask = await ctx.db
			.query("tasks")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.order("desc")
			.first();

		const sortKey = lastTask ? lastTask.sortKey + 1 : 1;

		// Get position within board/status
		const boardTasks = args.boardId
			? await ctx.db
					.query("tasks")
					.withIndex("by_project_board", (q) =>
						q.eq("projectId", args.projectId).eq("boardId", args.boardId),
					)
					.collect()
			: await ctx.db
					.query("tasks")
					.withIndex("by_project_status", (q) =>
						q
							.eq("projectId", args.projectId)
							.eq("status", args.status || "todo"),
					)
					.collect();

		const position = boardTasks.length;

		// Validate name
		const sanitizedName = args.name.trim().substring(0, 200);
		if (!sanitizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Task name is required",
			});
		}

		// Create task
		const taskId = await ctx.db.insert("tasks", {
			workspaceId: args.workspaceId,
			projectId: args.projectId,
			boardId: args.boardId,
			name: sanitizedName,
			description: args.description?.trim().substring(0, 2000),
			status: args.status || "todo",
			priority: args.priority || "medium",
			assignedTo: args.assignedTo || [],
			reporterId: userId,
			parentTaskId: args.parentTaskId,
			dueDate: args.dueDate,
			startDate: args.startDate,
			estimatedHours: args.estimatedHours,
			actualHours: 0,
			tags: args.tags || [],
			position,
			sortKey,
			attachments: [],
			dependencies: [],
			progress: 0,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log creation event
		await logEvent(
			ctx,
			args.workspaceId,
			"task_created",
			"project",
			args.projectId,
			{
				taskId,
				taskName: sanitizedName,
			},
		);

		return taskId;
	},
});

/**
 * Get a task by ID.
 */
export const get = query({
	args: { workspaceId, taskId },
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		const task = await ctx.db.get(args.taskId);

		if (!task) {
			return null;
		}

		// Verify task belongs to workspace
		if (task.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Task does not belong to workspace",
			});
		}

		// Exclude soft-deleted tasks
		if (task.deletedAt) {
			return null;
		}

		// Enrich with project and assignee details
		const project = await ctx.db.get(task.projectId);
		const assignees = await Promise.all(
			(task.assignedTo || []).map(async (userId) => {
				const user = await ctx.db.get(userId);
				return user
					? {
							_id: user._id,
							name: user.name,
							email: user.email,
							image: user.image,
						}
					: null;
			}),
		).then((users) => users.filter(Boolean));

		const reporter = await ctx.db.get(task.reporterId);

		return {
			...task,
			project: project ? { _id: project._id, name: project.name } : null,
			assignees,
			reporter: reporter
				? {
						_id: reporter._id,
						name: reporter.name,
						email: reporter.email,
						image: reporter.image,
					}
				: null,
		};
	},
});

/**
 * List tasks with filtering and pagination.
 */
export const list = query({
	args: taskListArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		let query = ctx.db
			.query("tasks")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined));

		// Filter by project if specified
		if (args.projectId) {
			const projectId = args.projectId as NonNullable<typeof args.projectId>;
			query = ctx.db
				.query("tasks")
				.withIndex("by_project", (q) => q.eq("projectId", projectId))
				.filter((q) => q.eq(q.field("deletedAt"), undefined));
		}

		// Apply additional filters
		if (args.status) {
			query = query.filter((q) => q.eq(q.field("status"), args.status));
		}

		if (args.assignedTo) {
			query = query.filter((q) =>
				q.and(
					q.neq(q.field("assignedTo"), undefined),
					q.neq(q.field("assignedTo"), []),
				),
			);
		}

		if (args.boardId) {
			query = query.filter((q) => q.eq(q.field("boardId"), args.boardId));
		}

		const limit = Math.min(args.limit ?? 50, 100);
		const tasks = await query.order("desc").take(limit);

		// Enrich with project and user details
		const enrichedTasks = await Promise.all(
			tasks.map(async (task) => {
				const project = await ctx.db.get(task.projectId);
				const assignees = await Promise.all(
					(task.assignedTo || []).map(async (userId) => {
						const user = await ctx.db.get(userId);
						return user
							? {
									_id: user._id,
									name: user.name,
									email: user.email,
									image: user.image,
								}
							: null;
					}),
				).then((users) => users.filter(Boolean));

				return {
					...task,
					project: project
						? { _id: project._id, name: project.name, color: project.color }
						: null,
					assignees,
				};
			}),
		);

		return enrichedTasks;
	},
});

/**
 * Update a task.
 */
export const update = mutation({
	args: taskUpdateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Task not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, task.workspaceId, "editor");

		// Check if user can edit tasks in this project
		const projectMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", task.projectId).eq("userId", userId),
			)
			.first();

		if (
			!projectMember ||
			(!projectMember.canEditTasks && projectMember.role === "viewer")
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to edit tasks in this project",
			});
		}

		const updates: Partial<Doc<"tasks">> = {
			updatedAt: Date.now(),
		};

		// Handle name update
		if (args.name !== undefined) {
			const sanitizedName = args.name.trim().substring(0, 200);
			if (!sanitizedName) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Task name cannot be empty",
				});
			}
			updates.name = sanitizedName;
		}

		// Handle description update
		if (args.description !== undefined) {
			updates.description = args.description?.trim().substring(0, 2000);
		}

		// Handle status update
		if (args.status !== undefined) {
			updates.status = args.status;

			// Set completion time if status changed to done
			if (args.status === "done" && task.status !== "done") {
				updates.completedAt = Date.now();
				updates.progress = 100;
			}
		}

		// Handle other field updates
		if (args.priority !== undefined) updates.priority = args.priority;
		if (args.assignedTo !== undefined) {
			// Validate assignees are project members
			for (const assigneeId of args.assignedTo) {
				const assigneeMember = await ctx.db
					.query("projectMembers")
					.withIndex("by_project_user", (q) =>
						q.eq("projectId", task.projectId).eq("userId", assigneeId),
					)
					.first();

				if (!assigneeMember) {
					throw new ConvexError({
						code: "INVALID_ARGUMENT",
						message: `User ${assigneeId} is not a project member`,
					});
				}
			}
			updates.assignedTo = args.assignedTo;
		}

		if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
		if (args.startDate !== undefined) updates.startDate = args.startDate;
		if (args.estimatedHours !== undefined)
			updates.estimatedHours = args.estimatedHours;
		if (args.actualHours !== undefined) updates.actualHours = args.actualHours;
		if (args.tags !== undefined) updates.tags = args.tags;
		if (args.progress !== undefined)
			updates.progress = Math.max(0, Math.min(100, args.progress));
		if (args.boardId !== undefined) updates.boardId = args.boardId;
		if (args.position !== undefined) updates.position = args.position;

		await ctx.db.patch(args.taskId, updates);

		// Log update event
		await logEvent(
			ctx,
			task.workspaceId,
			"task_updated",
			"project",
			task.projectId,
			{
				taskId: args.taskId,
				taskName: updates.name || task.name,
				updatedFields: Object.keys(updates),
			},
		);

		return await ctx.db.get(args.taskId);
	},
});

/**
 * Move a task to a different board/column.
 */
export const move = mutation({
	args: taskMoveArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Task not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, task.workspaceId, "editor");

		const projectMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", task.projectId).eq("userId", userId),
			)
			.first();

		if (
			!projectMember ||
			(!projectMember.canEditTasks && projectMember.role === "viewer")
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to move tasks in this project",
			});
		}

		// Update position and board
		await ctx.db.patch(args.taskId, {
			boardId: args.targetBoardId,
			position: args.targetPosition,
			updatedAt: Date.now(),
		});

		// Log move event
		await logEvent(
			ctx,
			task.workspaceId,
			"task_moved",
			"project",
			task.projectId,
			{
				taskId: args.taskId,
				taskName: task.name,
				fromBoard: task.boardId,
				toBoard: args.targetBoardId,
			},
		);
	},
});

/**
 * Delete a task (soft delete).
 */
export const deleteTask = mutation({
	args: taskDeleteArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Task not found",
			});
		}

		// Check permissions (manager or owner required for deletion)
		await assertWriteEnabled(ctx, task.workspaceId, "admin");

		const projectMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", task.projectId).eq("userId", userId),
			)
			.first();

		if (
			!projectMember ||
			(projectMember.role !== "owner" && projectMember.role !== "manager")
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to delete tasks",
			});
		}

		// Soft delete
		await ctx.db.patch(args.taskId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});

		// Log deletion event
		await logEvent(
			ctx,
			task.workspaceId,
			"task_deleted",
			"project",
			task.projectId,
			{ taskId: args.taskId, taskName: task.name },
		);
	},
});

/**
 * Add a comment to a task.
 */
export const addComment = mutation({
	args: taskCommentCreateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Task not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, task.workspaceId, "editor");

		const projectMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", task.projectId).eq("userId", userId),
			)
			.first();

		if (!projectMember) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Only project members can comment on tasks",
			});
		}

		// Validate parent comment if provided
		if (args.parentCommentId) {
			const parentComment = await ctx.db.get(args.parentCommentId);
			if (!parentComment || parentComment.taskId !== args.taskId) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Parent comment not found or not on same task",
				});
			}
		}

		const now = Date.now();

		// Create comment
		const commentId = await ctx.db.insert("taskComments", {
			taskId: args.taskId,
			workspaceId: task.workspaceId,
			projectId: task.projectId,
			content: args.content.trim(),
			authorId: userId,
			parentCommentId: args.parentCommentId,
			attachments: args.attachments || [],
			isInternal: args.isInternal || false,
			createdAt: now,
			updatedAt: now,
		});

		// Log comment event
		await logEvent(
			ctx,
			task.workspaceId,
			"commented",
			"project",
			task.projectId,
			{ taskId: args.taskId, taskName: task.name, commentId },
		);

		return commentId;
	},
});

/**
 * Get comments for a task.
 */
export const getComments = query({
	args: { workspaceId, taskId },
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		const task = await ctx.db.get(args.taskId);
		if (!task || task.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Task not found",
			});
		}

		const comments = await ctx.db
			.query("taskComments")
			.withIndex("by_task", (q) => q.eq("taskId", args.taskId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.order("asc")
			.collect();

		// Enrich with author details
		const enrichedComments = await Promise.all(
			comments.map(async (comment) => {
				const author = await ctx.db.get(comment.authorId);
				return {
					...comment,
					author: author
						? {
								_id: author._id,
								name: author.name,
								email: author.email,
								image: author.image,
							}
						: null,
				};
			}),
		);

		return enrichedComments;
	},
});

/**
 * Update a task comment.
 */
export const updateComment = mutation({
	args: taskCommentUpdateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const comment = await ctx.db.get(args.commentId);
		if (!comment) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Comment not found",
			});
		}

		// Check permissions (only author can edit)
		if (comment.authorId !== userId) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Only comment author can edit",
			});
		}

		await ctx.db.patch(args.commentId, {
			content: args.content.trim(),
			editedAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

/**
 * Delete a task comment.
 */
export const deleteComment = mutation({
	args: taskCommentDeleteArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const comment = await ctx.db.get(args.commentId);
		if (!comment) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Comment not found",
			});
		}

		// Check permissions (author or project manager/owner)
		if (comment.authorId !== userId) {
			const projectMember = await ctx.db
				.query("projectMembers")
				.withIndex("by_project_user", (q) =>
					q.eq("projectId", comment.projectId).eq("userId", userId),
				)
				.first();

			if (
				!projectMember ||
				(projectMember.role !== "owner" && projectMember.role !== "manager")
			) {
				throw new ConvexError({
					code: "FORBIDDEN",
					message: "Insufficient permissions to delete comment",
				});
			}
		}

		// Soft delete
		await ctx.db.patch(args.commentId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});
