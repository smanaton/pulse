/**
 * Files Management Functions
 *
 * Functions for managing file attachments within workspaces.
 * All files are workspace-scoped with proper isolation.
 */

import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
	assertMember,
	assertWriteEnabled,
	generateFileUrl,
	logEvent,
} from "./helpers";
import { requireUserId } from "./server/lib/authz";
import {
	fileDeleteArgs,
	fileGetArgs,
	fileListArgs,
	fileUploadArgs,
} from "./validators";

/**
 * Upload a file (create file record).
 */
export const upload = mutation({
	args: fileUploadArgs,
	handler: async (ctx, { workspaceId, ideaId, name, size, contentType }) => {
		const userId = await requireUserId(ctx);

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, workspaceId, "editor");

		// Validate inputs
		if (!name.trim()) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "File name is required",
			});
		}

		if (size <= 0 || size > 100 * 1024 * 1024) {
			// Max 100MB
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Invalid file size",
			});
		}

		// Verify idea belongs to workspace if specified
		if (ideaId) {
			const idea = await ctx.db.get(ideaId);
			if (!idea || idea.workspaceId !== workspaceId) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: "Idea does not belong to workspace",
				});
			}
		}

		const now = Date.now();

		// Create file record
		const fileId = await ctx.db.insert("files", {
			workspaceId,
			ideaId,
			name: name.trim(),
			size,
			contentType,
			url: "", // Will be set below
			createdBy: userId,
			createdAt: now,
		});

		// Generate workspace-scoped URL
		const url = generateFileUrl(workspaceId, name, fileId);

		// Update with URL
		await ctx.db.patch(fileId, { url });

		// Log file upload event
		await logEvent(ctx, workspaceId, "file_uploaded", "file", fileId, {
			size,
			contentType,
		});

		return await ctx.db.get(fileId);
	},
});

/**
 * Get a file by ID.
 */
export const get = query({
	args: fileGetArgs,
	handler: async (ctx, { fileId }) => {
		const file = await ctx.db.get(fileId);
		if (!file) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "File not found",
			});
		}

		// Check workspace access
		await assertMember(ctx, file.workspaceId, "viewer");

		// Exclude soft-deleted files
		if (file.deletedAt) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "File not found",
			});
		}

		return file;
	},
});

/**
 * List files in a workspace.
 */
export const list = query({
	args: fileListArgs,
	handler: async (ctx, { workspaceId, ideaId, limit = 50 }) => {
		// Check workspace access
		await assertMember(ctx, workspaceId, "viewer");

		const query = ctx.db
			.query("files")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.filter((q) => q.eq(q.field("deletedAt"), undefined)) // Exclude soft-deleted
			.order("desc");

		let files = await query.take(limit);

		// Filter by idea if specified
		if (ideaId) {
			files = files.filter((file) => file.ideaId === ideaId);
		}

		return files;
	},
});

/**
 * Delete a file (soft delete).
 */
export const deleteFile = mutation({
	args: fileDeleteArgs,
	handler: async (ctx, { fileId }) => {
		const file = await ctx.db.get(fileId);
		if (!file) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "File not found",
			});
		}

		// Check permissions (editor required)
		await assertWriteEnabled(ctx, file.workspaceId, "editor");

		// Soft delete
		await ctx.db.patch(fileId, {
			deletedAt: Date.now(),
		});

		// Log deletion event
		await logEvent(ctx, file.workspaceId, "file_deleted", "file", fileId);
	},
});
