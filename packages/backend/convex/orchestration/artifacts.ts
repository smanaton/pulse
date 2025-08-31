import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { assertMember, generateFileUrl } from "../helpers";
import { requireUserId } from "../server/lib/authz";

/**
 * Register an artifact produced by a run
 */
export const registerArtifact = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		artifactId: v.string(),
		type: v.string(),
		uri: v.string(),
		hash: v.optional(v.string()),
		sizeBytes: v.optional(v.number()),
		retentionDays: v.optional(v.number()),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			// Note: This is typically called by agents, not users
			// In production, verify agent authentication

			// Check if artifact already exists
			const existing = await ctx.db
				.query("orchestrationArtifacts")
				.withIndex("by_workspace_artifactId", (q) =>
					q
						.eq("workspaceId", args.workspaceId)
						.eq("artifactId", args.artifactId),
				)
				.first();

			if (existing) {
				return {
					ok: false,
					error: "Artifact already registered",
				};
			}

			// Verify run exists
			const run = await ctx.db
				.query("orchestrationRuns")
				.withIndex("by_workspace_runId", (q) =>
					q.eq("workspaceId", args.workspaceId).eq("runId", args.runId),
				)
				.unique();

			if (!run) {
				return {
					ok: false,
					error: "Run not found",
				};
			}

			// Calculate expiration
			const retentionDays = args.retentionDays ?? 90;
			const expiresAt = Date.now() + retentionDays * 24 * 60 * 60 * 1000;

			// Register artifact
			await ctx.db.insert("orchestrationArtifacts", {
				workspaceId: args.workspaceId,
				artifactId: args.artifactId,
				runId: args.runId,
				type: args.type,
				uri: args.uri,
				hash: args.hash,
				sizeBytes: args.sizeBytes,
				retentionDays,
				expiresAt,
				createdAt: Date.now(),
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
 * Get artifact metadata
 */
export const getArtifact = query({
	args: {
		workspaceId: v.id("workspaces"),
		artifactId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const artifact = await ctx.db
			.query("orchestrationArtifacts")
			.withIndex("by_workspace_artifactId", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("artifactId", args.artifactId),
			)
			.first();

		if (!artifact) {
			throw new Error("Artifact not found");
		}

		return artifact;
	},
});

/**
 * List artifacts for a run
 */
export const listArtifactsForRun = query({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const artifacts = await ctx.db
			.query("orchestrationArtifacts")
			.withIndex("by_run", (q) => q.eq("runId", args.runId))
			.filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
			.collect();

		return artifacts;
	},
});

/**
 * Generate presigned upload URL for artifact storage
 */
export const presignUpload = action({
	args: {
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		artifactId: v.string(),
		type: v.string(),
		contentType: v.string(),
		sizeBytes: v.number(),
	},
	returns: v.object({
		uploadUrl: v.string(),
		artifactUri: v.string(),
		expiresIn: v.number(),
	}),
	handler: async (_ctx, args) => {
		// Note: This would typically be called by agents
		// In production, verify agent authentication

		// Generate workspace-isolated storage URLs
		const fileName = `${args.artifactId}.${args.type}`;
		const artifactUri = generateFileUrl(
			args.workspaceId,
			fileName,
			args.artifactId,
		);

		// In a real implementation with S3/R2, you'd generate actual presigned URLs
		// For now, we use the same URL pattern with a presigned query param
		const uploadUrl = `${artifactUri}?upload=true&expires=${Date.now() + 3600000}`;

		return {
			uploadUrl,
			artifactUri,
			expiresIn: 3600, // 1 hour
		};
	},
});

/**
 * Generate presigned download URL for artifact access
 */
export const presignDownload = action({
	args: {
		workspaceId: v.id("workspaces"),
		artifactId: v.string(),
	},
	returns: v.object({
		downloadUrl: v.string(),
		expiresIn: v.number(),
	}),
	handler: async (_ctx, args) => {
		// Generate download URL for artifact access
		const downloadUrl = generateFileUrl(
			args.workspaceId,
			`${args.artifactId}.download`,
			args.artifactId,
		);

		return {
			downloadUrl,
			expiresIn: 3600, // 1 hour
		};
	},
});

/**
 * Mark artifact for deletion (soft delete)
 */
export const deleteArtifact = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		artifactId: v.string(),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const _userId = await requireUserId(ctx);
			await assertMember(ctx, args.workspaceId);

			const artifact = await ctx.db
				.query("orchestrationArtifacts")
				.withIndex("by_workspace_artifactId", (q) =>
					q
						.eq("workspaceId", args.workspaceId)
						.eq("artifactId", args.artifactId),
				)
				.first();

			if (!artifact) {
				return {
					ok: false,
					error: "Artifact not found",
				};
			}

			// Soft delete
			await ctx.db.patch(artifact._id, {
				deletedAt: Date.now(),
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
 * Update artifact retention policy
 */
export const updateRetention = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		artifactId: v.string(),
		retentionDays: v.number(),
	},
	returns: v.object({
		ok: v.boolean(),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const _userId = await requireUserId(ctx);
			await assertMember(ctx, args.workspaceId);

			const artifact = await ctx.db
				.query("orchestrationArtifacts")
				.withIndex("by_workspace_artifactId", (q) =>
					q
						.eq("workspaceId", args.workspaceId)
						.eq("artifactId", args.artifactId),
				)
				.first();

			if (!artifact) {
				return {
					ok: false,
					error: "Artifact not found",
				};
			}

			// Calculate new expiration
			const expiresAt =
				artifact.createdAt + args.retentionDays * 24 * 60 * 60 * 1000;

			await ctx.db.patch(artifact._id, {
				retentionDays: args.retentionDays,
				expiresAt,
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
 * Get artifact statistics for workspace
 */
export const getWorkspaceArtifactStats = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const artifacts = await ctx.db
			.query("orchestrationArtifacts")
			.withIndex("by_workspace_created", (q) =>
				q.eq("workspaceId", args.workspaceId),
			)
			.collect();

		const now = Date.now();
		let totalSize = 0;
		let activeCount = 0;
		let expiredCount = 0;
		let deletedCount = 0;

		for (const artifact of artifacts) {
			if (artifact.deletedAt) {
				deletedCount++;
			} else if (artifact.expiresAt < now) {
				expiredCount++;
			} else {
				activeCount++;
			}

			if (artifact.sizeBytes) {
				totalSize += artifact.sizeBytes;
			}
		}

		return {
			total: artifacts.length,
			active: activeCount,
			expired: expiredCount,
			deleted: deletedCount,
			totalSizeBytes: totalSize,
		};
	},
});

/**
 * List artifacts that are candidates for cleanup
 */
export const listCleanupCandidates = query({
	args: {
		workspaceId: v.id("workspaces"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		const now = Date.now();

		// Find expired but not yet deleted artifacts
		const candidates = await ctx.db
			.query("orchestrationArtifacts")
			.withIndex("by_workspace_expires", (q) =>
				q.eq("workspaceId", args.workspaceId),
			)
			.filter((q) =>
				q.and(
					q.lt(q.field("expiresAt"), now),
					q.eq(q.field("deletedAt"), undefined),
				),
			)
			.take(args.limit ?? 50);

		return candidates;
	},
});
