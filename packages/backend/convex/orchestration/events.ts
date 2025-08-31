import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { assertMember } from "../helpers";
import { requireUserId } from "../server/lib/authz";
import { getRun, updateRunStatus } from "./core";
import {
	canTransition,
	ERROR_CODES,
	eventTypeToStatus,
	type RunStatus,
} from "./stateMachine";

// HMAC verification for webhook security
async function verifyHmacSignature(
	payload: string,
	signature: string,
	secret: string,
): Promise<boolean> {
	try {
		// Extract timestamp and signature from header: "t=1234567890,v1=signature"
		const elements = signature.split(",");
		const timestamp = elements.find((el) => el.startsWith("t="))?.substring(2);
		const sig = elements.find((el) => el.startsWith("v1="))?.substring(3);

		if (!timestamp || !sig) {
			return false;
		}

		// Check clock skew (reject if > 5 minutes)
		const now = Math.floor(Date.now() / 1000);
		const timestampInt = Number.parseInt(timestamp, 10);
		const clockSkew = Math.abs(now - timestampInt);

		if (clockSkew > 300) {
			// 5 minutes
			return false;
		}

		// Create the payload to verify
		const payloadToVerify = `${timestamp}.${payload}`;
		const encoder = new TextEncoder();

		// Import the secret key
		const key = await crypto.subtle.importKey(
			"raw",
			encoder.encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		);

		// Generate expected signature
		const expectedSigBuffer = await crypto.subtle.sign(
			"HMAC",
			key,
			encoder.encode(payloadToVerify),
		);

		// Convert to hex string
		const expectedSig = Array.from(new Uint8Array(expectedSigBuffer))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		// Compare signatures (constant time comparison)
		return expectedSig === sig;
	} catch (error) {
		console.error("HMAC verification error:", error);
		return false;
	}
}

/**
 * Ingest event from agent with HMAC verification and idempotency
 */
export const ingestEvent = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		eventId: v.string(),
		type: v.string(),
		timestamp: v.number(),
		data: v.any(),
		hmacSignature: v.optional(v.string()), // x-pulse-signature header
	},
	returns: v.object({
		ok: v.boolean(),
		deduped: v.optional(v.boolean()),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			// Get webhook secret from environment
			const webhookSecret = process.env.PULSE_WEBHOOK_SECRET;
			if (!webhookSecret) {
				throw new Error("Webhook secret not configured");
			}

			// Verify HMAC signature if provided
			if (args.hmacSignature) {
				const payload = JSON.stringify({
					runId: args.runId,
					eventId: args.eventId,
					type: args.type,
					timestamp: args.timestamp,
					data: args.data,
				});

				if (
					!(await verifyHmacSignature(
						payload,
						args.hmacSignature,
						webhookSecret,
					))
				) {
					return {
						ok: false,
						error: ERROR_CODES.HMAC_VERIFICATION_FAILED,
					};
				}
			}

			// Check for replay attacks (dedupe)
			const existingEvent = await ctx.db
				.query("orchestrationEvents")
				.withIndex("dedupe", (q) =>
					q
						.eq("workspaceId", args.workspaceId)
						.eq("runId", args.runId)
						.eq("eventId", args.eventId),
				)
				.first();

			if (existingEvent) {
				return { ok: true, deduped: true };
			}

			// Get the run
			const run = await getRun(ctx, args.workspaceId, args.runId);

			// Determine if this event changes run status
			const newStatus = eventTypeToStatus(args.type);

			// Validate state transition if status changes
			if (newStatus && !canTransition(run.status as RunStatus, newStatus)) {
				throw new Error(
					`Illegal transition ${run.status} -> ${newStatus} for run ${args.runId}`,
				);
			}

			// Calculate TTL (30 days from now)
			const ttl = Date.now() + 30 * 24 * 60 * 60 * 1000;

			// Insert event
			await ctx.db.insert("orchestrationEvents", {
				workspaceId: args.workspaceId,
				runId: args.runId,
				eventId: args.eventId,
				type: args.type,
				timestamp: args.timestamp,
				data: args.data,
				ttl,
				createdAt: Date.now(),
			});

			// Update run if status changes
			if (newStatus) {
				await updateRunStatus(ctx, run, newStatus);

				// Handle special cases
				if (args.type === "run.completed" && args.data?.artifacts) {
					// Register artifacts
					for (const artifact of args.data.artifacts) {
						const retentionDays = artifact.retentionDays ?? 90;
						const expiresAt = Date.now() + retentionDays * 24 * 60 * 60 * 1000;

						await ctx.db.insert("orchestrationArtifacts", {
							workspaceId: args.workspaceId,
							artifactId: artifact.artifactId,
							runId: args.runId,
							type: artifact.type,
							uri: artifact.uri,
							hash: artifact.hash,
							sizeBytes: artifact.sizeBytes,
							retentionDays,
							expiresAt,
							createdAt: Date.now(),
						});
					}
				}

				if (args.type === "run.failed" && args.data?.errorCode) {
					// Update run with error details
					await ctx.db.patch(run._id, {
						errorCode: args.data.errorCode,
						errorMessage: args.data.errorMessage,
					});
				}
			} else {
				// Just update lastEventAt for non-status-changing events
				await ctx.db.patch(run._id, {
					lastEventAt: Date.now(),
				});
			}

			// Update agent heartbeat if this is from an agent
			if (args.type === "run.progress" || args.type === "run.heartbeat") {
				const recentHeartbeats = await ctx.db
					.query("agentHeartbeats")
					.withIndex("by_workspace_agent", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("agentId", run.assignedTo),
					)
					.order("desc")
					.take(1);

				if (
					recentHeartbeats.length === 0 ||
					Date.now() - recentHeartbeats[0].at > 60000
				) {
					// Insert new heartbeat if none exists or last one is > 1 min old
					await ctx.db.insert("agentHeartbeats", {
						workspaceId: args.workspaceId,
						agentId: run.assignedTo,
						at: Date.now(),
						metrics: args.data?.metrics,
					});
				}
			}

			// Update agent health status
			if (newStatus === "completed" || newStatus === "failed") {
				const agent = await ctx.db
					.query("agents")
					.withIndex("by_workspace_agentId", (q) =>
						q.eq("workspaceId", args.workspaceId).eq("agentId", run.assignedTo),
					)
					.first();

				if (agent?.health) {
					await ctx.db.patch(agent._id, {
						health: {
							...agent.health,
							lastHeartbeatAt: Date.now(),
						},
					});
				}
			}

			return { ok: true };
		} catch (error) {
			console.error("Error ingesting event:", error);
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});

/**
 * List events for a run (real-time subscription friendly)
 */
export const listEvents = query({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		limit: v.optional(v.number()),
		cursor: v.optional(v.number()), // timestamp cursor for pagination
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("orchestrationEvents")
			.withIndex("by_workspace_run_time", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("runId", args.runId),
			)
			.order("asc");

		// Apply cursor for pagination
		if (args.cursor) {
			query = query.filter((q) => q.gt(q.field("timestamp"), args.cursor!));
		}

		const events = await query.take(args.limit ?? 100);

		return {
			events,
			nextCursor:
				events.length > 0 ? events[events.length - 1].timestamp : null,
			hasMore: events.length === (args.limit ?? 100),
		};
	},
});

/**
 * Watch events for a run (real-time subscription)
 */
export const watchEvents = query({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		// Return all events - Convex handles real-time updates
		const events = await ctx.db
			.query("orchestrationEvents")
			.withIndex("by_workspace_run_time", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("runId", args.runId),
			)
			.order("asc")
			.collect();

		return events;
	},
});

/**
 * Get event statistics for a run
 */
export const getEventStats = query({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const events = await ctx.db
			.query("orchestrationEvents")
			.withIndex("by_workspace_run_time", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("runId", args.runId),
			)
			.collect();

		const stats = {
			total: events.length,
			byType: {} as Record<string, number>,
			firstEvent: events[0]?.timestamp ?? null,
			lastEvent: events[events.length - 1]?.timestamp ?? null,
		};

		for (const event of events) {
			stats.byType[event.type] = (stats.byType[event.type] ?? 0) + 1;
		}

		return stats;
	},
});
