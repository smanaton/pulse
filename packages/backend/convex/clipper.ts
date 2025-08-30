/**
 * Web Clipper Functions
 *
 * Handles web content capture, processing, and integration with ideas.
 */

import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import { assertMember, logEvent, sanitizeContent } from "./helpers";
import { requireUserId } from "./server/lib/authz";

/**
 * Create a new clipper task (simplified version)
 */
export const createTask = action({
	args: {
		workspaceId: v.id("workspaces"),
		url: v.string(),
		title: v.optional(v.string()),
		selection: v.optional(v.string()),
		screenshot: v.optional(v.string()),
		captureType: v.string(),
		destination: v.string(),
		targetIdeaId: v.optional(v.id("ideas")),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		// Validate URL
		try {
			new URL(args.url);
		} catch {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Invalid URL provided",
			});
		}

		// For now, directly create the idea instead of using a task queue
		// This simplifies the implementation while maintaining functionality
		const content = await extractWebContent(args.url, args.selection);
		const title = args.title || content.title || new URL(args.url).hostname;

		if (args.destination === "existing" && args.targetIdeaId) {
			// Append to existing idea
			const ideaId: string = await ctx.runMutation(api.ideas.appendWebClip, {
				ideaId: args.targetIdeaId,
				content: formatContentForIdea(content, args),
				metadata: content.metadata,
			});
			return { taskId: ideaId, status: "completed" };
		}
		// Create new idea
		const ideaId: string = await ctx.runMutation(api.ideas.createFromWebClip, {
			workspaceId: args.workspaceId,
			url: args.url,
			title,
			content: formatContentForIdea(content, args),
			metadata: content.metadata,
			tags: args.tags,
		});
		return { taskId: ideaId, status: "completed" };
	},
});

/**
 * Internal mutation to create a clipper task
 */
export const createTaskInternal = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		url: v.string(),
		title: v.optional(v.string()),
		selection: v.optional(v.string()),
		screenshot: v.optional(v.string()),
		captureType: v.string(),
		destination: v.string(),
		targetIdeaId: v.optional(v.id("ideas")),
		tags: v.optional(v.array(v.string())),
		createdBy: v.id("users"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		return await ctx.db.insert("clipperTasks", {
			workspaceId: args.workspaceId,
			status: "pending",
			url: args.url,
			title: args.title,
			selection: args.selection,
			screenshot: args.screenshot,
			captureType: args.captureType,
			destination: args.destination,
			targetIdeaId: args.targetIdeaId,
			tags: args.tags,
			createdBy: args.createdBy,
			createdAt: now,
		});
	},
});

/**
 * Process a clipper task
 */
export const processTask = action({
	args: {
		taskId: v.id("clipperTasks"),
	},
	handler: async (ctx, { taskId }) => {
		try {
			// Update task status
			await ctx.runMutation(api.clipper.updateTaskStatus, {
				taskId,
				status: "processing",
				processingStartedAt: Date.now(),
			});

			// Get task details
			const task = await ctx.runQuery(api.clipper.getTask, { taskId });
			if (!task) {
				throw new Error("Task not found");
			}

			// Extract content from URL
			const content = await extractWebContent(task.url, task.selection);

			// Generate canonical URL and content hash
			const canonicalUrl = extractCanonicalUrl(content.html, task.url);
			const contentHash = await generateContentHash(content.text);

			// Check for duplicates
			const existingClip = await ctx.runQuery(api.clipper.findByContentHash, {
				workspaceId: task.workspaceId,
				contentHash,
			});

			let ideaId: string;

			if (task.destination === "existing" && task.targetIdeaId) {
				// Append to existing idea
				ideaId = await ctx.runMutation(api.ideas.appendWebClip, {
					ideaId: task.targetIdeaId!,
					content: formatContentForIdea(content, task),
					metadata: content.metadata,
				});
			} else {
				// Create new idea
				const title = task.title || content.title || new URL(task.url).hostname;
				const ideaContent = formatContentForIdea(content, task);

				ideaId = await ctx.runMutation(api.ideas.createFromWebClip, {
					workspaceId: task.workspaceId,
					url: task.url,
					title,
					content: ideaContent,
					metadata: content.metadata,
					tags: task.tags,
				});
			}

			// Create web clip record
			await ctx.runMutation(api.clipper.createWebClip, {
				workspaceId: task.workspaceId,
				ideaId: ideaId as any,
				url: task.url,
				canonicalUrl,
				title: content.title || task.title || "",
				contentHash,
				favicon: content.favicon || undefined,
				captureType: task.captureType,
				metadata: content.metadata,
				createdBy: task.createdBy,
			});

			// Mark task as completed
			await ctx.runMutation(api.clipper.updateTaskStatus, {
				taskId,
				status: "completed",
				resultIdeaId: ideaId as any,
				completedAt: Date.now(),
			});

			// Log the capture
			await ctx.runMutation(api.clipper.logCapture, {
				workspaceId: task.workspaceId,
				entityId: ideaId,
				captureType: task.captureType,
				url: task.url,
			});
		} catch (error) {
			console.error("Task processing failed:", error);

			// Mark task as failed
			await ctx.runMutation(api.clipper.updateTaskStatus, {
				taskId,
				status: "failed",
				error: error instanceof Error ? error.message : "Unknown error",
				completedAt: Date.now(),
			});
		}
	},
});

/**
 * Update task status
 */
export const updateTaskStatus = mutation({
	args: {
		taskId: v.id("clipperTasks"),
		status: v.union(
			v.literal("pending"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed"),
		),
		processingStartedAt: v.optional(v.number()),
		resultIdeaId: v.optional(v.id("ideas")),
		error: v.optional(v.string()),
		completedAt: v.optional(v.number()),
	},
	handler: async (ctx, { taskId, status, ...updates }) => {
		await ctx.db.patch(taskId, {
			status,
			...updates,
		});
	},
});

/**
 * Get task details
 */
export const getTask = query({
	args: {
		taskId: v.id("clipperTasks"),
	},
	handler: async (ctx, { taskId }) => {
		return await ctx.db.get(taskId);
	},
});

/**
 * Get task status (for extension polling)
 */
export const getTaskStatus = query({
	args: {
		taskId: v.id("clipperTasks"),
	},
	handler: async (ctx, { taskId }) => {
		const task = await ctx.db.get(taskId);
		if (!task) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Task not found",
			});
		}

		return {
			id: task._id,
			status: task.status,
			resultIdeaId: task.resultIdeaId,
			error: task.error,
			createdAt: task.createdAt,
			completedAt: task.completedAt,
		};
	},
});

/**
 * Find clip by content hash (for deduplication)
 */
export const findByContentHash = query({
	args: {
		workspaceId: v.id("workspaces"),
		contentHash: v.string(),
	},
	handler: async (ctx, { workspaceId, contentHash }) => {
		return await ctx.db
			.query("webClips")
			.withIndex("by_content_hash", (q) => q.eq("contentHash", contentHash))
			.filter((q) => q.eq(q.field("workspaceId"), workspaceId))
			.first();
	},
});

/**
 * Create web clip record
 */
export const createWebClip = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
		url: v.string(),
		canonicalUrl: v.string(),
		title: v.string(),
		contentHash: v.string(),
		favicon: v.optional(v.string()),
		captureType: v.string(),
		metadata: v.any(),
		createdBy: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("webClips", {
			...args,
			createdAt: Date.now(),
		});
	},
});

/**
 * Log capture event
 */
export const logCapture = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		entityId: v.string(),
		captureType: v.string(),
		url: v.string(),
	},
	handler: async (ctx, { workspaceId, entityId, captureType, url }) => {
		const userId = await requireUserId(ctx);

		await logEvent(ctx, workspaceId, "web_clip_created", "idea", entityId, {
			captureType,
			url: new URL(url).hostname, // Log domain only for privacy
		});
	},
});

// Helper functions

/**
 * Extract web content from URL
 */
async function extractWebContent(url: string, selection?: string) {
	try {
		// Fetch the webpage
		const response = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; PulseClipper/1.0)",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const html = await response.text();

		// Extract metadata
		const metadata = extractMetadata(html);

		// Extract main content
		const text = extractMainText(html);

		// Get favicon
		const favicon = extractFavicon(html, url);

		return {
			html,
			text: selection || text,
			title: metadata.title,
			metadata,
			favicon,
		};
	} catch (error) {
		console.error("Content extraction failed:", error);

		// Fallback for failed extraction
		return {
			html: "",
			text: selection || "",
			title: new URL(url).hostname,
			metadata: { url },
			favicon: null,
		};
	}
}

/**
 * Extract metadata from HTML
 */
function extractMetadata(html: string): any {
	const metadata: any = {};

	// Basic title extraction
	const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
	if (titleMatch) {
		metadata.title = titleMatch[1].trim();
	}

	// Meta description
	const descMatch = html.match(
		/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
	);
	if (descMatch) {
		metadata.description = descMatch[1];
	}

	// Open Graph data
	const ogMatches = html.match(
		/<meta[^>]*property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi,
	);
	if (ogMatches) {
		ogMatches.forEach((match) => {
			const propMatch = match.match(
				/property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*/i,
			);
			if (propMatch) {
				metadata[`og:${propMatch[1]}`] = propMatch[2];
			}
		});
	}

	// Author
	const authorMatch = html.match(
		/<meta[^>]*name=["']author["'][^>]*content=["']([^"']*)["'][^>]*>/i,
	);
	if (authorMatch) {
		metadata.author = authorMatch[1];
	}

	return metadata;
}

/**
 * Extract main text content from HTML (simplified)
 */
function extractMainText(html: string): string {
	// Remove scripts, styles, and other non-content elements
	let content = html
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
		.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
		.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
		.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

	// Convert basic HTML elements to markdown
	content = content
		.replace(
			/<h([1-6])[^>]*>([^<]*)<\/h[1-6]>/gi,
			(_, level, text) =>
				"\n" + "#".repeat(Number.parseInt(level)) + " " + text.trim() + "\n",
		)
		.replace(/<p[^>]*>([^<]*)<\/p>/gi, "\n$1\n")
		.replace(/<br[^>]*\/?>/gi, "\n")
		.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, "[$2]($1)")
		.replace(/<code[^>]*>([^<]*)<\/code>/gi, "`$1`")
		.replace(/<pre[^>]*>([^<]*)<\/pre>/gi, "\n```\n$1\n```\n")
		.replace(/<[^>]+>/g, " ") // Remove remaining HTML tags
		.replace(/&nbsp;/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/\s+/g, " ") // Normalize whitespace
		.replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive line breaks
		.trim();

	return content;
}

/**
 * Extract favicon URL
 */
function extractFavicon(html: string, baseUrl: string): string | null {
	const iconMatch = html.match(
		/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']*)["'][^>]*>/i,
	);
	if (iconMatch) {
		const href = iconMatch[1];
		return href.startsWith("http") ? href : new URL(href, baseUrl).toString();
	}

	// Fallback to default favicon
	try {
		return new URL("/favicon.ico", baseUrl).toString();
	} catch {
		return null;
	}
}

/**
 * Extract canonical URL
 */
function extractCanonicalUrl(html: string, fallbackUrl: string): string {
	const canonicalMatch = html.match(
		/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i,
	);
	return canonicalMatch ? canonicalMatch[1] : fallbackUrl;
}

/**
 * Generate content hash for deduplication
 */
async function generateContentHash(content: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(content.slice(0, 1000)); // Use first 1000 chars for hash
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hashBuffer), (b) =>
		b.toString(16).padStart(2, "0"),
	).join("");
}

/**
 * Format content for idea storage
 */
function formatContentForIdea(content: any, task: any): string {
	let formatted = "";

	// Add source URL
	formatted += `# ${content.title || "Web Clip"}\n\n`;
	formatted += `**Source:** [${new URL(task.url).hostname}](${task.url})\n`;
	formatted += `**Captured:** ${new Date().toLocaleString()}\n\n`;

	// Add selection note if applicable
	if (task.selection) {
		formatted += "**Selected text:**\n\n";
	}

	// Add main content
	formatted += content.text;

	// Add metadata if available
	if (content.metadata.description) {
		formatted += `\n\n**Description:** ${content.metadata.description}`;
	}

	if (content.metadata.author) {
		formatted += `\n**Author:** ${content.metadata.author}`;
	}

	return sanitizeContent(formatted);
}
