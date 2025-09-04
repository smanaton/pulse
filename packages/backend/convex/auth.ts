import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Password, GitHub, Google],
	callbacks: {
		async createOrUpdateUser(ctx, args) {
			const { profile, existingUserId } = args;

			// If user already exists, update their profile
			if (existingUserId) {
				const now = Date.now();
				await ctx.db.patch(existingUserId, {
					name: profile.name,
					image: profile.image,
					email: profile.email,
					emailVerified: profile.emailVerified ? Date.now() : undefined,
					updatedAt: now,
				});
				return existingUserId;
			}

			// Create new user
			const now = Date.now();
			const userId = await ctx.db.insert("users", {
				name: profile.name,
				image: profile.image,
				email: profile.email,
				emailVerified: profile.emailVerified ? now : undefined,
				createdAt: now,
				updatedAt: now,
			});

			// Create personal workspace immediately
			const workspaceId = await ctx.db.insert("workspaces", {
				type: "personal",
				isPersonal: true,
				plan: "free",
				name: "Personal Workspace",
				ownerUserId: userId,
				createdAt: now,
				updatedAt: now,
			});

			// Create default navigation preferences
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
					isCustom: false,
					badge: "13",
				},
				{
					id: "chat",
					name: "Chat",
					icon: "MessageCircle",
					href: "/chat",
					isVisible: true,
					sortOrder: 6,
					isCustom: false,
					badge: "3",
				},
			];

			await ctx.db.insert("navigationPreferences", {
				userId,
				workspaceId,
				applications: DEFAULT_APPLICATIONS,
				createdAt: now,
				updatedAt: now,
			});

			// Log events
			await ctx.db.insert("events", {
				workspaceId,
				actorUserId: userId,
				type: "personal_workspace_created",
				entity: "workspace",
				entityId: workspaceId,
				createdAt: now,
			});

			await ctx.db.insert("events", {
				workspaceId,
				actorUserId: userId,
				type: "user_setup_completed",
				entity: "user",
				entityId: userId,
				createdAt: now,
			});

			return userId;
		},
	},
});
