import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { queryKeys } from "@/lib/query-client";
import { useCreatePersonalWorkspace, useWorkspaces } from "./use-workspaces";

export function useWorkspace() {
	const convex = useConvex();

	// Get current user using TanStack Query
	const userQuery = useQuery({
		queryKey: ["user", "current"],
		queryFn: () => convex.query(api.users.getCurrentUser),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Get workspaces using TanStack Query
	const workspacesQuery = useWorkspaces();
	const createPersonalWorkspaceMutation = useCreatePersonalWorkspace();

	// Find personal workspace
	const personalWorkspace = workspacesQuery.data?.find((ws) => ws.isPersonal);

	return {
		currentWorkspace: personalWorkspace,
		workspaces: workspacesQuery.data || [],
		createPersonalWorkspace: createPersonalWorkspaceMutation.mutate,
		isLoading: userQuery.isLoading || workspacesQuery.isLoading,
	};
}

export function useCurrentWorkspaceId(): Id<"workspaces"> | null {
	const { currentWorkspace, isLoading } = useWorkspace();

	if (isLoading) return null;

	return currentWorkspace?._id || null;
}
