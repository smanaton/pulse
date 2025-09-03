/**
 * Workspace Management Functions
 *
 * Core functions for creating, managing, and accessing workspaces.
 * Every function enforces workspace isolation through assertMember.
 */

import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
	assertCanInvite,
	assertMember,
	assertWriteEnabled,
	checkRateLimit,
	incrementRateLimit,
	logEvent,
	normalizeSlug,
} from "./helpers";
import { requireUserId } from "./server/lib/authz";
import { getUserIdReadOnly } from "./server/lib/authz";
import {
	emptyArgs,
	workspaceByIdArgs,
	workspaceBySlugArgs,
	workspaceCreateSharedArgs,
	workspaceKillSwitchArgs,
	workspaceListMembersArgs,
	workspaceMemberInviteArgs,
	workspaceMemberRemoveArgs,
	workspaceMemberRoleUpdateArgs,
} from "./validators";

/**
 * Get or create personal workspace (idempotent).
 * Used by /workspace route loader.
 */
export const getOrCreatePersonal = mutation({
	args: emptyArgs,
	handler: async (ctx, _args) => {
		const userId = await requireUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "Authentication required",
			});
		}

		// Check if personal workspace already exists
		const existing = await ctx.db
			.query("workspaces")
			.withIndex("personal_by_owner", (q) =>
				q.eq("ownerUserId", userId).eq("isPersonal", true),
			)
			.unique();

		if (existing) {
			return existing;
		}

		// Create new personal workspace
		const now = Date.now();
		const workspaceId = await ctx.db.insert("workspaces", {
			type: "personal",
			isPersonal: true,
			plan: "free", // Personal workspaces are always free
			name: "Personal Workspace",
			// slug is undefined for personal workspaces
			ownerUserId: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log creation event
		await logEvent(
			ctx,
			workspaceId,
			"personal_workspace_created",
			"workspace",
			workspaceId,
		);

		return await ctx.db.get(workspaceId);
	},
});

/**
 * Get workspace by slug (for /w/:slug routes).
 * Returns 404 if workspace doesn't exist, 403 if user isn't a member.
 */
export const getBySlug = query({
	args: workspaceBySlugArgs,
	handler: async (ctx, { slug }) => {
		const normalizedSlug = normalizeSlug(slug);

		const workspace = await ctx.db
			.query("workspaces")
			.withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
			.unique();

		if (!workspace) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Workspace not found",
			});
		}

		// This will throw 403 if user is not a member
		await assertMember(ctx, workspace._id, "viewer");

		return workspace;
	},
});

/**
 * Get workspace by ID (internal use).
 */
export const getById = query({
	args: workspaceByIdArgs,
	handler: async (ctx, { workspaceId }) => {
		await assertMember(ctx, workspaceId, "viewer");
		return await ctx.db.get(workspaceId);
	},
});

/**
 * Create a shared workspace.
 */
export const createShared = mutation({
	args: workspaceCreateSharedArgs,
	handler: async (ctx, { name, slug, plan = "free" }) => {
		const userId = await requireUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "Authentication required",
			});
		}

		// Normalize and validate slug
		const normalizedSlug = normalizeSlug(slug);

		// Check if slug is already taken
		const existing = await ctx.db
			.query("workspaces")
			.withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
			.unique();

		if (existing) {
			throw new ConvexError({
				code: "CONFLICT",
				message: "Slug is already taken",
			});
		}

		// Sanitize name
		const sanitizedName = name.trim().substring(0, 100);
		if (!sanitizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Workspace name is required",
			});
		}

		const now = Date.now();

		// Create workspace
		const workspaceId = await ctx.db.insert("workspaces", {
			type: "shared",
			isPersonal: false,
			plan,
			name: sanitizedName,
			slug: normalizedSlug,
			// ownerUserId is undefined for shared workspaces
			createdAt: now,
			updatedAt: now,
		});

		// Add creator as owner
		await ctx.db.insert("workspaceMembers", {
			workspaceId,
			userId,
			role: "owner",
			joinedAt: now,
			createdAt: now,
		});

		// Log creation event
		await logEvent(
			ctx,
			workspaceId,
			"workspace_created",
			"workspace",
			workspaceId,
			{ plan },
		);

		return await ctx.db.get(workspaceId);
	},
});

/**
 * Invite a user to a workspace.
 */
export const inviteMember = mutation({
	args: workspaceMemberInviteArgs,
	handler: async (ctx, { workspaceId, email, role }) => {
		const userId = await requireUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "Authentication required",
			});
		}

		// Check membership and permissions (admin required to invite)
		const { workspace } = await assertWriteEnabled(ctx, workspaceId, "admin");

		// Check if workspace allows invites
		assertCanInvite(workspace);

		// Check rate limits
		const withinWorkspaceLimit = await checkRateLimit(
			ctx,
			userId,
			"invite_per_workspace",
			workspaceId,
			10, // 10 per hour per workspace
			60,
		);

		if (!withinWorkspaceLimit) {
			throw new ConvexError({
				code: "RATE_LIMITED",
				message:
					"Too many invites sent for this workspace. Please try again later.",
			});
		}

		const withinUserLimit = await checkRateLimit(
			ctx,
			userId,
			"invite_per_user",
			undefined,
			50, // 50 per day per user
			24 * 60,
		);

		if (!withinUserLimit) {
			throw new ConvexError({
				code: "RATE_LIMITED",
				message: "Daily invite limit exceeded. Please try again tomorrow.",
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "Invalid email format",
			});
		}

		// Find user by email
		const invitedUser = await ctx.db
			.query("users")
			.filter((q) => q.eq(q.field("email"), email))
			.unique();

		if (!invitedUser) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "User not found. They need to create an account first.",
			});
		}

		// Check if user is already a member
		const existingMember = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_user", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", invitedUser._id),
			)
			.unique();

		if (existingMember) {
			throw new ConvexError({
				code: "CONFLICT",
				message: "User is already a member of this workspace",
			});
		}

		const now = Date.now();

		// Create membership
		const memberId = await ctx.db.insert("workspaceMembers", {
			workspaceId,
			userId: invitedUser._id,
			role,
			invitedBy: userId,
			invitedAt: now,
			joinedAt: now, // For simplicity, auto-join. In real app, would be pending.
			createdAt: now,
		});

		// Increment rate limits
		await incrementRateLimit(
			ctx,
			userId,
			"invite_per_workspace",
			workspaceId,
			60,
		);
		await incrementRateLimit(
			ctx,
			userId,
			"invite_per_user",
			undefined,
			24 * 60,
		);

		// Log invite event
		await logEvent(
			ctx,
			workspaceId,
			"invite_sent",
			"workspaceMember",
			memberId,
			{ role, invitedUserEmail: `${email.split("@")[0]}@***` }, // Sanitized email
		);

		await logEvent(
			ctx,
			workspaceId,
			"member_joined",
			"workspaceMember",
			memberId,
			{ role },
		);

		return await ctx.db.get(memberId);
	},
});

/**
 * List workspace members.
 */
export const listMembers = query({
	args: workspaceListMembersArgs,
	handler: async (ctx, { workspaceId }) => {
		await assertMember(ctx, workspaceId, "viewer");

		const members = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.collect();

		// Get user details for each member
		const membersWithUsers = await Promise.all(
			members.map(async (member) => {
				const user = await ctx.db.get(member.userId);
				return {
					...member,
					user,
				};
			}),
		);

		return membersWithUsers;
	},
});

/**
 * Remove a member from workspace.
 */
export const removeMember = mutation({
	args: workspaceMemberRemoveArgs,
	handler: async (ctx, { workspaceId, userId }) => {
		const currentUserId = await requireUserId(ctx);
		if (!currentUserId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "Authentication required",
			});
		}

		// Check permissions (admin required, or removing self)
		const { member: currentMember } = await assertMember(
			ctx,
			workspaceId,
			"viewer",
		);

		const isAdmin =
			currentMember && ["admin", "owner"].includes(currentMember.role);
		const isRemovingSelf = currentUserId === userId;

		if (!isAdmin && !isRemovingSelf) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Admin permissions required to remove other members",
			});
		}

		// Find member to remove
		const memberToRemove = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_user", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.unique();

		if (!memberToRemove) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Member not found",
			});
		}

		// Cannot remove workspace owner
		if (memberToRemove.role === "owner") {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Cannot remove workspace owner",
			});
		}

		// Remove membership
		await ctx.db.delete(memberToRemove._id);

		// Log removal event
		await logEvent(
			ctx,
			workspaceId,
			"member_removed",
			"workspaceMember",
			memberToRemove._id,
			{ removedRole: memberToRemove.role, removedBySelf: isRemovingSelf },
		);
	},
});

/**
 * Update member role.
 */
export const updateMemberRole = mutation({
	args: workspaceMemberRoleUpdateArgs,
	handler: async (ctx, { workspaceId, userId, newRole }) => {
		// Check permissions (admin required)
		await assertWriteEnabled(ctx, workspaceId, "admin");

		// Find member to update
		const member = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_user", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.unique();

		if (!member) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Member not found",
			});
		}

		// Cannot change owner role
		if (member.role === "owner") {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Cannot change owner role",
			});
		}

		const oldRole = member.role;

		// Update role
		await ctx.db.patch(member._id, {
			role: newRole,
		});

		// Log role change
		await logEvent(
			ctx,
			workspaceId,
			"member_role_updated",
			"workspaceMember",
			member._id,
			{ oldRole, newRole },
		);

		return await ctx.db.get(member._id);
	},
});

/**
 * Set workspace kill switch.
 */
export const setKillSwitch = mutation({
	args: workspaceKillSwitchArgs,
	handler: async (ctx, { workspaceId, disabled }) => {
		// Only owner can set kill switch
		await assertMember(ctx, workspaceId, "owner");

		await ctx.db.patch(workspaceId, {
			disabled,
			updatedAt: Date.now(),
		});

		// Log kill switch event
		await logEvent(
			ctx,
			workspaceId,
			disabled ? "kill_switch_enabled" : "kill_switch_disabled",
			"workspace",
			workspaceId,
		);

		return await ctx.db.get(workspaceId);
	},
});

/**
 * List user's workspaces.
 */
export const listUserWorkspaces = query({
	args: emptyArgs,
	handler: async (ctx, _args) => {
		const userId = await getUserIdReadOnly(ctx);
		if (!userId) {
			return [];
		}

		// Get personal workspace
		const personal = await ctx.db
			.query("workspaces")
			.withIndex("personal_by_owner", (q) =>
				q.eq("ownerUserId", userId).eq("isPersonal", true),
			)
			.unique();

		// Get shared workspaces where user is a member
		const memberships = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const sharedWorkspaces = await Promise.all(
			memberships.map(async (membership) => {
				const workspace = await ctx.db.get(membership.workspaceId);
				return workspace ? { ...workspace, memberRole: membership.role } : null;
			}),
		);

		const workspaces = [];

		if (personal) {
			workspaces.push({ ...personal, memberRole: "owner" });
		}

		sharedWorkspaces.forEach((ws) => {
			if (ws) workspaces.push(ws);
		});

		return workspaces;
	},
});
