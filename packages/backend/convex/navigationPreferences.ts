import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireUserId, requireUserIdReadOnly } from "./server/lib/authz";

// Application definitions - these are the base applications available
const DEFAULT_APPLICATIONS = [
	{
		id: "dashboard",
		name: "Dashboard",
		icon: "Gauge",
		href: "/dashboard",
		isVisible: true,
		sortOrder: 0,
		isCustom: false,
		badge: undefined,
	},
	{
		id: "ideas",
		name: "Ideas",
		icon: "Lightbulb",
		href: "/ideas",
		isVisible: true,
		sortOrder: 1,
		isCustom: false,
		badge: undefined,
	},
	{
		id: "projects",
		name: "Projects",
		icon: "FolderOpen",
		href: "/projects",
		isVisible: true,
		sortOrder: 2,
		isCustom: false,
		badge: undefined,
	},
	{
		id: "todo",
		name: "To-do",
		icon: "CheckSquare",
		href: "/todo",
		isVisible: true,
		sortOrder: 3,
		isCustom: false,
		badge: undefined,
	},
	{
		id: "calendar",
		name: "Calendar",
		icon: "Calendar",
		href: "/calendar",
		isVisible: true,
		sortOrder: 4,
		isCustom: false,
		badge: undefined,
	},
	{
		id: "email",
		name: "E-mail",
		icon: "Mail",
		href: "/email",
		isVisible: true,
		sortOrder: 5,
		badge: "13",
		isCustom: false,
	},
	{
		id: "chat",
		name: "Chat",
		icon: "MessageCircle",
		href: "/chat",
		isVisible: true,
		sortOrder: 6,
		badge: "3",
		isCustom: false,
	},
	{
		id: "analytics",
		name: "Analytics",
		icon: "BarChart3",
		href: "/analytics",
		isVisible: false, // Hidden by default
		sortOrder: 7,
		isCustom: false,
		badge: undefined,
	},
	{
		id: "team",
		name: "Team",
		icon: "Users",
		href: "/team",
		isVisible: false, // Hidden by default
		sortOrder: 8,
		isCustom: false,
		badge: undefined,
	},
] as const;

/**
 * Get user's navigation preferences for their current workspace
 */
export const getUserNavigationPreferences = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	returns: v.object({
		applications: v.array(
			v.object({
				id: v.string(),
				name: v.string(),
				icon: v.string(),
				href: v.string(),
				isVisible: v.boolean(),
				sortOrder: v.number(),
				badge: v.optional(v.string()),
				isCustom: v.optional(v.boolean()),
				customConfig: v.optional(
					v.object({
						color: v.optional(v.string()),
						description: v.optional(v.string()),
					}),
				),
			}),
		),
	}),
	handler: async (ctx, args) => {
		const userId = await requireUserIdReadOnly(ctx);

		// Get existing preferences
		const existingPrefs = await ctx.db
			.query("navigationPreferences")
			.withIndex("by_user_workspace", (q) =>
				q.eq("userId", userId).eq("workspaceId", args.workspaceId),
			)
			.unique();

		// If no preferences exist, return defaults
		if (!existingPrefs) {
			return {
				applications: DEFAULT_APPLICATIONS.map((app) => ({ ...app })),
			};
		}

		return {
			applications: existingPrefs.applications,
		};
	},
});

/**
 * Update user's navigation preferences
 */
export const updateNavigationPreferences = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		applications: v.array(
			v.object({
				id: v.string(),
				name: v.string(),
				icon: v.string(),
				href: v.string(),
				isVisible: v.boolean(),
				sortOrder: v.number(),
				badge: v.optional(v.string()),
				isCustom: v.optional(v.boolean()),
				customConfig: v.optional(
					v.object({
						color: v.optional(v.string()),
						description: v.optional(v.string()),
					}),
				),
			}),
		),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const now = Date.now();

		// Check if preferences already exist
		const existingPrefs = await ctx.db
			.query("navigationPreferences")
			.withIndex("by_user_workspace", (q) =>
				q.eq("userId", userId).eq("workspaceId", args.workspaceId),
			)
			.unique();

		if (existingPrefs) {
			// Update existing preferences
			await ctx.db.patch(existingPrefs._id, {
				applications: args.applications,
				updatedAt: now,
			});
		} else {
			// Create new preferences
			await ctx.db.insert("navigationPreferences", {
				userId,
				workspaceId: args.workspaceId,
				applications: args.applications,
				createdAt: now,
				updatedAt: now,
			});
		}

		// Log the customization event
		await ctx.db.insert("events", {
			workspaceId: args.workspaceId,
			actorUserId: userId,
			type: "navigation_customized",
			entity: "navigation",
			entityId: `${userId}_${args.workspaceId}`,
			meta: {
				visibleCount: args.applications.filter((app) => app.isVisible).length,
				customCount: args.applications.filter((app) => app.isCustom).length,
			},
			createdAt: now,
		});

		return null;
	},
});

/**
 * Reset navigation preferences to defaults
 */
export const resetNavigationPreferences = mutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		// Find existing preferences
		const existingPrefs = await ctx.db
			.query("navigationPreferences")
			.withIndex("by_user_workspace", (q) =>
				q.eq("userId", userId).eq("workspaceId", args.workspaceId),
			)
			.unique();

		if (existingPrefs) {
			// Delete existing preferences (will fall back to defaults)
			await ctx.db.delete(existingPrefs._id);

			// Log the reset event
			await ctx.db.insert("events", {
				workspaceId: args.workspaceId,
				actorUserId: userId,
				type: "navigation_customized",
				entity: "navigation",
				entityId: `${userId}_${args.workspaceId}`,
				meta: {
					action: "reset_to_defaults",
				},
				createdAt: Date.now(),
			});
		}

		return null;
	},
});

/**
 * Get available application templates for customization
 */
export const getAvailableApplications = query({
	args: {},
	returns: v.array(
		v.object({
			id: v.string(),
			name: v.string(),
			icon: v.string(),
			href: v.string(),
			isVisible: v.boolean(),
			sortOrder: v.number(),
			badge: v.optional(v.string()),
			isCustom: v.boolean(),
		}),
	),
	handler: async (ctx, _args) => {
		await requireUserIdReadOnly(ctx); // Ensure user is authenticated

		return DEFAULT_APPLICATIONS.map((app) => ({ ...app }));
	},
});

/**
 * Toggle visibility of a specific application
 */
export const toggleApplicationVisibility = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		applicationId: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const _userId = await requireUserId(ctx);

		// Get current preferences
		const prefs = await ctx.runQuery(
			api.navigationPreferences.getUserNavigationPreferences,
			{
				workspaceId: args.workspaceId,
			},
		);

		// Toggle the specific application
		const updatedApps = prefs.applications.map((app: any) =>
			app.id === args.applicationId
				? { ...app, isVisible: !app.isVisible }
				: app,
		);

		// Update preferences
		await ctx.runMutation(
			api.navigationPreferences.updateNavigationPreferences,
			{
				workspaceId: args.workspaceId,
				applications: updatedApps,
			},
		);

		return null;
	},
});
