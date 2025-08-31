/**
 * Client Management Functions
 *
 * CRUD operations for managing clients within workspaces.
 * All functions enforce workspace isolation through assertMember.
 */

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertMember, assertWriteEnabled, logActivity } from "./helpers";
import { requireUserId } from "./server/lib/authz";

// Validation schemas
const clientCreateArgs = {
	workspaceId: v.id("workspaces"),
	name: v.string(),
	email: v.optional(v.string()),
	phone: v.optional(v.string()),
	company: v.optional(v.string()),
	website: v.optional(v.string()),
	notes: v.optional(v.string()),
	tags: v.optional(v.array(v.string())),
	address: v.optional(
		v.object({
			street: v.optional(v.string()),
			city: v.optional(v.string()),
			state: v.optional(v.string()),
			zip: v.optional(v.string()),
			country: v.optional(v.string()),
		}),
	),
};

const clientUpdateArgs = {
	clientId: v.id("clients"),
	name: v.optional(v.string()),
	email: v.optional(v.string()),
	phone: v.optional(v.string()),
	company: v.optional(v.string()),
	website: v.optional(v.string()),
	notes: v.optional(v.string()),
	status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
	tags: v.optional(v.array(v.string())),
	address: v.optional(
		v.object({
			street: v.optional(v.string()),
			city: v.optional(v.string()),
			state: v.optional(v.string()),
			zip: v.optional(v.string()),
			country: v.optional(v.string()),
		}),
	),
};

const clientListArgs = {
	workspaceId: v.id("workspaces"),
	status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
	search: v.optional(v.string()),
	limit: v.optional(v.number()),
	cursor: v.optional(v.string()),
};

/**
 * Create a new client
 */
export const create = mutation({
	args: clientCreateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);
		await assertWriteEnabled(ctx, args.workspaceId);

		const now = Date.now();
		const clientId = await ctx.db.insert("clients", {
			...args,
			status: "active",
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log activity
		await logActivity(ctx, {
			workspaceId: args.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "client",
			entityId: clientId,
			action: "created",
			description: `Created client: ${args.name}`,
			metadata: { name: args.name, company: args.company },
		});

		return await ctx.db.get(clientId);
	},
});

/**
 * Update an existing client
 */
export const update = mutation({
	args: clientUpdateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const client = await ctx.db.get(args.clientId);
		if (!client) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Client not found",
			});
		}

		await assertMember(ctx, client.workspaceId);
		await assertWriteEnabled(ctx, client.workspaceId);

		const { clientId, ...updates } = args;
		const now = Date.now();

		await ctx.db.patch(clientId, {
			...updates,
			updatedAt: now,
		});

		// Log activity
		await logActivity(ctx, {
			workspaceId: client.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "client",
			entityId: clientId,
			action: "updated",
			description: `Updated client: ${client.name}`,
			metadata: updates,
		});

		return await ctx.db.get(clientId);
	},
});

/**
 * Soft delete a client
 */
export const remove = mutation({
	args: { clientId: v.id("clients") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const client = await ctx.db.get(args.clientId);
		if (!client) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Client not found",
			});
		}

		await assertMember(ctx, client.workspaceId);
		await assertWriteEnabled(ctx, client.workspaceId);

		const now = Date.now();
		await ctx.db.patch(args.clientId, {
			deletedAt: now,
			updatedAt: now,
		});

		// Remove client-project relationships
		const relationships = await ctx.db
			.query("projectClients")
			.withIndex("by_client", (q) => q.eq("clientId", args.clientId))
			.collect();

		for (const relationship of relationships) {
			await ctx.db.delete(relationship._id);
		}

		// Log activity
		await logActivity(ctx, {
			workspaceId: client.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "client",
			entityId: args.clientId,
			action: "deleted",
			description: `Deleted client: ${client.name}`,
		});

		return { success: true };
	},
});

/**
 * Get client by ID
 */
export const getById = query({
	args: { clientId: v.id("clients") },
	handler: async (ctx, args) => {
		const client = await ctx.db.get(args.clientId);
		if (!client || client.deletedAt) {
			return null;
		}

		const _userId = await requireUserId(ctx);
		await assertMember(ctx, client.workspaceId);

		return client;
	},
});

/**
 * List clients in a workspace with filtering and pagination
 */
export const list = query({
	args: clientListArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId);

		let query = ctx.db
			.query("clients")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined));

		// Filter by status if provided
		if (args.status) {
			query = query.filter((q) => q.eq(q.field("status"), args.status));
		}

		// Apply search if provided (simple contains search)
		if (args.search) {
			const _searchTerm = args.search.toLowerCase();
			query = query.filter((q) =>
				q.or(
					// Use search index or simple filtering for text fields
					q.eq(q.field("name"), args.search), // Exact match for now
					q.eq(q.field("company"), args.search),
					q.eq(q.field("email"), args.search),
				),
			);
		}

		// Apply pagination
		const limit = Math.min(args.limit ?? 50, 100);

		if (args.cursor) {
			// Parse cursor for pagination (simplified implementation)
			query = query.filter((q) =>
				q.gt(q.field("_creationTime"), Number.parseInt(args.cursor!, 10)),
			);
		}

		const clients = await query.order("desc").take(limit + 1);

		// Check if there are more results
		const hasMore = clients.length > limit;
		const results = hasMore ? clients.slice(0, -1) : clients;
		const nextCursor = hasMore
			? results[results.length - 1]._creationTime.toString()
			: undefined;

		return {
			clients: results,
			nextCursor,
			hasMore,
		};
	},
});

/**
 * Get clients for a specific project
 */
export const getByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		// First get the project to verify workspace access
		const project = await ctx.db.get(args.projectId);
		if (!project || project.deletedAt) {
			return [];
		}

		const _userId = await requireUserId(ctx);
		await assertMember(ctx, project.workspaceId);

		// Get client relationships for this project
		const relationships = await ctx.db
			.query("projectClients")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();

		// Fetch client details
		const clients = [];
		for (const rel of relationships) {
			const client = await ctx.db.get(rel.clientId);
			if (client && !client.deletedAt) {
				clients.push({
					...client,
					isPrimary: rel.isPrimary,
					relationshipId: rel._id,
				});
			}
		}

		return clients;
	},
});

/**
 * Link a client to a project
 */
export const linkToProject = mutation({
	args: {
		clientId: v.id("clients"),
		projectId: v.id("projects"),
		isPrimary: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Verify both client and project exist and user has access
		const [client, project] = await Promise.all([
			ctx.db.get(args.clientId),
			ctx.db.get(args.projectId),
		]);

		if (!client || client.deletedAt) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Client not found",
			});
		}

		if (!project || project.deletedAt) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		await assertMember(ctx, client.workspaceId);
		await assertWriteEnabled(ctx, client.workspaceId);

		// Check if relationship already exists
		const existing = await ctx.db
			.query("projectClients")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.filter((q) => q.eq(q.field("clientId"), args.clientId))
			.unique();

		if (existing) {
			throw new ConvexError({
				code: "ALREADY_EXISTS",
				message: "Client is already linked to this project",
			});
		}

		// If this is a primary client, unset existing primary
		if (args.isPrimary) {
			const existingPrimary = await ctx.db
				.query("projectClients")
				.withIndex("by_project_primary", (q) =>
					q.eq("projectId", args.projectId).eq("isPrimary", true),
				)
				.unique();

			if (existingPrimary) {
				await ctx.db.patch(existingPrimary._id, { isPrimary: false });
			}
		}

		const relationshipId = await ctx.db.insert("projectClients", {
			clientId: args.clientId,
			projectId: args.projectId,
			isPrimary: args.isPrimary ?? false,
			createdBy: userId,
			createdAt: Date.now(),
		});

		// Log activity
		await logActivity(ctx, {
			workspaceId: client.workspaceId,
			actorId: userId,
			actorType: "user",
			entityType: "project",
			entityId: args.projectId,
			action: "updated",
			description: `Linked client ${client.name} to project ${project.name}`,
			metadata: { clientId: args.clientId, isPrimary: args.isPrimary },
		});

		return await ctx.db.get(relationshipId);
	},
});

/**
 * Unlink a client from a project
 */
export const unlinkFromProject = mutation({
	args: {
		relationshipId: v.id("projectClients"),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const relationship = await ctx.db.get(args.relationshipId);
		if (!relationship) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Relationship not found",
			});
		}

		// Verify access through project
		const project = await ctx.db.get(relationship.projectId);
		if (!project) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		await assertMember(ctx, project.workspaceId);
		await assertWriteEnabled(ctx, project.workspaceId);

		// Get client name for logging
		const client = await ctx.db.get(relationship.clientId);

		await ctx.db.delete(args.relationshipId);

		// Log activity
		if (client) {
			await logActivity(ctx, {
				workspaceId: project.workspaceId,
				actorId: userId,
				actorType: "user",
				entityType: "project",
				entityId: relationship.projectId,
				action: "updated",
				description: `Unlinked client ${client.name} from project ${project.name}`,
				metadata: { clientId: relationship.clientId },
			});
		}

		return { success: true };
	},
});
