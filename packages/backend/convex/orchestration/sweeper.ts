import { cronJobs } from "convex/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalMutation } from "../_generated/server";
import { updateRunStatus } from "./core";
import { ERROR_CODES, type ErrorCode, isRetryableError } from "./stateMachine";

/**
 * Timeout stalled runs that haven't had activity for too long
 */
export const timeoutStalledRuns = internalMutation({
	args: {
		workspaceId: v.id("workspaces"), // Required - always process within workspace scope
	},
	returns: v.object({
		processed: v.number(),
		timedOut: v.number(),
	}),
	handler: async (ctx, args) => {
		const now = Date.now();
		const timeoutThreshold = 15 * 60 * 1000; // 15 minutes
		const cutoff = now - timeoutThreshold;

		// Find runs that are active but haven't had activity recently
		const stalledRuns = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_lastEvent", (q) =>
				q.eq("workspaceId", args.workspaceId),
			)
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
			.take(100);

		let timedOut = 0;

		for (const run of stalledRuns) {
			// Check if agent has recent heartbeat
			const recentHeartbeat = await ctx.db
				.query("agentHeartbeats")
				.withIndex("by_workspace_agent", (q) =>
					q.eq("workspaceId", run.workspaceId).eq("agentId", run.assignedTo),
				)
				.order("desc")
				.first();

			// If no recent heartbeat, consider the run stalled
			const agentLastSeen = recentHeartbeat?.at ?? 0;
			if (agentLastSeen < cutoff) {
				try {
					await updateRunStatus(
						ctx,
						run,
						"timed_out",
						ERROR_CODES.TIMEOUT,
						`Run timed out after ${timeoutThreshold / 1000} seconds of inactivity`,
					);

					// Create timeout event
					await ctx.db.insert("orchestrationEvents", {
						workspaceId: run.workspaceId,
						runId: run.runId,
						eventId: crypto.randomUUID(),
						type: "run.timed_out",
						timestamp: now,
						data: {
							reason: "inactivity_timeout",
							lastEventAt: run.lastEventAt,
							agentLastSeen,
						},
						ttl: now + 30 * 24 * 60 * 60 * 1000,
						createdAt: now,
					});

					timedOut++;
				} catch (error) {
					console.error(`Failed to timeout run ${run.runId}:`, error);
				}
			}
		}

		return {
			processed: stalledRuns.length,
			timedOut,
		};
	},
});

/**
 * Process queued runs and assign them to available agents
 */
export const processQueuedRuns = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	returns: v.object({
		processed: v.number(),
		assigned: v.number(),
	}),
	handler: async (ctx, args) => {
		// Get queued runs ordered by creation time (FIFO)
		const queuedRuns = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_status", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("status", "queued"),
			)
			.take(50);

		let assigned = 0;

		for (const run of queuedRuns) {
			try {
				// Check if agent is available
				const agent = await ctx.db
					.query("agents")
					.withIndex("by_workspace_agentId", (q) =>
						q.eq("workspaceId", run.workspaceId).eq("agentId", run.assignedTo),
					)
					.first();

				if (!agent || !agent.isActive) {
					// Agent no longer available, fail the run
					await updateRunStatus(
						ctx,
						run,
						"failed",
						ERROR_CODES.AGENT_UNAVAILABLE,
						"Agent is no longer available",
					);
					continue;
				}

				// Count active runs for this agent
				const activeRuns = await ctx.db
					.query("orchestrationRuns")
					.withIndex("by_workspace_status", (q) =>
						q.eq("workspaceId", run.workspaceId),
					)
					.filter((q) =>
						q.and(
							q.eq(q.field("assignedTo"), run.assignedTo),
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

				if (activeRuns.length < maxConcurrency) {
					// Agent has capacity, assign the run
					await updateRunStatus(ctx, run, "assigned");

					// Create assignment event
					await ctx.db.insert("orchestrationEvents", {
						workspaceId: run.workspaceId,
						runId: run.runId,
						eventId: crypto.randomUUID(),
						type: "run.assigned",
						timestamp: Date.now(),
						data: {
							agentId: run.assignedTo,
							fromQueue: true,
						},
						ttl: Date.now() + 30 * 24 * 60 * 60 * 1000,
						createdAt: Date.now(),
					});

					assigned++;
				}
				// If no capacity, leave in queue for next cycle
			} catch (error) {
				console.error(`Failed to process queued run ${run.runId}:`, error);
			}
		}

		return {
			processed: queuedRuns.length,
			assigned,
		};
	},
});

/**
 * Retry timed out runs if they're eligible
 */
export const retryTimedOutRuns = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	returns: v.object({
		processed: v.number(),
		retried: v.number(),
	}),
	handler: async (ctx, args) => {
		// Get timed out runs that haven't exceeded retry limit
		const timedOutRuns = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_status", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("status", "timed_out"),
			)
			.take(50);

		let retried = 0;

		for (const run of timedOutRuns) {
			try {
				// Check if error is retryable
				if (!run.errorCode || !isRetryableError(run.errorCode as ErrorCode)) {
					continue;
				}

				// Check retry limit
				const maxRetries = 3; // Default retry limit
				const retryCount = run.retryCount ?? 0;

				if (retryCount >= maxRetries) {
					// Mark as permanently failed
					await updateRunStatus(
						ctx,
						run,
						"failed",
						ERROR_CODES.TIMEOUT,
						`Maximum retry limit (${maxRetries}) exceeded`,
					);
					continue;
				}

				// Add exponential backoff delay
				const backoffDelay = 2 ** retryCount * 60 * 1000; // 1min, 2min, 4min, etc.
				const eligibleAt = (run.endedAt ?? Date.now()) + backoffDelay;

				if (Date.now() < eligibleAt) {
					continue; // Not yet eligible for retry
				}

				// Queue for retry
				await ctx.db.patch(run._id, {
					status: "queued",
					retryCount: retryCount + 1,
					errorCode: undefined,
					errorMessage: undefined,
					endedAt: undefined,
				});

				// Create retry event
				await ctx.db.insert("orchestrationEvents", {
					workspaceId: run.workspaceId,
					runId: run.runId,
					eventId: crypto.randomUUID(),
					type: "run.retry",
					timestamp: Date.now(),
					data: {
						retryCount: retryCount + 1,
						reason: "timeout_retry",
						backoffDelay,
					},
					ttl: Date.now() + 30 * 24 * 60 * 60 * 1000,
					createdAt: Date.now(),
				});

				retried++;
			} catch (error) {
				console.error(`Failed to retry run ${run.runId}:`, error);
			}
		}

		return {
			processed: timedOutRuns.length,
			retried,
		};
	},
});

/**
 * Clean up expired events and artifacts
 */
export const cleanupExpired = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	returns: v.object({
		eventsDeleted: v.number(),
		artifactsMarkedForDeletion: v.number(),
	}),
	handler: async (ctx, args) => {
		const now = Date.now();

		// Delete expired events (TTL based)
		const expiredEvents = await ctx.db
			.query("orchestrationEvents")
			.filter((q) =>
				q.and(
					q.eq(q.field("workspaceId"), args.workspaceId),
					q.neq(q.field("ttl"), undefined),
					q.lt(q.field("ttl"), now),
				),
			)
			.take(100);

		for (const event of expiredEvents) {
			await ctx.db.delete(event._id);
		}

		// Mark expired artifacts for deletion
		const expiredArtifacts = await ctx.db
			.query("orchestrationArtifacts")
			.withIndex("by_workspace_expires", (q) =>
				q.eq("workspaceId", args.workspaceId).lt("expiresAt", now),
			)
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.take(50);

		for (const artifact of expiredArtifacts) {
			await ctx.db.patch(artifact._id, {
				deletedAt: now,
			});
		}

		return {
			eventsDeleted: expiredEvents.length,
			artifactsMarkedForDeletion: expiredArtifacts.length,
		};
	},
});

/**
 * Ping agent health endpoints (optional outbound checks)
 */
export const pingAgentHealth = internalAction({
	args: {},
	returns: v.object({
		agentsPinged: v.number(),
		healthyAgents: v.number(),
	}),
	handler: async (_ctx) => {
		// For now, skip agent health pings until we have the proper API generated
		// Agent health ping function - currently a no-op until agents provide health endpoints
		// Implementation will be added when agents provide health endpoints

		return {
			agentsPinged: 0,
			healthyAgents: 0,
		};
	},
});

/**
 * Scheduled jobs configuration
 *
 * Note: These schedules reference internal functions that will be available
 * after Convex codegen runs and generates the internal API.
 */
const crons = cronJobs();

// Cron jobs - commented out until Convex codegen generates the internal API

// Run every 5 minutes
// crons.interval("timeout stalled runs", { minutes: 5 }, internal.orchestration.sweeper.timeoutStalledRuns, {});

// Run every minute
// crons.interval("process queued runs", { minutes: 1 }, internal.orchestration.sweeper.processQueuedRuns, {});

// Run every 10 minutes
// crons.interval("retry timed out runs", { minutes: 10 }, internal.orchestration.sweeper.retryTimedOutRuns, {});

// Run every hour
// crons.interval("cleanup expired data", { hours: 1 }, internal.orchestration.sweeper.cleanupExpired, {});

// Run every 5 minutes (optional)
// crons.interval("ping agent health", { minutes: 5 }, internal.orchestration.sweeper.pingAgentHealth, {});

export default crons;
