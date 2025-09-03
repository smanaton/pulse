import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { assertMember } from "../helpers";
import { requireUserId } from "../server/lib/authz";
import { getRun, updateRunStatus } from "./core";
import {
	type ControlCommand,
	canTransition,
	ERROR_CODES,
	type RunStatus,
} from "./stateMachine";

/**
 * Emit a control event to an agent
 */
import type { MutationCtx } from "../_generated/server";
async function emitControlEvent(
	ctx: MutationCtx,
	workspaceId: Id<"workspaces">,
	runId: string,
	command: ControlCommand,
	data?: Record<string, unknown>,
): Promise<void> {
	const eventId = crypto.randomUUID();

	await ctx.db.insert("orchestrationEvents", {
		workspaceId,
		runId,
		eventId,
		type: command,
		timestamp: Date.now(),
		data: data ?? {},
		ttl: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
		createdAt: Date.now(),
	});
}

/**
 * Pause a run
 */
export const pauseRun = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		reason: v.optional(v.string()),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const _userId = await requireUserId(ctx);
			await assertMember(ctx, args.workspaceId);

			const run = await getRun(ctx, args.workspaceId, args.runId);

			// Check if transition is valid
			if (!canTransition(run.status as RunStatus, "paused")) {
				return {
					ok: false,
					error: `Cannot pause run in ${run.status} state`,
				};
			}

			// Update run with command tracking
			await ctx.db.patch(run._id, {
				lastCommand: {
					type: "run.pause",
					issuedAt: Date.now(),
				},
			});

			// Emit control event
			await emitControlEvent(ctx, args.workspaceId, args.runId, "run.pause", {
				reason: args.reason,
			});

			// Note: Don't update status immediately - wait for agent acknowledgment
			// The agent should respond with a run.paused event

			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});

/**
 * Resume a paused run
 */
export const resumeRun = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const _userId = await requireUserId(ctx);
			await assertMember(ctx, args.workspaceId);

			const run = await getRun(ctx, args.workspaceId, args.runId);

			// Check if transition is valid (paused -> started)
			if (!canTransition(run.status as RunStatus, "started")) {
				return {
					ok: false,
					error: `Cannot resume run in ${run.status} state`,
				};
			}

			// Update run with command tracking
			await ctx.db.patch(run._id, {
				lastCommand: {
					type: "run.resume",
					issuedAt: Date.now(),
				},
			});

			// Emit control event
			await emitControlEvent(ctx, args.workspaceId, args.runId, "run.resume");

			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});

/**
 * Cancel a run
 */
export const cancelRun = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		reason: v.optional(v.string()),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const _userId = await requireUserId(ctx);
			await assertMember(ctx, args.workspaceId);

			const run = await getRun(ctx, args.workspaceId, args.runId);

			// Can cancel from most states except completed/failed
			if (run.status === "completed" || run.status === "failed") {
				return {
					ok: false,
					error: `Cannot cancel run that is ${run.status}`,
				};
			}

			// Update run with command tracking (immediately acknowledged since it executes synchronously)
			await ctx.db.patch(run._id, {
				lastCommand: {
					type: "run.cancel",
					issuedAt: Date.now(),
					acknowledgedAt: Date.now(),
				},
			});

			// Emit control event
			await emitControlEvent(ctx, args.workspaceId, args.runId, "run.cancel", {
				reason: args.reason,
			});

			// Immediately mark as failed with cancellation reason
			await updateRunStatus(
				ctx,
				run,
				"failed",
				ERROR_CODES.AGENT_ERROR,
				`Cancelled: ${args.reason ?? "User requested"}`,
			);

			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});

/**
 * Retry a failed run
 */
export const retryRun = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const _userId = await requireUserId(ctx);
			await assertMember(ctx, args.workspaceId);

			const run = await getRun(ctx, args.workspaceId, args.runId);

			// Can only retry failed or timed_out runs
			if (run.status !== "failed" && run.status !== "timed_out") {
				return {
					ok: false,
					error: `Cannot retry run in ${run.status} state`,
				};
			}

			// Check retry count
			const maxRetries = 3; // Default retry limit
			const retryCount = run.retryCount ?? 0;

			if (retryCount >= maxRetries) {
				return {
					ok: false,
					error: `Maximum retry limit (${maxRetries}) reached`,
				};
			}

			// Update run with command tracking and increment retry count
			await ctx.db.patch(run._id, {
				lastCommand: {
					type: "run.retry",
					issuedAt: Date.now(),
				},
				retryCount: retryCount + 1,
				status: "queued", // Queue for retry
				errorCode: undefined, // Clear previous error
				errorMessage: undefined,
			});

			// Emit control event
			await emitControlEvent(ctx, args.workspaceId, args.runId, "run.retry", {
				retryCount: retryCount + 1,
			});

			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});

/**
 * Acknowledge a command (called by agent)
 */
export const acknowledgeCommand = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		commandType: v.union(
			v.literal("run.pause"),
			v.literal("run.resume"),
			v.literal("run.cancel"),
			v.literal("run.retry"),
		),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			// Note: This would typically be called by an agent via API key auth
			// For now, we'll skip user auth validation

			const run = await getRun(ctx, args.workspaceId, args.runId);

			// Update command acknowledgment
			if (
				run.lastCommand &&
				run.lastCommand.type === args.commandType &&
				!run.lastCommand.acknowledgedAt
			) {
				await ctx.db.patch(run._id, {
					lastCommand: {
						...run.lastCommand,
						acknowledgedAt: Date.now(),
					},
				});

				// Emit acknowledgment event
				await ctx.db.insert("orchestrationEvents", {
					workspaceId: args.workspaceId,
					runId: args.runId,
					eventId: crypto.randomUUID(),
					type: "command.acked",
					timestamp: Date.now(),
					data: {
						command: args.commandType,
						acknowledgedAt: Date.now(),
					},
					ttl: Date.now() + 30 * 24 * 60 * 60 * 1000,
					createdAt: Date.now(),
				});

				return { ok: true };
			}

			return {
				ok: false,
				error: "No matching pending command found",
			};
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});

/**
 * List pending commands for an agent
 */
export const listPendingCommands = query({
	args: {
		workspaceId: v.id("workspaces"),
		agentId: v.string(),
	},
	handler: async (ctx, args) => {
		// Note: This would typically be called by an agent via API key auth

		const runs = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_status", (q) =>
				q.eq("workspaceId", args.workspaceId),
			)
			.filter((q) =>
				q.and(
					q.eq(q.field("assignedTo"), args.agentId),
					q.neq(q.field("lastCommand"), undefined),
				),
			)
			.collect();

		const pendingCommands = runs
			.filter((run) => run.lastCommand && !run.lastCommand.acknowledgedAt)
			.map((run) => ({
				runId: run.runId,
				command: run.lastCommand?.type,
				issuedAt: run.lastCommand?.issuedAt,
			}));

		return pendingCommands;
	},
});

/**
 * Get command status for a run
 */
export const getCommandStatus = query({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const run = await getRun(ctx, args.workspaceId, args.runId);

		return {
			lastCommand: run.lastCommand ?? null,
			isPending: !!(run.lastCommand && !run.lastCommand.acknowledgedAt),
		};
	},
});
