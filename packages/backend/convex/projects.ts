/**
 * Projects Management Functions
 *
 * Projects are top-level organizational units within workspaces.
 * All functions enforce workspace isolation.
 */

import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertMember, assertWriteEnabled, logEvent } from "./helpers";
import { requireUserId } from "./server/lib/authz";
import {
	projectCreateArgs,
	projectDeleteArgs,
	projectId,
	projectListArgs,
	projectMemberAddArgs,
	projectMemberRemoveArgs,
	projectMemberUpdateArgs,
	projectReorderArgs,
	projectStatsArgs,
	projectUpdateArgs,
	workspaceId,
} from "./validators";

/**
 * Create a new project.
 */
export const create = mutation({
	args: projectCreateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, args.workspaceId, "editor");

		// Validate name
		const sanitizedName = args.name.trim().substring(0, 100);
		if (!sanitizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Project name is required",
			});
		}

		// Validate dates
		if (args.startDate && args.endDate && args.startDate > args.endDate) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Start date must be before end date",
			});
		}

		// Validate client exists if provided
		if (args.clientId) {
			const client = await ctx.db.get(args.clientId);
			if (!client || client.workspaceId !== args.workspaceId) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Client not found or not in workspace",
				});
			}
		}

		const now = Date.now();

		// Get next sort key (projects are sorted by creation order by default)
		const lastProject = await ctx.db
			.query("projects")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.order("desc")
			.first();

		const sortKey = lastProject ? lastProject.sortKey + 1 : 1;

		// Create project
		const projectId = await ctx.db.insert("projects", {
			workspaceId: args.workspaceId,
			name: sanitizedName,
			description: args.description?.trim().substring(0, 500),
			status: "active",
			priority: args.priority || "medium",
			startDate: args.startDate,
			endDate: args.endDate,
			ownerId: args.ownerId || userId, // Default to creator
			clientId: args.clientId,
			tags: args.tags || [],
			color: args.color,
			budget: args.budget,
			estimatedHours: args.estimatedHours,
			actualHours: 0,
			progress: 0,
			isTemplate: args.isTemplate || false,
			templateId: args.templateId,
			sortKey,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Add creator as project owner
		await ctx.db.insert("projectMembers", {
			projectId,
			userId: args.ownerId || userId,
			role: "owner",
			canEditTasks: true,
			canManageMembers: true,
			addedBy: userId,
			addedAt: now,
		});

		// Associate with client if provided
		if (args.clientId) {
			await ctx.db.insert("projectClients", {
				projectId,
				clientId: args.clientId,
				isPrimary: true,
				createdBy: userId,
				createdAt: now,
			});
		}

		// Log creation event
		await logEvent(
			ctx,
			args.workspaceId,
			"project_created",
			"project",
			projectId,
		);

		return projectId;
	},
});

/**
 * Get a project by ID.
 */
export const get = query({
	args: { workspaceId, projectId },
	handler: async (ctx, { workspaceId, projectId }) => {
		// Check workspace access first
		await assertMember(ctx, workspaceId, "viewer");

		const project = await ctx.db.get(projectId);

		if (!project) {
			return null;
		}

		// Verify project belongs to workspace
		if (project.workspaceId !== workspaceId) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Project does not belong to workspace",
			});
		}

		// Exclude soft-deleted projects
		if (project.deletedAt) {
			return null;
		}

		return project;
	},
});

/**
 * List projects in a workspace.
 */
export const list = query({
	args: projectListArgs,
	handler: async (ctx, { workspaceId, status }) => {
		// Check workspace access
		await assertMember(ctx, workspaceId, "viewer");

		const query = ctx.db
			.query("projects")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined)) // Exclude soft-deleted
			.order("asc"); // Sort by sortKey ascending

		const projects = await query.collect();

		// Filter by status if specified
		if (status) {
			return projects.filter((p) => p.status === status);
		}

		return projects;
	},
});

/**
 * Update a project.
 */
export const update = mutation({
	args: projectUpdateArgs,
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, project.workspaceId, "editor");

		const updates: any = {
			updatedAt: Date.now(),
		};

		// Handle name update
		if (args.name !== undefined) {
			const sanitizedName = args.name.trim().substring(0, 100);
			if (!sanitizedName) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Project name cannot be empty",
				});
			}
			updates.name = sanitizedName;
		}

		// Handle description update
		if (args.description !== undefined) {
			updates.description = args.description?.trim().substring(0, 500);
		}

		// Handle status update
		if (args.status !== undefined) {
			updates.status = args.status;

			// Set completion time if status changed to completed
			if (args.status === "completed" && project.status !== "completed") {
				updates.progress = 100;
			}
		}

		// Handle other field updates
		if (args.priority !== undefined) updates.priority = args.priority;
		if (args.startDate !== undefined) updates.startDate = args.startDate;
		if (args.endDate !== undefined) updates.endDate = args.endDate;
		if (args.ownerId !== undefined) updates.ownerId = args.ownerId;
		if (args.clientId !== undefined) updates.clientId = args.clientId;
		if (args.tags !== undefined) updates.tags = args.tags;
		if (args.color !== undefined) updates.color = args.color;
		if (args.budget !== undefined) updates.budget = args.budget;
		if (args.estimatedHours !== undefined)
			updates.estimatedHours = args.estimatedHours;
		if (args.actualHours !== undefined) updates.actualHours = args.actualHours;
		if (args.progress !== undefined)
			updates.progress = Math.max(0, Math.min(100, args.progress));
		if (args.sortKey !== undefined) updates.sortKey = args.sortKey;

		// Validate dates
		const newStartDate = args.startDate ?? project.startDate;
		const newEndDate = args.endDate ?? project.endDate;
		if (newStartDate && newEndDate && newStartDate > newEndDate) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Start date must be before end date",
			});
		}

		await ctx.db.patch(args.projectId, updates);

		// Log update event
		await logEvent(
			ctx,
			project.workspaceId,
			"project_updated",
			"project",
			args.projectId,
			{ updatedFields: Object.keys(updates) },
		);

		return await ctx.db.get(args.projectId);
	},
});

/**
 * Delete a project (soft delete).
 */
export const deleteProject = mutation({
	args: projectDeleteArgs,
	handler: async (ctx, { projectId }) => {
		const project = await ctx.db.get(projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		// Check permissions (admin required for deletion)
		await assertWriteEnabled(ctx, project.workspaceId, "admin");

		// Soft delete
		await ctx.db.patch(projectId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});

		// Log deletion event
		await logEvent(
			ctx,
			project.workspaceId,
			"project_deleted",
			"project",
			projectId,
		);
	},
});

/**
 * Reorder projects within workspace.
 */
export const reorder = mutation({
	args: projectReorderArgs,
	handler: async (ctx, { workspaceId, projectIds }) => {
		// Check permissions (editor required)
		await assertWriteEnabled(ctx, workspaceId, "editor");

		// Verify all projects belong to workspace
		const _projects = await Promise.all(
			projectIds.map(async (id) => {
				const project = await ctx.db.get(id);
				if (!project || project.workspaceId !== workspaceId) {
					throw new ConvexError({
						code: "INVALID_ARGUMENT",
						message: "Invalid project ID or project not in workspace",
					});
				}
				return project;
			}),
		);

		// Update sort keys
		await Promise.all(
			projectIds.map(async (projectId, index) => {
				await ctx.db.patch(projectId, {
					sortKey: index + 1,
					updatedAt: Date.now(),
				});
			}),
		);

		// Log reorder event
		await logEvent(
			ctx,
			workspaceId,
			"projects_reordered",
			"workspace",
			workspaceId,
			{ projectCount: projectIds.length },
		);
	},
});

/**
 * Add a member to a project.
 */
export const addMember = mutation({
	args: projectMemberAddArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const project = await ctx.db.get(args.projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		// Check permissions (manager or owner required)
		await assertWriteEnabled(ctx, project.workspaceId, "editor");

		// Check if user has permission to manage members
		const currentMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", args.projectId).eq("userId", userId),
			)
			.first();

		if (
			!currentMember ||
			(!currentMember.canManageMembers && currentMember.role !== "owner")
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to manage project members",
			});
		}

		// Check if user is already a member
		const existingMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", args.projectId).eq("userId", args.userId),
			)
			.first();

		if (existingMember) {
			throw new ConvexError({
				code: "CONFLICT",
				message: "User is already a project member",
			});
		}

		// Verify user exists and is in workspace
		const targetUser = await ctx.db.get(args.userId);
		if (!targetUser) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		// Check if user is workspace member
		const workspaceMember = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_user", (q) =>
				q.eq("workspaceId", project.workspaceId).eq("userId", args.userId),
			)
			.first();

		if (!workspaceMember) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "User is not a workspace member",
			});
		}

		const now = Date.now();

		// Add member
		const memberId = await ctx.db.insert("projectMembers", {
			projectId: args.projectId,
			userId: args.userId,
			role: args.role,
			canEditTasks: args.canEditTasks ?? args.role !== "viewer",
			canManageMembers:
				args.canManageMembers ??
				(args.role === "owner" || args.role === "manager"),
			addedBy: userId,
			addedAt: now,
		});

		// Log event
		await logEvent(
			ctx,
			project.workspaceId,
			"member_added",
			"project",
			args.projectId,
			{ userId: args.userId, role: args.role },
		);

		return memberId;
	},
});

/**
 * Update a project member's role and permissions.
 */
export const updateMember = mutation({
	args: projectMemberUpdateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const project = await ctx.db.get(args.projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		await assertWriteEnabled(ctx, project.workspaceId, "editor");

		const member = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", args.projectId).eq("userId", args.userId),
			)
			.first();

		if (!member) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project member not found",
			});
		}

		// Check permissions
		const currentMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", args.projectId).eq("userId", userId),
			)
			.first();

		if (
			!currentMember ||
			(!currentMember.canManageMembers && currentMember.role !== "owner")
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to manage project members",
			});
		}

		// Update member
		await ctx.db.patch(member._id, {
			role: args.role,
			canEditTasks: args.canEditTasks ?? args.role !== "viewer",
			canManageMembers:
				args.canManageMembers ??
				(args.role === "owner" || args.role === "manager"),
		});

		// Log event
		await logEvent(
			ctx,
			project.workspaceId,
			"member_updated",
			"project",
			args.projectId,
			{ userId: args.userId, role: args.role },
		);
	},
});

/**
 * Remove a member from a project.
 */
export const removeMember = mutation({
	args: projectMemberRemoveArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const project = await ctx.db.get(args.projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		await assertWriteEnabled(ctx, project.workspaceId, "editor");

		const member = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", args.projectId).eq("userId", args.userId),
			)
			.first();

		if (!member) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project member not found",
			});
		}

		// Prevent removing the project owner
		if (member.role === "owner") {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Cannot remove project owner",
			});
		}

		// Check permissions
		const currentMember = await ctx.db
			.query("projectMembers")
			.withIndex("by_project_user", (q) =>
				q.eq("projectId", args.projectId).eq("userId", userId),
			)
			.first();

		if (
			!currentMember ||
			(!currentMember.canManageMembers && currentMember.role !== "owner")
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to manage project members",
			});
		}

		// Remove member
		await ctx.db.delete(member._id);

		// Log event
		await logEvent(
			ctx,
			project.workspaceId,
			"member_removed",
			"project",
			args.projectId,
			{ userId: args.userId },
		);
	},
});

/**
 * List project members.
 */
export const listMembers = query({
	args: { projectId, workspaceId },
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		const project = await ctx.db.get(args.projectId);
		if (!project || project.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		const members = await ctx.db
			.query("projectMembers")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();

		// Enrich with user details
		const enrichedMembers = await Promise.all(
			members.map(async (member) => {
				const user = await ctx.db.get(member.userId);
				return {
					...member,
					user: user
						? {
								_id: user._id,
								name: user.name,
								email: user.email,
								image: user.image,
							}
						: null,
				};
			}),
		);

		return enrichedMembers;
	},
});

/**
 * Get project statistics and analytics.
 */
export const getStats = query({
	args: projectStatsArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		if (args.projectId) {
			// Single project stats
			const project = await ctx.db.get(args.projectId);
			if (!project || project.workspaceId !== args.workspaceId) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			// Get task statistics
			const tasks = await ctx.db
				.query("tasks")
				.withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
				.filter((q) => q.eq(q.field("deletedAt"), undefined))
				.collect();

			const taskStats = {
				total: tasks.length,
				completed: tasks.filter((t) => t.status === "done").length,
				inProgress: tasks.filter((t) => t.status === "in_progress").length,
				todo: tasks.filter((t) => t.status === "todo" || t.status === "backlog")
					.length,
				overdue: tasks.filter(
					(t) => t.dueDate && t.dueDate < Date.now() && t.status !== "done",
				).length,
			};

			// Get member count
			const memberCount = await ctx.db
				.query("projectMembers")
				.withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
				.collect()
				.then((members) => members.length);

			// Calculate time tracking
			const totalEstimated = tasks.reduce(
				(sum, task) => sum + (task.estimatedHours || 0),
				0,
			);
			const totalActual = tasks.reduce(
				(sum, task) => sum + (task.actualHours || 0),
				0,
			);

			return {
				project,
				tasks: taskStats,
				members: memberCount,
				timeTracking: {
					estimatedHours: totalEstimated,
					actualHours: totalActual,
					efficiency:
						totalEstimated > 0
							? (totalEstimated / Math.max(totalActual, 1)) * 100
							: 0,
				},
				progress: project.progress || 0,
			};
		}
		// Workspace-wide project stats
		const projects = await ctx.db
			.query("projects")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		const projectStats = {
			total: projects.length,
			active: projects.filter((p) => p.status === "active").length,
			completed: projects.filter((p) => p.status === "completed").length,
			onHold: projects.filter((p) => p.status === "on_hold").length,
			overdue: projects.filter(
				(p) => p.endDate && p.endDate < Date.now() && p.status !== "completed",
			).length,
		};

		return { projects: projectStats };
	},
});
