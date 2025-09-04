/**
 * Core Helpers for Workspace Isolation
 *
 * These helpers enforce workspace boundaries and provide
 * common utilities used across all Convex functions.
 */

import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
	getUserId,
	requireUserId,
	requireUserIdReadOnly,
} from "./server/lib/authz";

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
	viewer: 0,
	editor: 1,
	admin: 2,
	owner: 3,
} as const;

export type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Get role rank for comparison
 */
export function roleRank(role: Role): number {
	return ROLE_HIERARCHY[role];
}

/**
 * Assert that the current user is a member of the workspace with minimum role.
 * This is the SINGLE SOURCE OF TRUTH for workspace access control.
 *
 * MUST be called by every Convex function that operates on workspace data.
 *
 * Following Convex best practices: https://docs.convex.dev/auth/database-auth
 */
export async function assertMember(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<"workspaces">,
	minRole: Role = "viewer",
): Promise<{ workspace: Doc<"workspaces">; member?: Doc<"workspaceMembers"> }> {
	// Use appropriate auth function based on context type
	// Check if it's a mutation context by looking for scheduler property
	const isMutation = "scheduler" in ctx;
	const userId = isMutation
		? await requireUserId(ctx)
		: await requireUserIdReadOnly(ctx);

	if (!userId) {
		throw new ConvexError({
			code: "UNAUTHENTICATED",
			message: "Authentication required",
		});
	}

	const workspace = await ctx.db.get(workspaceId);
	if (!workspace) {
		throw new ConvexError({
			code: "NOT_FOUND",
			message: "Workspace not found",
		});
	}

	// Check kill switch
	if (workspace.disabled) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "Workspace operations disabled",
		});
	}

	// Personal workspace - only owner has access
	if (workspace.isPersonal) {
		if (workspace.ownerUserId !== userId) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Not workspace owner",
			});
		}
		return { workspace };
	}

	// Shared workspace - check membership
	const member = await ctx.db
		.query("workspaceMembers")
		.withIndex("by_workspace_user", (q) =>
			q.eq("workspaceId", workspaceId).eq("userId", userId),
		)
		.unique();

	if (!member) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "Not a workspace member",
		});
	}

	if (roleRank(member.role) < roleRank(minRole)) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: `Insufficient permissions. Required: ${minRole}, have: ${member.role}`,
		});
	}

	return { workspace, member };
}

/**
 * Assert that the current user is a member of the workspace with minimum role.
 * This is the SINGLE SOURCE OF TRUTH for workspace access control.
 *
 * For QUERIES: Read-only, won't create users
 *
 * Following Convex best practices: https://docs.convex.dev/auth/database-auth
 */
export async function assertMemberReadOnly(
	ctx: QueryCtx,
	workspaceId: Id<"workspaces">,
	minRole: Role = "viewer",
): Promise<{ workspace: Doc<"workspaces">; member?: Doc<"workspaceMembers"> }> {
	// Use unified auth shim - works in production and tests
	const userId = await requireUserIdReadOnly(ctx);
	if (!userId) {
		throw new ConvexError({
			code: "UNAUTHENTICATED",
			message: "Authentication required",
		});
	}

	const workspace = await ctx.db.get(workspaceId);
	if (!workspace) {
		throw new ConvexError({
			code: "NOT_FOUND",
			message: "Workspace not found",
		});
	}

	// Check kill switch
	if (workspace.disabled) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "Workspace operations disabled",
		});
	}

	// Personal workspace - only owner has access
	if (workspace.isPersonal) {
		if (workspace.ownerUserId !== userId) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Not workspace owner",
			});
		}
		return { workspace };
	}

	// Shared workspace - check membership
	const member = await ctx.db
		.query("workspaceMembers")
		.withIndex("by_workspace_user", (q) =>
			q.eq("workspaceId", workspaceId).eq("userId", userId),
		)
		.unique();

	if (!member) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "Not a workspace member",
		});
	}

	if (roleRank(member.role) < roleRank(minRole)) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: `Insufficient permissions. Required: ${minRole}, have: ${member.role}`,
		});
	}

	return { workspace, member };
}

/**
 * Assert that the workspace allows write operations.
 * Checks kill switch for write operations specifically.
 */
export async function assertWriteEnabled(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<"workspaces">,
	minRole: Role = "editor",
): Promise<{ workspace: Doc<"workspaces">; member?: Doc<"workspaceMembers"> }> {
	const result = await assertMember(ctx, workspaceId, minRole);

	// Kill switch blocks all writes
	if (result.workspace.disabled) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "Workspace operations disabled",
		});
	}

	return result;
}

/**
 * Check if workspace can accept invites
 */
export function assertCanInvite(workspace: Doc<"workspaces">): void {
	if (workspace.isPersonal) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "Cannot invite to personal workspace",
		});
	}

	if (workspace.plan === "free" && workspace.type === "shared") {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "Invites not available on free plan",
		});
	}
}

// Reserved slugs that cannot be claimed
const RESERVED_SLUGS = new Set([
	"workspace",
	"me",
	"w",
	"api",
	"auth",
	"login",
	"logout",
	"settings",
	"billing",
	"admin",
	"docs",
	"help",
	"support",
	"status",
	"assets",
	"static",
	"_next",
	"graphql",
	"v1",
	"v2",
	"robots.txt",
	"sitemap.xml",
	"favicon.ico",
	"manifest.json",
	".well-known",
	"health",
	"ping",
	"dashboard",
	"app",
	"console",
	"portal",
	"about",
	"privacy",
	"terms",
	"blog",
	"news",
	"features",
	"pricing",
	"contact",
	"enterprise",
]);

/**
 * Normalize a slug to a consistent, safe format.
 *
 * Rules:
 * - Lowercase
 * - Remove diacritics
 * - Replace non-alphanumeric with hyphens
 * - No leading/trailing hyphens
 * - No consecutive hyphens
 * - 1-32 characters
 * - Must start and end with alphanumeric
 * - Cannot be reserved
 */
export function normalizeSlug(raw: string): string {
	if (!raw || typeof raw !== "string") {
		throw new ConvexError({
			code: "INVALID_ARGUMENT",
			message: "Slug is required",
		});
	}

	// Normalize Unicode and remove diacritics
	const cleaned = raw
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphens
		.replace(/-+/g, "-") // Collapse multiple hyphens
		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

	// Validate format
	if (!/^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/.test(cleaned)) {
		throw new ConvexError({
			code: "INVALID_ARGUMENT",
			message:
				"Invalid slug format. Must be 1-32 characters, start/end with alphanumeric",
		});
	}

	// Check reserved words
	if (RESERVED_SLUGS.has(cleaned)) {
		throw new ConvexError({
			code: "INVALID_ARGUMENT",
			message: "Slug is reserved",
		});
	}

	return cleaned;
}

/**
 * Log an event to the telemetry system.
 * NEVER logs PII - all data is sanitized.
 */
export async function logEvent(
	ctx: MutationCtx,
	workspaceId: Id<"workspaces">,
	type: Doc<"events">["type"],
	entity: string,
	entityId: string,
	meta?: Record<string, unknown>,
): Promise<void> {
	const userId = await getUserId(ctx);
	if (!userId) return; // Skip logging if no user

	// Sanitize metadata - remove any potential PII
	const sanitizedMeta = meta ? sanitizeEventMeta(meta) : undefined;

	await ctx.db.insert("events", {
		workspaceId,
		actorUserId: userId,
		type,
		entity,
		entityId,
		meta: sanitizedMeta,
		createdAt: Date.now(),
	});
}

/**
 * Sanitize event metadata to remove PII.
 * This is critical for GDPR compliance and security.
 */
function sanitizeEventMeta(
	meta: Record<string, unknown>,
): Record<string, unknown> {
	const sanitized: Record<string, unknown> = {};

	const SENSITIVE_KEYS = new Set([
		"email",
		"password",
		"token",
		"key",
		"secret",
		"api_key",
		"auth",
		"phone",
		"address",
		"ssn",
		"credit_card",
		"payment",
		"billing",
		"personal",
		"private",
		"confidential",
		"title",
		"content",
		"body",
		"message",
		"description",
		"name",
		"username",
	]);

	const SENSITIVE_PATTERNS = [
		/email/i,
		/password/i,
		/token/i,
		/key/i,
		/secret/i,
		/api[_-]?key/i,
		/auth/i,
		/phone/i,
		/address/i,
		/ssn/i,
		/social[_-]?security/i,
		/credit[_-]?card/i,
		/payment/i,
		/billing/i,
		/personal/i,
		/private/i,
		/confidential/i,
		/\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
		/\b4[0-9]{12}(?:[0-9]{3})?\b/, // Credit card pattern
		/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
	];

	function isSensitive(key: string, value: unknown): boolean {
		// Check key names
		if (SENSITIVE_KEYS.has(key.toLowerCase())) return true;

		// Check patterns
		if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) return true;

		// Check value patterns if it's a string
		if (typeof value === "string") {
			if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(value)))
				return true;
		}

		return false;
	}

	for (const [key, value] of Object.entries(meta)) {
		if (isSensitive(key, value)) {
			// Replace with length/type info only
			if (typeof value === "string") {
				sanitized[`${key}_length`] = value.length;
			} else {
				sanitized[`${key}_type`] = typeof value;
			}
		} else if (typeof value === "object" && value !== null) {
			// Recursively sanitize objects
			if (Array.isArray(value)) {
				sanitized[key] = value.map((item, index) =>
					typeof item === "object" ? `[object_${index}]` : item,
				);
			} else {
				sanitized[key] = "[object]";
			}
		} else {
			// Safe primitive values
			sanitized[key] = value;
		}
	}

	return sanitized;
}

/**
 * Check rate limit for a specific operation.
 * Returns true if within limit, false if exceeded.
 */
export async function checkRateLimit(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
	type: Doc<"rateLimits">["type"],
	workspaceId?: Id<"workspaces">,
	limit = 10,
	windowMinutes = 60,
): Promise<boolean> {
	const now = Date.now();
	const windowStart = now - windowMinutes * 60 * 1000;

	const rateLimitRecord = await ctx.db
		.query("rateLimits")
		.withIndex(workspaceId ? "by_workspace_type" : "by_user_type", (q) => {
			if (workspaceId) {
				return q.eq("workspaceId", workspaceId).eq("type", type);
			}
			return q.eq("userId", userId).eq("type", type);
		})
		.unique();

	// No record means first use - within limit
	if (!rateLimitRecord) return true;

	// Check if we're in a new window
	if (rateLimitRecord.windowStart < windowStart) return true;

	// Check current count against limit
	return rateLimitRecord.count < limit;
}

/**
 * Increment rate limit counter.
 * Should be called after successful operation.
 */
export async function incrementRateLimit(
	ctx: MutationCtx,
	userId: Id<"users">,
	type: Doc<"rateLimits">["type"],
	workspaceId?: Id<"workspaces">,
	windowMinutes = 60,
): Promise<void> {
	const now = Date.now();
	const windowStart = now - windowMinutes * 60 * 1000;
	const windowEnd = now + windowMinutes * 60 * 1000;

	const existing = await ctx.db
		.query("rateLimits")
		.withIndex(workspaceId ? "by_workspace_type" : "by_user_type", (q) => {
			if (workspaceId) {
				return q.eq("workspaceId", workspaceId).eq("type", type);
			}
			return q.eq("userId", userId).eq("type", type);
		})
		.unique();

	if (existing && existing.windowStart >= windowStart) {
		// Increment existing counter
		await ctx.db.patch(existing._id, {
			count: existing.count + 1,
			updatedAt: now,
		});
	} else {
		// Create new or reset window
		if (existing) {
			await ctx.db.replace(existing._id, {
				userId,
				workspaceId,
				type,
				count: 1,
				windowStart: now,
				windowEnd,
				updatedAt: now,
			});
		} else {
			await ctx.db.insert("rateLimits", {
				userId,
				workspaceId,
				type,
				count: 1,
				windowStart: now,
				windowEnd,
				updatedAt: now,
			});
		}
	}
}

/**
 * Content sanitization for XSS prevention
 */
export function sanitizeContent(content: string): string {
	if (!content || typeof content !== "string") return "";

	// Remove script tags and javascript: links
	return content
		.replace(/<script[^>]*>.*?<\/script>/gi, "")
		.replace(/javascript:/gi, "")
		.replace(/on\w+\s*=/gi, "")
		.replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
		.replace(/<object[^>]*>.*?<\/object>/gi, "")
		.replace(/<embed[^>]*>/gi, "");
}

/**
 * Generate file storage URL with workspace isolation
 */
export function generateFileUrl(
	workspaceId: Id<"workspaces">,
	fileName: string,
	fileId: string,
): string {
	// Ensure workspace isolation in file paths
	return `/files/${workspaceId}/${fileId}/${encodeURIComponent(fileName)}`;
}

/**
 * Log an activity to the activities table for workspace timeline.
 * Unlike logEvent (telemetry), this captures user-facing activities.
 */
export async function logActivity(
	ctx: MutationCtx,
	activity: {
		workspaceId: Id<"workspaces">;
		actorId: Id<"users">;
		actorType: "user" | "agent";
		entityType: "project" | "idea" | "client" | "workspace" | "member";
		entityId: string;
		action:
			| "created"
			| "updated"
			| "deleted"
			| "moved"
			| "assigned"
			| "commented"
			| "completed";
		description: string;
		metadata?: Record<string, unknown>;
	},
): Promise<void> {
	await ctx.db.insert("activities", {
		workspaceId: activity.workspaceId,
		actorId: activity.actorId,
		actorType: activity.actorType,
		entityType: activity.entityType,
		entityId: activity.entityId,
		action: activity.action,
		description: activity.description,
		metadata: activity.metadata,
		createdAt: Date.now(),
	});
}
