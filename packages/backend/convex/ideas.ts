/**
 * Ideas Management Functions
 *
 * Ideas are creative concepts and lightbulb moments that can be organized
 * in folders and linked to projects. All functions enforce workspace isolation.
 */

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { assertMember, assertWriteEnabled, logEvent } from "./helpers";
import { requireUserId } from "./server/lib/authz";
import {
	ideaCreateArgs,
	ideaDeleteArgs,
	ideaId,
	ideaListArgs,
	ideaMoveArgs,
	ideaSearchArgs,
	ideaUpdateArgs,
	folderCreateArgs,
	folderDeleteArgs,
	folderId,
	workspaceId,
} from "./validators";

/**
 * Create a new idea.
 */
export const create = mutation({
	args: ideaCreateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, args.workspaceId, "editor");

		// Validate project if provided
		if (args.projectId) {
			const project = await ctx.db.get(args.projectId);
			if (!project || project.workspaceId !== args.workspaceId) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Project not found or not in workspace",
				});
			}
		}

		// Validate folder if provided
		if (args.folderId) {
			const folder = await ctx.db.get(args.folderId);
			if (!folder || folder.workspaceId !== args.workspaceId) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Folder not found or not in workspace",
				});
			}
		}

		// Validate title
		const sanitizedTitle = args.title.trim().substring(0, 200);
		if (!sanitizedTitle) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Idea title is required",
			});
		}

		const now = Date.now();

		// Create idea
		const ideaId = await ctx.db.insert("ideas", {
			workspaceId: args.workspaceId,
			projectId: args.projectId,
			folderId: args.folderId,
			title: sanitizedTitle,
			contentMD: args.contentMD || "",
			contentBlocks: args.contentBlocks,
			problem: args.problem,
			hypothesis: args.hypothesis,
			value: args.value,
			risks: args.risks,
			status: "draft",
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log creation event
		await logEvent(
			ctx,
			args.workspaceId,
			"idea_created",
			"idea",
			ideaId,
			{
				ideaId,
				ideaTitle: sanitizedTitle,
			},
		);

		return await ctx.db.get(ideaId);
	},
});

/**
 * Get an idea by ID.
 */
export const get = query({
	args: { workspaceId, ideaId },
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		const idea = await ctx.db.get(args.ideaId);

		if (!idea) {
			return null;
		}

		// Verify idea belongs to workspace
		if (idea.workspaceId !== args.workspaceId) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Idea does not belong to workspace",
			});
		}

		// Exclude soft-deleted ideas
		if (idea.deletedAt) {
			return null;
		}

		// Enrich with project and folder details
		const project = idea.projectId ? await ctx.db.get(idea.projectId) : null;
		const folder = idea.folderId ? await ctx.db.get(idea.folderId) : null;
		const creator = await ctx.db.get(idea.createdBy);

		return {
			...idea,
			project: project ? { _id: project._id, name: project.name } : null,
			folder: folder ? { _id: folder._id, name: folder.name } : null,
			creator: creator
				? {
						_id: creator._id,
						name: creator.name,
						email: creator.email,
						image: creator.image,
					}
				: null,
		};
	},
});

/**
 * List ideas with filtering and search.
 */
export const list = query({
	args: ideaListArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		let query = ctx.db
			.query("ideas")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined));

		// Filter by project if specified
		if (args.projectId) {
			query = ctx.db
				.query("ideas")
				.withIndex("by_workspace_project", (q) =>
					q.eq("workspaceId", args.workspaceId).eq("projectId", args.projectId)
				)
				.filter((q) => q.eq(q.field("deletedAt"), undefined));
		}

		// Filter by folder if specified
		if (args.folderId) {
			query = ctx.db
				.query("ideas")
				.withIndex("by_workspace_folder", (q) =>
					q.eq("workspaceId", args.workspaceId).eq("folderId", args.folderId)
				)
				.filter((q) => q.eq(q.field("deletedAt"), undefined));
		}

		// Apply status filter
		if (args.status) {
			query = query.filter((q) => q.eq(q.field("status"), args.status));
		}

		const limit = Math.min(args.limit ?? 50, 100);
		const ideas = await query.order("desc").take(limit);

		// Enrich with project and folder details
		const enrichedIdeas = await Promise.all(
			ideas.map(async (idea) => {
				const project = idea.projectId ? await ctx.db.get(idea.projectId) : null;
				const folder = idea.folderId ? await ctx.db.get(idea.folderId) : null;

				return {
					...idea,
					project: project
						? { _id: project._id, name: project.name, color: project.color }
						: null,
					folder: folder ? { _id: folder._id, name: folder.name } : null,
				};
			}),
		);

		return enrichedIdeas;
	},
});

/**
 * Search ideas by content and title.
 */
export const search = query({
	args: ideaSearchArgs,
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		// If no query provided, return recent ideas
		if (!args.query?.trim()) {
			return await ctx.db
				.query("ideas")
				.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
				.filter((q) => q.eq(q.field("deletedAt"), undefined))
				.order("desc")
				.take(args.limit || 20);
		}

		// Simple text search - in a real app you'd want full-text search
		const allIdeas = await ctx.db
			.query("ideas")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		const searchTerm = args.query.toLowerCase();
		const matchingIdeas = allIdeas
			.filter(
				(idea) =>
					idea.title.toLowerCase().includes(searchTerm) ||
					idea.contentMD.toLowerCase().includes(searchTerm) ||
					idea.problem?.toLowerCase().includes(searchTerm) ||
					idea.hypothesis?.toLowerCase().includes(searchTerm)
			)
			.slice(0, args.limit || 20);

		return matchingIdeas;
	},
});

/**
 * Update an idea.
 */
export const update = mutation({
	args: ideaUpdateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const idea = await ctx.db.get(args.ideaId);
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, idea.workspaceId, "editor");


		const updates: any = {
			updatedAt: Date.now(),
		};

		// Handle title update
		if (args.title !== undefined) {
			const sanitizedTitle = args.title.trim().substring(0, 200);
			if (!sanitizedTitle) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Idea title cannot be empty",
				});
			}
			updates.title = sanitizedTitle;
		}

		// Handle content updates
		if (args.contentMD !== undefined) updates.contentMD = args.contentMD;
		if (args.contentBlocks !== undefined) updates.contentBlocks = args.contentBlocks;

		// Handle structured fields
		if (args.problem !== undefined) updates.problem = args.problem;
		if (args.hypothesis !== undefined) updates.hypothesis = args.hypothesis;
		if (args.value !== undefined) updates.value = args.value;
		if (args.risks !== undefined) updates.risks = args.risks;

		// Handle status update
		if (args.status !== undefined) updates.status = args.status;

		// Handle project assignment
		if (args.projectId !== undefined) {
			if (args.projectId) {
				const project = await ctx.db.get(args.projectId);
				if (!project || project.workspaceId !== idea.workspaceId) {
					throw new ConvexError({
						code: "NOT_FOUND",
						message: "Project not found or not in workspace",
					});
				}
			}
			updates.projectId = args.projectId;
		}

		// Handle folder assignment
		if (args.folderId !== undefined) {
			if (args.folderId) {
				const folder = await ctx.db.get(args.folderId);
				if (!folder || folder.workspaceId !== idea.workspaceId) {
					throw new ConvexError({
						code: "NOT_FOUND",
						message: "Folder not found or not in workspace",
					});
				}
			}
			updates.folderId = args.folderId;
		}

		await ctx.db.patch(args.ideaId, updates);

		// Log update event
		await logEvent(
			ctx,
			idea.workspaceId,
			"idea_updated",
			"idea",
			args.ideaId,
			{
				ideaId: args.ideaId,
				ideaTitle: updates.title || idea.title,
				updatedFields: Object.keys(updates),
			},
		);

		return await ctx.db.get(args.ideaId);
	},
});

/**
 * Move an idea to a different folder or project.
 */
export const move = mutation({
	args: ideaMoveArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const idea = await ctx.db.get(args.ideaId);
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, idea.workspaceId, "editor");

		// Validate target folder if provided
		if (args.targetFolderId) {
			const folder = await ctx.db.get(args.targetFolderId);
			if (!folder || folder.workspaceId !== idea.workspaceId) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Target folder not found or not in workspace",
				});
			}
		}

		// Validate target project if provided
		if (args.targetProjectId) {
			const project = await ctx.db.get(args.targetProjectId);
			if (!project || project.workspaceId !== idea.workspaceId) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Target project not found or not in workspace",
				});
			}
		}

		// Update assignments
		await ctx.db.patch(args.ideaId, {
			folderId: args.targetFolderId,
			projectId: args.targetProjectId,
			updatedAt: Date.now(),
		});

		// Log move event
		await logEvent(
			ctx,
			idea.workspaceId,
			"idea_moved",
			"idea",
			args.ideaId,
			{
				ideaId: args.ideaId,
				ideaTitle: idea.title,
				fromFolder: idea.folderId,
				toFolder: args.targetFolderId,
				fromProject: idea.projectId,
				toProject: args.targetProjectId,
			},
		);

		return await ctx.db.get(args.ideaId);
	},
});

/**
 * Delete an idea (soft delete).
 */
export const deleteIdea = mutation({
	args: ideaDeleteArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const idea = await ctx.db.get(args.ideaId);
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Check permissions (only creator or admins can delete)
		await assertWriteEnabled(ctx, idea.workspaceId, "editor");

		const membership = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_user", (q) =>
				q.eq("workspaceId", idea.workspaceId).eq("userId", userId)
			)
			.first();

		if (
			idea.createdBy !== userId &&
			membership?.role !== "owner" &&
			membership?.role !== "admin"
		) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Only idea creator or admins can delete ideas",
			});
		}

		// Soft delete
		await ctx.db.patch(args.ideaId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});

		// Log deletion event
		await logEvent(
			ctx,
			idea.workspaceId,
			"idea_deleted",
			"idea",
			args.ideaId,
			{ ideaId: args.ideaId, ideaTitle: idea.title },
		);
	},
});

// ============================================================================
// Folder Management Functions
// ============================================================================

/**
 * Create a new folder.
 */
export const createFolder = mutation({
	args: folderCreateArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, args.workspaceId, "editor");

		// Validate parent folder if provided
		if (args.parentId) {
			const parentFolder = await ctx.db.get(args.parentId);
			if (!parentFolder || parentFolder.workspaceId !== args.workspaceId) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Parent folder not found or not in workspace",
				});
			}
		}

		// Validate name
		const sanitizedName = args.name.trim().substring(0, 100);
		if (!sanitizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Folder name is required",
			});
		}

		const now = Date.now();

		// Create folder with sortKey based on creation time
		const folderId = await ctx.db.insert("folders", {
			workspaceId: args.workspaceId,
			name: sanitizedName,
			parentId: args.parentId,
			sortKey: now, // Use timestamp for ordering
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log creation event
		await logEvent(
			ctx,
			args.workspaceId,
			"folder_created",
			"folder",
			folderId,
			{
				folderId,
				folderName: sanitizedName,
			},
		);

		return await ctx.db.get(folderId);
	},
});

/**
 * Get folder hierarchy for workspace.
 */
export const getFolderHierarchy = query({
	args: { workspaceId },
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);
		await assertMember(ctx, args.workspaceId, "viewer");

		const folders = await ctx.db
			.query("folders")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		// Build hierarchy
		const folderMap = new Map(folders.map((f) => [f._id, { ...f, children: [] }]));
		const rootFolders: any[] = [];

		folders.forEach((folder) => {
			const folderWithChildren = folderMap.get(folder._id);
			if (folder.parentId && folderMap.has(folder.parentId)) {
				folderMap.get(folder.parentId)!.children.push(folderWithChildren);
			} else {
				rootFolders.push(folderWithChildren);
			}
		});

		return rootFolders;
	},
});

/**
 * Delete a folder (soft delete).
 */
export const deleteFolder = mutation({
	args: folderDeleteArgs,
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const folder = await ctx.db.get(args.folderId);
		if (!folder) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Folder not found",
			});
		}

		// Check permissions (admin required for deletion)
		await assertWriteEnabled(ctx, folder.workspaceId, "admin");

		// Check if folder has children
		const childFolders = await ctx.db
			.query("folders")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", folder.workspaceId))
			.filter((q) =>
				q.and(
					q.eq(q.field("parentId"), args.folderId),
					q.eq(q.field("deletedAt"), undefined)
				)
			)
			.collect();

		if (childFolders.length > 0) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Cannot delete folder with subfolders",
			});
		}

		// Check if folder has ideas
		const ideasInFolder = await ctx.db
			.query("ideas")
			.withIndex("by_workspace_folder", (q) =>
				q.eq("workspaceId", folder.workspaceId).eq("folderId", args.folderId)
			)
			.filter((q) => q.eq(q.field("deletedAt"), undefined))
			.collect();

		if (ideasInFolder.length > 0) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Cannot delete folder containing ideas",
			});
		}

		// Soft delete
		await ctx.db.patch(args.folderId, {
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});

		// Log deletion event
		await logEvent(
			ctx,
			folder.workspaceId,
			"folder_deleted",
			"folder",
			args.folderId,
			{ folderId: args.folderId, folderName: folder.name },
		);
	},
});

// ============================================================================
// Legacy/Extension Functions (keeping for compatibility)
// ============================================================================

/**
 * Add content to existing idea.
 */
export const addContent = mutation({
	args: {
		ideaId,
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const idea = await ctx.db.get(args.ideaId);
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Check permissions
		await assertWriteEnabled(ctx, idea.workspaceId, "editor");

		// Append content to existing idea
		const updatedContent = `${idea.contentMD}\n\n---\n\n${args.content}`;
		await ctx.db.patch(args.ideaId, {
			contentMD: updatedContent,
			updatedAt: Date.now(),
		});

		// Log update event
		await logEvent(
			ctx,
			idea.workspaceId,
			"idea_updated",
			"idea",
			args.ideaId,
			{ ideaId: args.ideaId, ideaTitle: idea.title, action: "content_added" },
		);
	},
});

/**
 * Create idea from web clip.
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
		const userId = await requireUserId(ctx);

		// Check permissions
		await assertWriteEnabled(ctx, args.workspaceId, "editor");

		// Create idea with web clip content
		const ideaData = {
			workspaceId: args.workspaceId,
			title: args.title,
			contentMD: args.content,
			folderId: args.folderId,
			projectId: args.projectId,
		};

		const ideaId = await ctx.runMutation(api.ideas.create, ideaData);

		// Log web clip event
		await logEvent(
			ctx,
			args.workspaceId,
			"web_clip_created",
			"idea",
			ideaId,
			{
				ideaId,
				url: args.url,
				ideaTitle: args.title,
			},
		);

		return ideaId;
	},
});