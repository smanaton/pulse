import { v } from "convex/values";
import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "../_generated/server";
import { assertMember } from "../helpers";
import { requireUserId } from "../server/lib/authz";

/**
 * Upsert an agent (register or update)
 */
export const upsertAgent = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		agent: v.object({
			agentId: v.string(),
			name: v.string(),
			description: v.optional(v.string()),
			owner: v.string(), // "vendor:acme" | "internal:pulse"
			version: v.string(),
			capabilities: v.array(v.string()),
			accepts: v.array(
				v.object({
					capability: v.string(),
					inputSchemaRef: v.string(),
					outputSchemaRef: v.string(),
				}),
			),
			auth: v.object({
				methods: v.array(v.string()),
			}),
			endpoints: v.object({
				baseUrl: v.string(),
			}),
			maxConcurrency: v.optional(v.number()),
		}),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const userId = await requireUserId(ctx);
			await assertMember(ctx, args.workspaceId);

			// Check if agent already exists
			const existing = await ctx.db
				.query("agents")
				.withIndex("by_workspace_agentId", (q) =>
					q
						.eq("workspaceId", args.workspaceId)
						.eq("agentId", args.agent.agentId),
				)
				.first();

			if (existing) {
				// Update existing agent
				await ctx.db.patch(existing._id, {
					name: args.agent.name,
					description: args.agent.description,
					type: "external",
					owner: args.agent.owner,
					version: args.agent.version,
					capabilities: args.agent.capabilities,
					accepts: args.agent.accepts,
					auth: args.agent.auth,
					endpoints: args.agent.endpoints,
					health: {
						status: "up",
						lastHeartbeatAt: Date.now(),
						queueLength: 0,
						maxConcurrency: args.agent.maxConcurrency ?? 5,
					},
					updatedAt: Date.now(),
				});
			} else {
				// Create new agent
				await ctx.db.insert("agents", {
					workspaceId: args.workspaceId,
					agentId: args.agent.agentId,
					name: args.agent.name,
					description: args.agent.description,
					type: "external",
					owner: args.agent.owner,
					version: args.agent.version,
					capabilities: args.agent.capabilities,
					config: {},
					accepts: args.agent.accepts,
					auth: args.agent.auth,
					endpoints: args.agent.endpoints,
					health: {
						status: "up",
						lastHeartbeatAt: Date.now(),
						queueLength: 0,
						maxConcurrency: args.agent.maxConcurrency ?? 5,
					},
					isActive: true,
					createdBy: userId,
					lastUsedAt: Date.now(),
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			}

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
 * List agents for a workspace
 */
export const listAgents = query({
	args: {
		workspaceId: v.id("workspaces"),
		type: v.optional(
			v.union(
				v.literal("assistant"),
				v.literal("automation"),
				v.literal("researcher"),
				v.literal("writer"),
				v.literal("external"),
			),
		),
		capability: v.optional(v.string()),
		onlyActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("agents")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

		if (args.type) {
			query = query.filter((q) => q.eq(q.field("type"), args.type));
		}

		if (args.onlyActive !== false) {
			query = query.filter((q) => q.eq(q.field("isActive"), true));
		}

		let agents = await query.collect();

		// Filter by capability if specified
		if (args.capability) {
			agents = agents.filter((agent) =>
				agent.capabilities.includes(args.capability!),
			);
		}

		return agents;
	},
});

/**
 * Get agent by ID
 */
export const getAgent = query({
	args: {
		workspaceId: v.id("workspaces"),
		agentId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const agent = await ctx.db
			.query("agents")
			.withIndex("by_workspace_agentId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("agentId", args.agentId),
			)
			.first();

		if (!agent) {
			throw new Error("Agent not found");
		}

		return agent;
	},
});

/**
 * Match agents by capability
 */
export const matchCapability = query({
	args: {
		workspaceId: v.id("workspaces"),
		capability: v.string(),
		excludeAgentIds: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let agents = await ctx.db
			.query("agents")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) => q.eq(q.field("isActive"), true))
			.collect();

		// Filter by capability and exclusions
		agents = agents.filter(
			(agent) =>
				agent.capabilities.includes(args.capability) &&
				(!args.excludeAgentIds ||
					!args.excludeAgentIds.includes(agent.agentId!)),
		);

		// Sort by health and load
		agents.sort((a, b) => {
			// Prefer healthy agents
			if (a.health?.status !== b.health?.status) {
				return a.health?.status === "up" ? -1 : 1;
			}

			// Prefer agents with lower queue length
			const aQueue = a.health?.queueLength ?? 0;
			const bQueue = b.health?.queueLength ?? 0;
			return aQueue - bQueue;
		});

		return agents;
	},
});

/**
 * Update agent health status
 */
export const updateAgentHealth = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		agentId: v.string(),
		status: v.union(v.literal("up"), v.literal("down")),
		metrics: v.optional(
			v.object({
				activeRuns: v.optional(v.number()),
				queuedRuns: v.optional(v.number()),
				cpuPercent: v.optional(v.number()),
				memoryPercent: v.optional(v.number()),
				errors: v.optional(v.number()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const agent = await ctx.db
			.query("agents")
			.withIndex("by_workspace_agentId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("agentId", args.agentId),
			)
			.first();

		if (!agent) {
			throw new Error("Agent not found");
		}

		const newHealth = {
			...agent.health,
			status: args.status,
			lastHeartbeatAt: Date.now(),
		};

		if (args.metrics) {
			Object.assign(newHealth, args.metrics);
		}

		await ctx.db.patch(agent._id, {
			health: newHealth,
			updatedAt: Date.now(),
		});

		// Record heartbeat
		await ctx.db.insert("agentHeartbeats", {
			workspaceId: args.workspaceId,
			agentId: args.agentId,
			at: Date.now(),
			metrics: args.metrics,
		});
	},
});

/**
 * Deactivate an agent
 */
export const deactivateAgent = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		agentId: v.string(),
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

			const agent = await ctx.db
				.query("agents")
				.withIndex("by_workspace_agentId", (q) =>
					q.eq("workspaceId", args.workspaceId).eq("agentId", args.agentId),
				)
				.first();

			if (!agent) {
				return {
					ok: false,
					error: "Agent not found",
				};
			}

			// Mark as inactive
			await ctx.db.patch(agent._id, {
				isActive: false,
				health: {
					...agent.health,
					status: "down",
				},
				updatedAt: Date.now(),
			});

			// Cancel any active runs assigned to this agent
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
							q.eq(q.field("status"), "queued"),
						),
					),
				)
				.collect();

			for (const run of activeRuns) {
				await ctx.db.patch(run._id, {
					status: "failed",
					errorCode: "AGENT_UNAVAILABLE",
					errorMessage: `Agent deactivated: ${args.reason ?? "No reason provided"}`,
					endedAt: Date.now(),
				});
			}

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
 * Get agent statistics
 */
export const getAgentStats = query({
	args: {
		workspaceId: v.id("workspaces"),
		agentId: v.string(),
		timeRange: v.optional(v.number()), // Hours to look back
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const agent = await ctx.db
			.query("agents")
			.withIndex("by_workspace_agentId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("agentId", args.agentId),
			)
			.first();

		if (!agent) {
			throw new Error("Agent not found");
		}

		const timeRange = args.timeRange ?? 24; // Default 24 hours
		const since = Date.now() - timeRange * 60 * 60 * 1000;

		// Get runs for this agent in time range
		const runs = await ctx.db
			.query("orchestrationRuns")
			.withIndex("by_workspace_status", (q) =>
				q.eq("workspaceId", args.workspaceId),
			)
			.filter((q) =>
				q.and(
					q.eq(q.field("assignedTo"), args.agentId),
					q.gt(q.field("createdAt"), since),
				),
			)
			.collect();

		// Calculate stats
		let completedRuns = 0;
		let failedRuns = 0;
		let activeRuns = 0;
		let totalDuration = 0;

		for (const run of runs) {
			if (run.status === "completed") {
				completedRuns++;
				if (run.startedAt && run.endedAt) {
					totalDuration += run.endedAt - run.startedAt;
				}
			} else if (run.status === "failed") {
				failedRuns++;
			} else if (
				["assigned", "started", "progress", "blocked", "paused"].includes(
					run.status,
				)
			) {
				activeRuns++;
			}
		}

		const avgDuration = completedRuns > 0 ? totalDuration / completedRuns : 0;
		const successRate = runs.length > 0 ? completedRuns / runs.length : 0;

		// Get recent heartbeats
		const recentHeartbeats = await ctx.db
			.query("agentHeartbeats")
			.withIndex("by_workspace_agent", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("agentId", args.agentId),
			)
			.filter((q) => q.gt(q.field("at"), since))
			.order("desc")
			.take(10);

		return {
			agent: {
				agentId: agent.agentId,
				name: agent.name,
				status: agent.health?.status ?? "unknown",
				lastHeartbeat: agent.health?.lastHeartbeatAt,
			},
			runs: {
				total: runs.length,
				completed: completedRuns,
				failed: failedRuns,
				active: activeRuns,
				successRate,
				avgDurationMs: avgDuration,
			},
			heartbeats: recentHeartbeats,
		};
	},
});

/**
 * List external agents (for internal use)
 */
export const listExternalAgents = internalQuery({
	args: {},
	handler: async (ctx) => {
		const agents = await ctx.db
			.query("agents")
			.filter((q) => q.eq(q.field("type"), "external"))
			.collect();

		return agents;
	},
});

/**
 * Get workspace agent overview
 */
export const getWorkspaceAgentOverview = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const agents = await ctx.db
			.query("agents")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();

		const stats = {
			total: agents.length,
			active: 0,
			healthy: 0,
			external: 0,
			byType: {} as Record<string, number>,
			capabilities: new Set<string>(),
		};

		for (const agent of agents) {
			if (agent.isActive) {
				stats.active++;
			}

			if (agent.health?.status === "up") {
				stats.healthy++;
			}

			if (agent.type === "external") {
				stats.external++;
			}

			stats.byType[agent.type] = (stats.byType[agent.type] ?? 0) + 1;

			for (const capability of agent.capabilities) {
				stats.capabilities.add(capability);
			}
		}

		return {
			...stats,
			capabilities: Array.from(stats.capabilities),
		};
	},
});
