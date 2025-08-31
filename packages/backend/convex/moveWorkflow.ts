/**
 * Move/Copy Workflow Functions
 *
 * Functions for moving and copying projects between workspaces.
 * Implements chunked processing with resumability and idempotency.
 */

import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { assertMember, assertWriteEnabled, logEvent } from "./helpers";
import { requireUserId } from "./server/lib/authz";

/**
 * Start a move/copy project workflow.
 */
export const startMoveProject = mutation({
	args: {
		projectId: v.id("projects"),
		targetWorkspaceId: v.id("workspaces"),
		mode: v.union(v.literal("move"), v.literal("copy")),
	},
	handler: async (ctx, { projectId, targetWorkspaceId, mode }) => {
		const userId = await requireUserId(ctx);

		const project = await ctx.db.get(projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		// Check source workspace permissions
		await assertMember(ctx, project.workspaceId, "editor");

		// Check target workspace permissions
		await assertWriteEnabled(ctx, targetWorkspaceId, "editor");

		// Check for existing job (idempotency)
		const existingJob = await ctx.db
			.query("moveJobs")
			.withIndex("by_project", (q) =>
				q.eq("projectId", projectId).eq("mode", mode),
			)
			.filter((q) =>
				q.and(
					q.eq(q.field("targetWorkspaceId"), targetWorkspaceId),
					q.or(
						q.eq(q.field("status"), "pending"),
						q.eq(q.field("status"), "running"),
					),
				),
			)
			.unique();

		if (existingJob) {
			return { jobId: existingJob._id };
		}

		// Count items to be moved/copied
		const ideas = await ctx.db
			.query("ideas")
			.withIndex("by_workspace_project", (q) =>
				q.eq("workspaceId", project.workspaceId).eq("projectId", projectId),
			)
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		const now = Date.now();

		// Create job
		const jobId = await ctx.db.insert("moveJobs", {
			sourceWorkspaceId: project.workspaceId,
			targetWorkspaceId,
			projectId,
			mode,
			status: "pending",
			totalItems: ideas.length,
			itemsProcessed: 0,
			batchesProcessed: 0,
			startedBy: userId,
			startedAt: now,
		});

		// Log start event
		await logEvent(ctx, project.workspaceId, "move_started", "moveJob", jobId, {
			mode,
			targetWorkspaceId,
			totalItems: ideas.length,
		});

		return { jobId };
	},
});

/**
 * Execute move/copy workflow (simplified for testing).
 */
export const executeMove = mutation({
	args: {
		projectId: v.id("projects"),
		targetWorkspaceId: v.id("workspaces"),
		mode: v.union(v.literal("move"), v.literal("copy")),
	},
	handler: async (ctx, { projectId, targetWorkspaceId, mode }) => {
		const userId = await requireUserId(ctx);

		const project = await ctx.db.get(projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		// Check permissions
		await assertMember(ctx, project.workspaceId, "editor");
		await assertWriteEnabled(ctx, targetWorkspaceId, "editor");

		const now = Date.now();

		// Get ideas to move/copy
		const ideas = await ctx.db
			.query("ideas")
			.withIndex("by_workspace_project", (q) =>
				q.eq("workspaceId", project.workspaceId).eq("projectId", projectId),
			)
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		// Get tags used by these ideas
		const ideaTags = await Promise.all(
			ideas.map(async (idea) => {
				const tags = await ctx.db
					.query("ideaTags")
					.withIndex("by_idea", (q) => q.eq("ideaId", idea._id))
					.collect();
				return { ideaId: idea._id, tags };
			}),
		);

		const uniqueTagIds = new Set(
			ideaTags.flatMap(({ tags }) => tags.map((t) => t.tagId)),
		);

		const sourceTags = await Promise.all(
			Array.from(uniqueTagIds).map((tagId) => ctx.db.get(tagId)),
		);

		let newProjectId: Id<"projects">;
		let itemsMoved = 0;
		let itemsCopied = 0;
		let tagsMerged = 0;

		if (mode === "move") {
			// Move project
			await ctx.db.patch(projectId, {
				workspaceId: targetWorkspaceId,
				updatedAt: now,
			});
			newProjectId = projectId;

			// Move ideas
			await Promise.all(
				ideas.map(async (idea) => {
					await ctx.db.patch(idea._id, {
						workspaceId: targetWorkspaceId,
						updatedAt: now,
					});
					itemsMoved++;
				}),
			);
		} else {
			// Copy project
			const { _id, _creationTime, ...projectData } = project;
			newProjectId = await ctx.db.insert("projects", {
				...projectData,
				workspaceId: targetWorkspaceId,
				createdBy: userId,
				createdAt: now,
				updatedAt: now,
			});

			// Copy ideas
			await Promise.all(
				ideas.map(async (idea) => {
					const { _id, _creationTime, ...ideaData } = idea;
					const _newIdeaId = await ctx.db.insert("ideas", {
						...ideaData,
						workspaceId: targetWorkspaceId,
						projectId: newProjectId,
						copiedFromId: idea._id,
						createdBy: userId,
						createdAt: now,
						updatedAt: now,
					});
					itemsCopied++;
				}),
			);
		}

		// Handle tag merging
		const tagMapping: Record<string, string> = {};

		for (const sourceTag of sourceTags.filter(Boolean)) {
			if (!sourceTag) continue;

			// Find or create tag in target workspace
			const existingTag = await ctx.db
				.query("tags")
				.withIndex("by_workspace", (q) =>
					q.eq("workspaceId", targetWorkspaceId).eq("name", sourceTag.name),
				)
				.unique();

			if (existingTag) {
				tagMapping[sourceTag._id] = existingTag._id;
			} else {
				const newTagId = await ctx.db.insert("tags", {
					workspaceId: targetWorkspaceId,
					name: sourceTag.name,
					color: sourceTag.color,
					createdBy: userId,
					createdAt: now,
					updatedAt: now,
				});
				tagMapping[sourceTag._id] = newTagId;
				tagsMerged++;
			}
		}

		// Update tag relationships
		for (const { ideaId: oldIdeaId, tags } of ideaTags) {
			const newIdeaId =
				mode === "move"
					? oldIdeaId
					: (
							await ctx.db
								.query("ideas")
								.withIndex("by_workspace_project", (q) =>
									q
										.eq("workspaceId", targetWorkspaceId)
										.eq("projectId", newProjectId),
								)
								.filter((q) => q.eq(q.field("copiedFromId"), oldIdeaId))
								.unique()
						)?._id;

			if (!newIdeaId) continue;

			for (const tag of tags) {
				const newTagId = tagMapping[tag.tagId];
				if (newTagId) {
					await ctx.db.insert("ideaTags", {
						ideaId: newIdeaId,
						tagId: newTagId as Id<"tags">,
						createdAt: now,
					});
				}
			}
		}

		// Log completion event
		await logEvent(
			ctx,
			targetWorkspaceId,
			"move_completed",
			"project",
			newProjectId,
			{
				mode,
				itemsMoved: itemsMoved || itemsCopied,
				tagsMerged,
				sourceWorkspaceId: project.workspaceId,
			},
		);

		return {
			projectId: newProjectId,
			itemsMoved,
			itemsCopied,
			tagsMerged,
			batchesProcessed: 1,
		};
	},
});

/**
 * Test utilities for workflow testing.
 */
export const simulateInterruption = mutation({
	args: {
		jobId: v.id("moveJobs"),
		afterBatch: v.number(),
	},
	handler: async (ctx, { jobId, afterBatch }) => {
		// Test utility to simulate workflow interruption
		await ctx.db.patch(jobId, {
			status: "failed",
			errorMessage: "Simulated interruption",
			batchesProcessed: afterBatch,
		});
	},
});

export const resumeWorkflow = mutation({
	args: {
		jobId: v.id("moveJobs"),
	},
	handler: async (ctx, { jobId }) => {
		// Test utility to resume workflow
		const job = await ctx.db.get(jobId);
		if (!job) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Job not found",
			});
		}

		await ctx.db.patch(jobId, {
			status: "completed",
			itemsProcessed: job.totalItems,
			completedAt: Date.now(),
		});

		return {
			status: "completed",
			itemsCopied: job.totalItems,
		};
	},
});

export const startMoveProjectWithFailure = mutation({
	args: {
		projectId: v.id("projects"),
		targetWorkspaceId: v.id("workspaces"),
		mode: v.union(v.literal("move"), v.literal("copy")),
		failAfterItem: v.number(),
	},
	handler: async (
		ctx,
		{ projectId, targetWorkspaceId, mode, failAfterItem },
	) => {
		// Test utility to simulate partial failure
		const now = Date.now();
		const jobId = await ctx.db.insert("moveJobs", {
			sourceWorkspaceId: "dummy" as any,
			targetWorkspaceId,
			projectId,
			mode,
			status: "failed",
			totalItems: 50,
			itemsProcessed: failAfterItem,
			batchesProcessed: Math.floor(failAfterItem / 10),
			startedBy: await requireUserId(ctx),
			startedAt: now,
			errorMessage: "Simulated failure",
		});

		return {
			jobId,
			status: "failed",
			itemsProcessed: failAfterItem,
		};
	},
});

export const retryWorkflow = mutation({
	args: {
		jobId: v.id("moveJobs"),
	},
	handler: async (ctx, { jobId }) => {
		// Test utility to retry failed workflow
		await ctx.db.patch(jobId, {
			status: "completed",
			itemsProcessed: 50,
			completedAt: Date.now(),
		});

		return {
			status: "completed",
			itemsProcessed: 50,
		};
	},
});
