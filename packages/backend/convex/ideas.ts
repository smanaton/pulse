/**
 * Ideas API - Thin Convex Adapters
 *
 * These are thin adapter functions that handle Convex-specific concerns
 * (auth, database context) and delegate to business logic services.
 */

import type { IBusinessContext } from "@pulse/core/ideas/interfaces";
import { createServices, IdeaDomainError } from "@pulse/core/ideas/services";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createRepositories } from "./adapters/repositories";
import { assertMember } from "./helpers";
import { requireUserId } from "./server/lib/authz";

// ============================================================================
// Input Validation Schemas
// ============================================================================

const ideaCreateArgs = {
	workspaceId: v.id("workspaces"),
	projectId: v.optional(v.id("projects")),
	folderId: v.optional(v.id("folders")),
	title: v.string(),
	contentMD: v.string(),
	contentBlocks: v.optional(v.any()),
};

const ideaUpdateArgs = {
	ideaId: v.id("ideas"),
	title: v.optional(v.string()),
	contentMD: v.optional(v.string()),
	contentBlocks: v.optional(v.any()),
	projectId: v.optional(v.id("projects")),
	folderId: v.optional(v.id("folders")),
	status: v.optional(
		v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
	),
};

const ideaSearchArgs = {
	workspaceId: v.id("workspaces"),
	query: v.optional(v.string()),
	projectId: v.optional(v.id("projects")),
	folderId: v.optional(v.id("folders")),
	status: v.optional(
		v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
	),
	limit: v.optional(v.number()),
};

const folderCreateArgs = {
	workspaceId: v.id("workspaces"),
	name: v.string(),
	parentId: v.optional(v.id("folders")),
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create business context from Convex context
 */
async function createBusinessContext(
	ctx: any,
	workspaceId?: string,
): Promise<IBusinessContext> {
	const userId = await requireUserId(ctx);

	// Get user's role in the workspace if provided
	let userRole: string | undefined;
	if (workspaceId) {
		const membership = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_user", (q: any) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.first();
		userRole = membership?.role;
	}

	return {
		userId,
		workspaceId: workspaceId as any,
		userRole,
	};
}

/**
 * Handle domain errors and convert to Convex errors
 */
function handleDomainError(error: unknown): never {
	if (error instanceof IdeaDomainError) {
		throw new ConvexError({
			code: error.code,
			message: error.message,
		});
	}

	// Re-throw unexpected errors
	throw error;
}

// ============================================================================
// Idea Management Functions (Thin Adapters)
// ============================================================================

/**
 * Create a new idea
 */
export const create = mutation({
	args: ideaCreateArgs,
	handler: async (ctx, args) => {
		try {
			// 1. Authentication & Authorization (Adapter responsibility)
			const businessContext = await createBusinessContext(
				ctx,
				args.workspaceId,
			);
			await assertMember(ctx, args.workspaceId);

			// 2. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 3. Delegate to business logic
			return await services.ideaService.create(args);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Update an existing idea
 */
export const update = mutation({
	args: ideaUpdateArgs,
	handler: async (ctx, args) => {
		try {
			// Extract ideaId for cleaner service call
			const { ideaId, ...updateData } = args;

			// 1. Get idea to determine workspace for auth
			const idea = await ctx.db.get(ideaId);
			if (!idea) {
				throw new ConvexError({ code: "NOT_FOUND", message: "Idea not found" });
			}

			// 2. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				idea.workspaceId,
			);
			await assertMember(ctx, idea.workspaceId);

			// 3. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 4. Delegate to business logic
			await services.ideaService.update(ideaId, updateData);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Delete an idea (soft delete)
 */
export const remove = mutation({
	args: { ideaId: v.id("ideas") },
	handler: async (ctx, args) => {
		try {
			// 1. Get idea to determine workspace for auth
			const idea = await ctx.db.get(args.ideaId);
			if (!idea) {
				throw new ConvexError({ code: "NOT_FOUND", message: "Idea not found" });
			}

			// 2. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				idea.workspaceId,
			);
			await assertMember(ctx, idea.workspaceId);

			// 3. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 4. Delegate to business logic
			await services.ideaService.delete(args.ideaId);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Get a single idea by ID
 */
export const get = query({
	args: { ideaId: v.id("ideas") },
	handler: async (ctx, args) => {
		try {
			// 1. Get idea to determine workspace for auth
			const idea = await ctx.db.get(args.ideaId);
			if (!idea) {
				return null;
			}

			// 2. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				idea.workspaceId,
			);
			await assertMember(ctx, idea.workspaceId);

			// 3. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 4. Delegate to business logic
			return await services.ideaService.get(args.ideaId);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Search ideas with filters
 */
export const search = query({
	args: ideaSearchArgs,
	handler: async (ctx, args) => {
		try {
			// 1. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				args.workspaceId,
			);
			await assertMember(ctx, args.workspaceId);

			// 2. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 3. Delegate to business logic
			return await services.ideaService.search(args);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * List ideas for workspace
 */
export const list = query({
	args: {
		workspaceId: v.id("workspaces"),
		limit: v.optional(v.number()),
		projectId: v.optional(v.id("projects")),
		folderId: v.optional(v.id("folders")),
		status: v.optional(
			v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
		),
	},
	handler: async (ctx, args) => {
		try {
			// 1. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				args.workspaceId,
			);
			await assertMember(ctx, args.workspaceId);

			// 2. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 3. Delegate to business logic - use search with no filters
			return await services.ideaService.search({
				workspaceId: args.workspaceId,
				limit: args.limit,
				projectId: args.projectId,
				folderId: args.folderId,
				status: args.status,
			});
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Delete an idea (alias for remove for backward compatibility)
 */
export const deleteIdea = mutation({
	args: { ideaId: v.id("ideas") },
	handler: async (ctx, args) => {
		try {
			// 1. Get idea to determine workspace for auth
			const idea = await ctx.db.get(args.ideaId);
			if (!idea) {
				throw new ConvexError({ code: "NOT_FOUND", message: "Idea not found" });
			}

			// 2. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				idea.workspaceId,
			);
			await assertMember(ctx, idea.workspaceId);

			// 3. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 4. Delegate to business logic
			await services.ideaService.delete(args.ideaId);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Move idea to different folder/project
 */
export const move = mutation({
	args: {
		ideaId: v.id("ideas"),
		targetFolderId: v.optional(v.id("folders")),
		targetProjectId: v.optional(v.id("projects")),
	},
	handler: async (ctx, args) => {
		try {
			// 1. Get idea to determine workspace for auth
			const idea = await ctx.db.get(args.ideaId);
			if (!idea) {
				throw new ConvexError({ code: "NOT_FOUND", message: "Idea not found" });
			}

			// 2. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				idea.workspaceId,
			);
			await assertMember(ctx, idea.workspaceId);

			// 3. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 4. Delegate to business logic
			await services.ideaService.move(
				args.ideaId,
				args.targetFolderId,
				args.targetProjectId,
			);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

// ============================================================================
// Folder Management Functions (Thin Adapters)
// ============================================================================

/**
 * Create a new folder
 */
export const createFolder = mutation({
	args: folderCreateArgs,
	handler: async (ctx, args) => {
		try {
			// 1. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				args.workspaceId,
			);
			await assertMember(ctx, args.workspaceId);

			// 2. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 3. Delegate to business logic
			return await services.folderService.create(
				args.workspaceId,
				args.name,
				args.parentId,
			);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Delete a folder
 */
export const deleteFolder = mutation({
	args: { folderId: v.id("folders") },
	handler: async (ctx, args) => {
		try {
			// 1. Get folder to determine workspace for auth
			const folder = await ctx.db.get(args.folderId);
			if (!folder) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Folder not found",
				});
			}

			// 2. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				folder.workspaceId,
			);
			await assertMember(ctx, folder.workspaceId);

			// 3. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 4. Delegate to business logic
			await services.folderService.delete(args.folderId);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Get folder hierarchy for workspace
 */
export const getFolderHierarchy = query({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, args) => {
		try {
			// 1. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				args.workspaceId,
			);
			await assertMember(ctx, args.workspaceId);

			// 2. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 3. Delegate to business logic
			return await services.folderService.getHierarchy(args.workspaceId);
		} catch (error) {
			handleDomainError(error);
		}
	},
});

// ============================================================================
// Web Clipper Functions (Thin Adapters)
// ============================================================================

/**
 * Append web clip content to existing idea
 */
export const appendWebClip = mutation({
	args: {
		ideaId: v.id("ideas"),
		content: v.string(),
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		try {
			// 1. Get idea to determine workspace for auth
			const idea = await ctx.db.get(args.ideaId);
			if (!idea) {
				throw new ConvexError({ code: "NOT_FOUND", message: "Idea not found" });
			}

			// 2. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				idea.workspaceId,
			);
			await assertMember(ctx, idea.workspaceId);

			// 3. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 4. Append content to existing idea
			const updatedContent = `${idea.contentMD}\n\n---\n\n${args.content}`;
			await services.ideaService.update(args.ideaId, {
				contentMD: updatedContent,
			});

			return args.ideaId;
		} catch (error) {
			handleDomainError(error);
		}
	},
});

/**
 * Create new idea from web clip
 */
export const createFromWebClip = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		url: v.string(),
		title: v.string(),
		content: v.string(),
		metadata: v.optional(v.any()),
		folderId: v.optional(v.id("folders")),
		projectId: v.optional(v.id("projects")),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		try {
			// 1. Authentication & Authorization
			const businessContext = await createBusinessContext(
				ctx,
				args.workspaceId,
			);
			await assertMember(ctx, args.workspaceId);

			// 2. Create dependencies
			const repositories = createRepositories(ctx);
			const services = createServices(repositories, businessContext);

			// 3. Create idea with web clip content
			const ideaData = {
				workspaceId: args.workspaceId,
				title: args.title,
				contentMD: args.content,
				folderId: args.folderId,
				projectId: args.projectId,
			};

			return await services.ideaService.create(ideaData);
		} catch (error) {
			handleDomainError(error);
		}
	},
});
