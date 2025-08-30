import type { DefaultOptions } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";

const defaultOptions: DefaultOptions = {
	queries: {
		// Stale-while-revalidate pattern
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

		// Retry configuration
		retry: (failureCount, error: any) => {
			// Don't retry on certain error types
			if (error?.code === "UNAUTHORIZED" || error?.code === "FORBIDDEN") {
				return false;
			}
			// Retry up to 3 times for other errors
			return failureCount < 3;
		},

		// Background refetching
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,

		// Don't refetch on mount if data is fresh
		refetchOnMount: "always", // Change to false if you want to avoid refetching fresh data
	},
	mutations: {
		// Retry mutations on network errors
		retry: (failureCount, error: any) => {
			// Don't retry on client errors
			if (error?.code === "INVALID_ARGUMENT" || error?.code === "NOT_FOUND") {
				return false;
			}
			return failureCount < 2; // Retry mutations up to 2 times
		},

		// Global mutation error handling
		onError: (error: any, variables, context) => {
			console.error("Mutation error:", error);
			// You could add toast notifications here
		},
	},
};

export const queryClient = new QueryClient({ defaultOptions });

// Query key factories for consistent cache management
export const queryKeys = {
	// Workspaces
	workspaces: {
		all: ["workspaces"] as const,
		byId: (workspaceId: string | undefined) =>
			["workspaces", "id", workspaceId] as const,
		bySlug: (slug: string) => ["workspaces", "slug", slug] as const,
		personal: ["workspaces", "personal"] as const,
		members: (workspaceId: string | undefined) =>
			["workspaces", workspaceId, "members"] as const,
	},

	// Projects
	projects: {
		all: ["projects"] as const,
		byWorkspace: (workspaceId: string) =>
			["projects", "workspace", workspaceId] as const,
		byId: (projectId: string) => ["projects", projectId] as const,
	},

	// Clients
	clients: {
		all: ["clients"] as const,
		byWorkspace: (workspaceId: string) =>
			["clients", "workspace", workspaceId] as const,
		byId: (clientId: string) => ["clients", clientId] as const,
		byProject: (projectId: string) =>
			["clients", "project", projectId] as const,
	},

	// Ideas
	ideas: {
		all: ["ideas"] as const,
		byWorkspace: (workspaceId: string) =>
			["ideas", "workspace", workspaceId] as const,
		byProject: (projectId: string) => ["ideas", "project", projectId] as const,
		byId: (ideaId: string) => ["ideas", ideaId] as const,
	},

	// Agents
	agents: {
		all: ["agents"] as const,
		byWorkspace: (workspaceId: string) =>
			["agents", "workspace", workspaceId] as const,
		byType: (workspaceId: string, type: string) =>
			["agents", "workspace", workspaceId, "type", type] as const,
		capabilities: ["agents", "capabilities"] as const,
		usage: (workspaceId: string, days?: number) =>
			["agents", "workspace", workspaceId, "usage", days || 30] as const,
	},

	// Activities
	activities: {
		all: ["activities"] as const,
		byWorkspace: (workspaceId: string) =>
			["activities", "workspace", workspaceId] as const,
		timeline: (workspaceId: string, days?: number) =>
			["activities", "workspace", workspaceId, "timeline", days || 7] as const,
		byEntity: (workspaceId: string, entityType: string, entityId: string) =>
			[
				"activities",
				"workspace",
				workspaceId,
				"entity",
				entityType,
				entityId,
			] as const,
		stats: (workspaceId: string, days?: number) =>
			["activities", "workspace", workspaceId, "stats", days || 30] as const,
	},

	// Members
	members: {
		all: ["members"] as const,
		byWorkspace: (workspaceId: string) =>
			["members", "workspace", workspaceId] as const,
	},

	// Files
	files: {
		all: ["files"] as const,
		byWorkspace: (workspaceId: string) =>
			["files", "workspace", workspaceId] as const,
		byIdea: (ideaId: string) => ["files", "idea", ideaId] as const,
	},

	// Tags
	tags: {
		all: ["tags"] as const,
		byWorkspace: (workspaceId: string) =>
			["tags", "workspace", workspaceId] as const,
	},
};

// Utility functions for cache invalidation
export const invalidatePatterns = {
	// Invalidate all workspace-related data
	workspace: (workspaceId: string) => [
		queryKeys.projects.byWorkspace(workspaceId),
		queryKeys.clients.byWorkspace(workspaceId),
		queryKeys.ideas.byWorkspace(workspaceId),
		queryKeys.agents.byWorkspace(workspaceId),
		queryKeys.activities.byWorkspace(workspaceId),
		queryKeys.members.byWorkspace(workspaceId),
		queryKeys.files.byWorkspace(workspaceId),
		queryKeys.tags.byWorkspace(workspaceId),
	],

	// Invalidate project-related data
	project: (projectId: string, workspaceId?: string) => [
		queryKeys.projects.byId(projectId),
		queryKeys.clients.byProject(projectId),
		queryKeys.ideas.byProject(projectId),
		...(workspaceId ? [queryKeys.projects.byWorkspace(workspaceId)] : []),
	],

	// Invalidate client-related data
	client: (clientId: string, workspaceId?: string) => [
		queryKeys.clients.byId(clientId),
		...(workspaceId ? [queryKeys.clients.byWorkspace(workspaceId)] : []),
	],

	// Invalidate activities after any mutation
	activities: (workspaceId: string) => [
		queryKeys.activities.byWorkspace(workspaceId),
		queryKeys.activities.timeline(workspaceId),
		queryKeys.activities.stats(workspaceId),
	],
};
