import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireUserId } from "../server/lib/authz";
import { assertMember } from "../helpers";
import type { Doc, Id } from "../_generated/dataModel";

/**
 * Real-time subscription for run board/dashboard
 * Returns all runs for a workspace with live updates
 */
export const watchRunBoard = query({
	args: {
		workspaceId: v.id("workspaces"),
		status: v.optional(
			v.union(
				v.literal("assigned"),
				v.literal("started"),
				v.literal("progress"),
				v.literal("blocked"),
				v.literal("paused"),
				v.literal("completed"),
				v.literal("failed"),
				v.literal("queued"),
				v.literal("timed_out"),
			),
		),
		agentId: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_status", (q) => q.eq("workspaceId", args.workspaceId));

		if (args.status) {
			query = query.filter((q) => q.eq(q.field("status"), args.status));
		}

		if (args.agentId) {
			query = query.filter((q) => q.eq(q.field("assignedTo"), args.agentId));
		}

		const runs = await query.order("desc").take(args.limit ?? 100);

		// Enrich with job information
		const enrichedRuns = await Promise.all(
			runs.map(async (run) => {
				const job = await ctx.db
					.query("orchestrationJobs")
					.withIndex("by_workspace_jobId", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("jobId", run.jobId),
					)
					.first();

				const agent = await ctx.db
					.query("agents")
					.withIndex("by_workspace_agentId", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("agentId", run.assignedTo),
					)
					.first();

				return {
					...run,
					job: job ? { intent: job.intent, createdAt: job.createdAt } : null,
					agent: agent ? { name: agent.name, type: agent.type } : null,
				};
			}),
		);

		return enrichedRuns;
	},
});

/**
 * Watch a specific run with real-time events
 */
export const watchRun = query({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		// Get run details
		const run = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_runId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("runId", args.runId),
			)
			.unique();

		if (!run) {
			throw new Error("Run not found");
		}

		// Get associated job
		const job = await ctx.db
			.query("orchestrationJobs")
			.withIndex("by_workspace_jobId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("jobId", run.jobId),
			)
			.first();

		// Get assigned agent
		const agent = await ctx.db
			.query("agents")
			.withIndex("by_workspace_agentId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("agentId", run.assignedTo),
			)
			.first();

		// Get recent events (last 50)
		const events = await ctx.db
			.query("orchestrationEvents")
			.withIndex("by_workspace_run_time", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("runId", args.runId),
			)
			.order("desc")
			.take(50);

		// Get artifacts
		const artifacts = await ctx.db
			.query("orchestrationArtifacts")
			.withIndex("by_run", (q) => q.eq("runId", args.runId))
			.collect();

		return {
			run,
			job,
			agent,
			events: events.reverse(), // Chronological order
			artifacts,
		};
	},
});

/**
 * Watch workspace orchestration dashboard
 */
export const watchOrchestrationDashboard = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		// Get run counts by status
		const runs = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_status", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();

		const runStats = {
			assigned: 0,
			started: 0,
			progress: 0,
			blocked: 0,
			paused: 0,
			completed: 0,
			failed: 0,
			queued: 0,
			timed_out: 0,
		};

		for (const run of runs) {
			runStats[run.status as keyof typeof runStats]++;
		}

		// Get recent jobs
		const recentJobs = await ctx.db
			.query("orchestrationJobs")
			.withIndex("by_workspace_created", (q) => q.eq("workspaceId", args.workspaceId))
			.order("desc")
			.take(10);

		// Get agent health overview
		const agents = await ctx.db
			.query("agents")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();

		const agentStats = {
			total: agents.length,
			healthy: agents.filter((a) => a.health?.status === "up").length,
			active: agents.filter((a) => a.isActive).length,
		};

		// Get recent events (activity feed)
		const recentEvents = await ctx.db
			.query("orchestrationEvents")
			.withIndex("by_workspace_run_time", (q) => q.eq("workspaceId", args.workspaceId))
			.order("desc")
			.take(20);

		return {
			runStats,
			recentJobs,
			agentStats,
			recentEvents,
		};
	},
});

/**
 * Watch stalled runs that need attention
 */
export const watchStalledRuns = query({
	args: {
		workspaceId: v.id("workspaces"),
		stalledThreshold: v.optional(v.number()), // Minutes
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const threshold = args.stalledThreshold ?? 15; // Default 15 minutes
		const cutoff = Date.now() - threshold * 60 * 1000;

		const stalledRuns = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_lastEvent", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) =>
				q.and(
					q.or(
						q.eq(q.field("status"), "started"),
						q.eq(q.field("status"), "progress"),
						q.eq(q.field("status"), "blocked"),
					),
					q.lt(q.field("lastEventAt"), cutoff),
				),
			)
			.collect();

		// Enrich with job and agent info
		const enrichedStalledRuns = await Promise.all(
			stalledRuns.map(async (run) => {
				const job = await ctx.db
					.query("orchestrationJobs")
					.withIndex("by_workspace_jobId", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("jobId", run.jobId),
					)
					.first();

				const agent = await ctx.db
					.query("agents")
					.withIndex("by_workspace_agentId", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("agentId", run.assignedTo),
					)
					.first();

				return {
					...run,
					stalledFor: Date.now() - (run.lastEventAt ?? run.createdAt),
					job: job ? { intent: job.intent } : null,
					agent: agent ? { name: agent.name, health: agent.health } : null,
				};
			}),
		);

		return enrichedStalledRuns;
	},
});

/**
 * Watch agent health status in real-time
 */
export const watchAgentHealth = query({
	args: {
		workspaceId: v.id("workspaces"),
		agentId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("agents")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

		if (args.agentId) {
			query = query.filter((q) => q.eq(q.field("agentId"), args.agentId));
		}

		const agents = await query.collect();

		// Enrich with recent heartbeats and active run counts
		const enrichedAgents = await Promise.all(
			agents.map(async (agent) => {
				// Get recent heartbeat
				const recentHeartbeat = await ctx.db
					.query("agentHeartbeats")
					.withIndex("by_workspace_agent", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("agentId", agent.agentId!),
					)
					.order("desc")
					.first();

				// Count active runs
				const activeRunCount = await ctx.db
					.query("orchestrationRuns")
					.withIndex("by_workspace_status", (q) => q.eq("workspaceId", args.workspaceId))
					.filter((q) =>
						q.and(
							q.eq(q.field("assignedTo"), agent.agentId!),
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

				return {
					...agent,
					activeRuns: activeRunCount.length,
					lastHeartbeat: recentHeartbeat?.at,
					metrics: recentHeartbeat?.metrics,
				};
			}),
		);

		return enrichedAgents;
	},
});

/**
 * Watch job progress (all runs for a job)
 */
export const watchJobProgress = query({
	args: {
		workspaceId: v.id("workspaces"),
		jobId: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		// Get job
		const job = await ctx.db
			.query("orchestrationJobs")
			.withIndex("by_workspace_jobId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("jobId", args.jobId),
			)
			.unique();

		if (!job) {
			throw new Error("Job not found");
		}

		// Get all runs for this job
		const runs = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_job", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("jobId", args.jobId),
			)
			.collect();

		// Get plan if exists
		const plan = job.planId
			? await ctx.db
					.query("orchestrationPlans")
					.withIndex("by_workspace_planId", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("planId", job.planId!),
					)
					.first()
			: null;

		// Calculate progress
		const totalSteps = plan?.steps.length ?? 1;
		const completedSteps = runs.filter((r) => r.status === "completed").length;
		const failedSteps = runs.filter((r) => r.status === "failed").length;
		const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

		return {
			job,
			plan,
			runs: runs.map((run) => ({
				...run,
				stepName: plan?.steps.find((s) => s.id === run.stepId)?.name ?? "Main",
			})),
			progress: {
				total: totalSteps,
				completed: completedSteps,
				failed: failedSteps,
				percentage: progress,
				isComplete: completedSteps === totalSteps,
				hasFailed: failedSteps > 0,
			},
		};
	},
});