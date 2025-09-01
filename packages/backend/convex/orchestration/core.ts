import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";
import { assertMember, checkRateLimit, incrementRateLimit } from "../helpers";
import { requireUserId } from "../server/lib/authz";
import {
	canTransition,
	type ErrorCode,
	isTerminal,
	type RunStatus,
} from "./stateMachine";

/**
 * Submit a new orchestration job
 */
export const submitJob = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		intent: v.string(),
		inputs: v.any(),
		constraints: v.optional(
			v.object({
				deadline: v.optional(v.string()),
				maxRetries: v.optional(v.number()),
				timeout: v.optional(v.number()),
			}),
		),
		artifactsDesired: v.optional(v.any()),
	},
	returns: v.object({
		jobId: v.string(),
		corrId: v.string(),
	}),
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		// Rate limiting
		const withinLimit = await checkRateLimit(
			ctx,
			userId,
			"ai_tokens_daily",
			args.workspaceId,
			10,
			60,
		);
		if (!withinLimit) {
			throw new ConvexError("Rate limit exceeded for orchestration jobs");
		}

		const corrId = crypto.randomUUID();
		const jobId = `job_${crypto.randomUUID()}`;

		// Create job
		await ctx.db.insert("orchestrationJobs", {
			workspaceId: args.workspaceId,
			jobId,
			corrId,
			intent: args.intent,
			inputs: args.inputs,
			constraints: args.constraints,
			artifactsDesired: args.artifactsDesired,
			createdBy: userId,
			createdAt: Date.now(),
		});

		// Log event
		await ctx.db.insert("events", {
			workspaceId: args.workspaceId,
			actorUserId: userId,
			type: "orchestration_job_created",
			entity: "orchestrationJob",
			entityId: jobId,
			meta: { intent: args.intent, corrId },
			createdAt: Date.now(),
		});

		// Increment rate limit counter
		await incrementRateLimit(
			ctx,
			userId,
			"ai_tokens_daily",
			args.workspaceId,
			60,
		);

		return { jobId, corrId };
	},
});

/**
 * Query job by ID
 */
export const queryJob = query({
	args: {
		workspaceId: v.id("workspaces"),
		jobId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const job = await ctx.db
			.query("orchestrationJobs")
			.withIndex("by_workspace_jobId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("jobId", args.jobId),
			)
			.unique();

		if (!job) {
			throw new Error("Job not found");
		}

		return job;
	},
});

/**
 * Assign a run to an agent
 */
export const assignRun = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		jobId: v.string(),
		stepId: v.optional(v.string()),
		agentId: v.string(),
		capability: v.string(),
		inputs: v.any(),
		scopes: v.array(v.string()),
	},
	returns: v.object({
		runId: v.string(),
	}),
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		// Verify job exists
		const job = await ctx.db
			.query("orchestrationJobs")
			.withIndex("by_workspace_jobId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("jobId", args.jobId),
			)
			.unique();

		if (!job) {
			throw new Error("Job not found");
		}

		// Verify agent exists and is active
		const agent = await ctx.db
			.query("agents")
			.withIndex("by_workspace_agentId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("agentId", args.agentId),
			)
			.first();

		if (!agent || !agent.isActive) {
			throw new Error("Agent not available");
		}

		// Check capability match
		if (!agent.capabilities.includes(args.capability)) {
			throw new Error("Agent does not support this capability");
		}

		// Check backpressure - count active runs for this agent
		const activeRuns = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_status", (q) =>
				q.eq("workspaceId", args.workspaceId),
			)
			.filter((q) =>
				q.and(
					q.eq(q.field("assignedTo"), args.agentId),
					q.or(
						q.eq(q.field("status"), "assigned"),
						q.eq(q.field("status"), "started"),
						q.eq(q.field("status"), "progress"),
						q.eq(q.field("status"), "blocked"),
						q.eq(q.field("status"), "paused"),
					),
				),
			)
			.collect();

		const maxConcurrency = agent.health?.maxConcurrency ?? 5;
		if (activeRuns.length >= maxConcurrency) {
			// Queue the run instead of assigning directly
			const runId = `run_${crypto.randomUUID()}`;
			await ctx.db.insert("orchestrationRuns", {
				workspaceId: args.workspaceId,
				runId,
				jobId: args.jobId,
				stepId: args.stepId,
				assignedTo: args.agentId,
				status: "queued",
				capabilityVersionUsed: args.capability,
				agentVersionUsed: agent.version,
				scopes: args.scopes,
				corrId: job.corrId,
				retryCount: 0,
				createdAt: Date.now(),
			});

			return { runId };
		}

		// Create run in assigned state
		const runId = `run_${crypto.randomUUID()}`;
		await ctx.db.insert("orchestrationRuns", {
			workspaceId: args.workspaceId,
			runId,
			jobId: args.jobId,
			stepId: args.stepId,
			assignedTo: args.agentId,
			status: "assigned",
			capabilityVersionUsed: args.capability,
			agentVersionUsed: agent.version,
			scopes: args.scopes,
			corrId: job.corrId,
			retryCount: 0,
			lastEventAt: Date.now(),
			createdAt: Date.now(),
		});

		// Log event
		await ctx.db.insert("events", {
			workspaceId: args.workspaceId,
			actorUserId: userId,
			type: "orchestration_run_assigned",
			entity: "orchestrationRun",
			entityId: runId,
			meta: {
				jobId: args.jobId,
				agentId: args.agentId,
				capability: args.capability,
				corrId: job.corrId,
			},
			createdAt: Date.now(),
		});

		// Agent notification will be handled by polling or webhooks

		return { runId };
	},
});

/**
 * Query run by ID
 */
export const queryRun = query({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const run = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_runId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("runId", args.runId),
			)
			.unique();

		if (!run) {
			throw new Error("Run not found");
		}

		return run;
	},
});

/**
 * List runs for a job
 */
export const listRunsForJob = query({
	args: {
		workspaceId: v.id("workspaces"),
		jobId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const runs = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_job", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("jobId", args.jobId),
			)
			.collect();

		return runs;
	},
});

/**
 * List jobs for workspace
 */
export const listJobs = query({
	args: {
		workspaceId: v.id("workspaces"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const jobs = await ctx.db
			.query("orchestrationJobs")
			.withIndex("by_workspace_created", (q) =>
				q.eq("workspaceId", args.workspaceId),
			)
			.order("desc")
			.take(args.limit ?? 50);

		return jobs;
	},
});

/**
 * Internal helper to get run by ID (for use in mutations)
 */
export async function getRun(
	ctx: MutationCtx | QueryCtx,
	workspaceId: Id<"workspaces">,
	runId: string,
): Promise<Doc<"orchestrationRuns">> {
	const run = await ctx.db
		.query("orchestrationRuns")
		.withIndex("by_workspace_runId", (q) =>
			q.eq("workspaceId", workspaceId).eq("runId", runId),
		)
		.unique();

	if (!run) {
		throw new Error("Run not found");
	}

	return run;
}

/**
 * Internal helper to update run status with validation
 */
export async function updateRunStatus(
	ctx: any,
	run: Doc<"orchestrationRuns">,
	newStatus: RunStatus,
	errorCode?: ErrorCode,
	errorMessage?: string,
): Promise<void> {
	// Validate transition
	if (!canTransition(run.status as RunStatus, newStatus)) {
		throw new Error(
			`Invalid transition from ${run.status} to ${newStatus} for run ${run.runId}`,
		);
	}

	const updateFields: any = {
		status: newStatus,
		lastEventAt: Date.now(),
	};

	// Set timing fields
	if (newStatus === "started" && !run.startedAt) {
		updateFields.startedAt = Date.now();
	}

	if (isTerminal(newStatus)) {
		updateFields.endedAt = Date.now();
	}

	// Set error info
	if (errorCode) {
		updateFields.errorCode = errorCode;
	}
	if (errorMessage) {
		updateFields.errorMessage = errorMessage;
	}

	await ctx.db.patch(run._id, updateFields);
}
