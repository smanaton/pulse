/**
 * Ideas Extensions
 *
 * Extended functionality for the Ideas module including:
 * - Research task creation and linking
 * - Project promotion workflow
 * - Discussion management
 */

import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { assertMember, assertWriteEnabled, logEvent } from "./helpers";
import { requireUserId } from "./server/lib/authz";

/**
 * Create a research task linked to an idea.
 *
 * This mutation creates a new research task and explicitly links it to the specified idea.
 * The idea and project must both exist in the given workspace, and the user must have permission to create tasks in the project.
 * The created task will reference the idea via its `ideaId` field.
 */
export const createResearchTask = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
		projectId: v.id("projects"),
		taskName: v.string(),
		description: v.optional(v.string()),
		assignedTo: v.optional(v.array(v.id("users"))),
		dueDate: v.optional(v.number()),
	},
	returns: v.id("tasks"),
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Check permissions
		await assertWriteEnabled(ctx, args.workspaceId, "editor");

		// Verify idea exists and belongs to workspace
		const idea = await ctx.db.get(args.ideaId);
		if (!idea || idea.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found or not in workspace",
			});
		}

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

		const now = Date.now();

		// Get next sort key
		const lastTask = await ctx.db
			.query("tasks")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.order("desc")
			.first();

		const sortKey = lastTask ? lastTask.sortKey + 1 : 1;

		// Create research task
		const taskId = await ctx.db.insert("tasks", {
			workspaceId: args.workspaceId,
			projectId: args.projectId,
			ideaId: args.ideaId, // Link to idea
			taskType: "research", // Mark as research task
			name: args.taskName,
			description: args.description || `Research task for idea: ${idea.title}`,
			status: "todo",
			priority: "medium",
			assignedTo: args.assignedTo || [],
			reporterId: userId,
			dueDate: args.dueDate,
			position: 0,
			sortKey,
			attachments: [],
			dependencies: [],
			progress: 0,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log creation event
		await logEvent(ctx, args.workspaceId, "task_created", "idea", args.ideaId, {
			taskId,
			taskName: args.taskName,
			taskType: "research",
		});

		return taskId;
	},
});

/**
 * Get tasks linked to an idea
 */
export const getLinkedTasks = query({
	args: {
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
	},
	returns: v.array(
		v.object({
			_id: v.id("tasks"),
			name: v.string(),
			description: v.optional(v.string()),
			status: v.union(
				v.literal("backlog"),
				v.literal("todo"),
				v.literal("in_progress"),
				v.literal("in_review"),
				v.literal("done"),
				v.literal("cancelled"),
			),
			priority: v.union(
				v.literal("low"),
				v.literal("medium"),
				v.literal("high"),
				v.literal("urgent"),
			),
			assignedTo: v.optional(v.array(v.id("users"))),
			dueDate: v.optional(v.number()),
			progress: v.optional(v.number()),
			projectId: v.id("projects"),
			project: v.union(
				v.object({
					_id: v.id("projects"),
					name: v.string(),
					color: v.optional(v.string()),
				}),
				v.null(),
			),
			assignees: v.array(
				v.object({
					_id: v.id("users"),
					name: v.optional(v.string()),
					email: v.optional(v.string()),
					image: v.optional(v.string()),
				}),
			),
			createdAt: v.number(),
			updatedAt: v.number(),
		}),
	),
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		// Verify idea exists and belongs to workspace
		const idea = await ctx.db.get(args.ideaId);
		if (!idea || idea.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found or not in workspace",
			});
		}

		const tasks = await ctx.db
			.query("tasks")
			.withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.order("desc")
			.collect();

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
				).then((users) =>
					users.filter(
						(user): user is NonNullable<typeof user> => user !== null,
					),
				);

				return {
					_id: task._id,
					name: task.name,
					description: task.description,
					status: task.status,
					priority: task.priority,
					assignedTo: task.assignedTo,
					dueDate: task.dueDate,
					progress: task.progress,
					projectId: task.projectId,
					project: project
						? { _id: project._id, name: project.name, color: project.color }
						: null,
					assignees,
					createdAt: task.createdAt,
					updatedAt: task.updatedAt,
				};
			}),
		);

		return enrichedTasks;
	},
});

/**
 * Promote an idea to a project
 */
export const promoteToProject = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
		projectName: v.optional(v.string()),
		projectDescription: v.optional(v.string()),
		clientId: v.optional(v.id("clients")),
		ownerId: v.optional(v.id("users")),
	},
	returns: v.object({
		projectId: v.id("projects"),
		tasksTransferred: v.number(),
	}),
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Check permissions (admin required for project creation)
		await assertWriteEnabled(ctx, args.workspaceId, "admin");

		// Get the idea
		const idea = await ctx.db.get(args.ideaId);
		if (!idea || idea.workspaceId !== args.workspaceId || idea.deletedAt) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found or not in workspace",
			});
		}

		const now = Date.now();

		// Get next sort key for project
		const lastProject = await ctx.db
			.query("projects")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.order("desc")
			.first();

		const sortKey = lastProject ? lastProject.sortKey + 1 : 1;

		// Create project from idea
		const projectData: Omit<Doc<"projects">, "_id" | "_creationTime"> = {
			workspaceId: args.workspaceId,
			name: args.projectName || idea.title,
			description: args.projectDescription || buildProjectDescription(idea),
			status: "active",
			priority: "medium",
			ownerId: args.ownerId || userId,
			clientId: args.clientId,
			sortKey,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		};

		// Copy structured fields if available
		if (idea.problem || idea.hypothesis || idea.value || idea.risks) {
			const charter = [];
			if (idea.problem) charter.push(`**Problem**: ${idea.problem}`);
			if (idea.hypothesis) charter.push(`**Hypothesis**: ${idea.hypothesis}`);
			if (idea.value) charter.push(`**Value**: ${idea.value}`);
			if (idea.risks) charter.push(`**Risks**: ${idea.risks}`);

			if (charter.length > 0) {
				projectData.description = `${projectData.description}\n\n## Project Charter\n\n${charter.join("\n\n")}`;
			}
		}

		const projectId = await ctx.db.insert("projects", projectData);

		// Add creator as project owner
		await ctx.db.insert("projectMembers", {
			projectId,
			userId,
			role: "owner",
			canEditTasks: true,
			canManageMembers: true,
			addedBy: userId,
			addedAt: now,
		});

		// Transfer linked tasks to project
		const linkedTasks = await ctx.db
			.query("tasks")
			.withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		let tasksTransferred = 0;
		for (const task of linkedTasks) {
			await ctx.db.patch(task._id, {
				projectId,
				updatedAt: now,
			});
			tasksTransferred++;
		}

		// Link idea to project for provenance
		await ctx.db.patch(args.ideaId, {
			projectId,
			status: "archived", // Archive the idea since it's now a project
			updatedAt: now,
		});

		// Copy discussion history as project charter notes if there are any significant discussions
		const discussions = await ctx.db
			.query("ideaDiscussions")
			.withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
			.collect();

		const significantDiscussions = discussions.filter(
			(d) => d.messageType !== "chat" || d.message.length > 100,
		);

		if (significantDiscussions.length > 0) {
			// Create a charter note summarizing the idea development process
			const charterSummary = `# Idea Development History

This project was promoted from idea "${idea.title}".

## Key Discussions & Analysis

${significantDiscussions
	.map(
		(d) =>
			`**${d.messageType || "Discussion"}** (${new Date(d.createdAt).toLocaleDateString()}):\n${d.message}`,
	)
	.join("\n\n---\n\n")}
`;

			// Note: In a full implementation, you might want to create a "notes" or "charter"
			// document linked to the project here
		}

		// Log promotion event
		await logEvent(
			ctx,
			args.workspaceId,
			"idea_promoted",
			"project",
			projectId,
			{
				originalIdeaId: args.ideaId,
				ideaTitle: idea.title,
				tasksTransferred,
			},
		);

		return {
			projectId,
			tasksTransferred,
		};
	},
});

/**
 * Get discussion history for an idea
 */
export const getIdeaDiscussion = query({
	args: {
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
		limit: v.optional(v.number()),
	},
	returns: v.array(
		v.object({
			_id: v.id("ideaDiscussions"),
			userId: v.optional(v.id("users")),
			role: v.union(v.literal("user"), v.literal("assistant")),
			message: v.string(),
			messageType: v.optional(
				v.union(
					v.literal("chat"),
					v.literal("summary"),
					v.literal("qualify"),
					v.literal("contrarian"),
				),
			),
			author: v.union(
				v.object({
					_id: v.id("users"),
					name: v.optional(v.string()),
					image: v.optional(v.string()),
				}),
				v.null(),
			),
			createdAt: v.number(),
		}),
	),
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		// Verify idea exists and belongs to workspace
		const idea = await ctx.db.get(args.ideaId);
		if (!idea || idea.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found or not in workspace",
			});
		}

		const discussions = await ctx.db
			.query("ideaDiscussions")
			.withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
			.order("asc")
			.take(args.limit || 50);

		// Enrich with user details
		const enrichedDiscussions = await Promise.all(
			discussions.map(async (discussion) => {
				let author = null;
				if (discussion.userId) {
					const user = await ctx.db.get(discussion.userId);
					if (user) {
						author = {
							_id: user._id,
							name: user.name,
							image: user.image,
						};
					}
				}

				return {
					_id: discussion._id,
					userId: discussion.userId,
					role: discussion.role,
					message: discussion.message,
					messageType: discussion.messageType,
					author,
					createdAt: discussion.createdAt,
				};
			}),
		);

		return enrichedDiscussions;
	},
});

/**
 * Helper function to build project description from idea
 */
function buildProjectDescription(idea: Doc<"ideas">): string {
	let description =
		idea.contentMD && idea.contentMD.trim() ? idea.contentMD.trim() : "";

	if (idea.aiSummary) {
		description = `${idea.aiSummary}\n\n---\n\n${description}`;
	}

	if (!description) {
		description = `Project created from idea: ${idea.title}`;
	}

	return description;
}
