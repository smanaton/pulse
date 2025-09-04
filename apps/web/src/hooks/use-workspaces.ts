import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { queryKeys } from "@/lib/query-client";

// Types
interface CreateWorkspaceInput {
	name: string;
	slug: string;
	plan?: "free" | "team";
}

interface Workspace {
	_id: Id<"workspaces">;
	name: string;
	slug?: string;
	type: "personal" | "shared";
	isPersonal: boolean;
	plan: "free" | "team";
	image?: string;
	ownerUserId?: Id<"users">;
	memberRole?: string;
	disabled?: boolean;
	_creationTime: number;
}

interface WorkspaceMember {
	userId: Id<"users">;
	role: "viewer" | "editor" | "admin";
	name?: string;
	email?: string;
}

// Custom hooks using TanStack Query + Convex

export function useWorkspaces() {
	const convex = useConvex();

	return useQuery({
		queryKey: queryKeys.workspaces.all,
		queryFn: async () => {
			const workspaces = await convex.query(api.workspaces.listUserWorkspaces);
			return workspaces as Workspace[];
		},
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: true,
	});
}

export function useWorkspace(workspaceId: Id<"workspaces"> | undefined) {
	const convex = useConvex();

	return useQuery({
		queryKey: queryKeys.workspaces.byId(workspaceId),
		queryFn: async () => {
			if (!workspaceId) return null;
			return await convex.query(api.workspaces.getById, { workspaceId });
		},
		enabled: !!workspaceId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useCreatePersonalWorkspace() {
	const queryClient = useQueryClient();
	const convex = useConvex();

	return useMutation({
		mutationFn: async () => {
			return await convex.mutation(api.workspaces.getOrCreatePersonal);
		},
		onSuccess: (newWorkspace) => {
			if (!newWorkspace) return;

			// Update workspaces cache
			queryClient.setQueryData(
				queryKeys.workspaces.all,
				(old: Workspace[] | undefined) => {
					if (!old) return [newWorkspace];
					const exists = old.some((ws) => ws._id === newWorkspace._id);
					return exists ? old : [...old, newWorkspace];
				},
			);

			// Cache the new workspace individually
			queryClient.setQueryData(
				queryKeys.workspaces.byId(newWorkspace._id),
				newWorkspace,
			);
		},
		onError: (error) => {
			console.error("Failed to create personal workspace:", error);
		},
	});
}

export function useCreateSharedWorkspace() {
	const queryClient = useQueryClient();
	const convex = useConvex();

	return useMutation({
		mutationFn: async (input: CreateWorkspaceInput) => {
			return await convex.mutation(api.workspaces.createShared, input);
		},
		onMutate: async (variables) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.workspaces.all });

			// Snapshot previous value
			const previousWorkspaces = queryClient.getQueryData<Workspace[]>(
				queryKeys.workspaces.all,
			);

			// Optimistically update to the new value
			const optimisticWorkspace: Workspace = {
				_id: `temp-${Date.now()}` as Id<"workspaces">,
				name: variables.name,
				slug: variables.slug,
				type: "shared",
				isPersonal: false,
				plan: variables.plan || "free",
				memberRole: "owner",
				_creationTime: Date.now(),
			};

			queryClient.setQueryData<Workspace[]>(
				queryKeys.workspaces.all,
				(old = []) => [...old, optimisticWorkspace],
			);

			return { previousWorkspaces };
		},
		onError: (_error, _variables, context) => {
			// Rollback on error
			if (context?.previousWorkspaces) {
				queryClient.setQueryData(
					queryKeys.workspaces.all,
					context.previousWorkspaces,
				);
			}
		},
		onSuccess: (newWorkspace, _variables) => {
			if (!newWorkspace) return;

			// Replace optimistic update with real data
			queryClient.setQueryData<Workspace[]>(
				queryKeys.workspaces.all,
				(old = []) => {
					return old
						.map((ws) =>
							ws._id.toString().startsWith("temp-") ? newWorkspace : ws,
						)
						.filter((ws): ws is Workspace => ws !== null);
				},
			);

			// Cache the new workspace individually
			queryClient.setQueryData(
				queryKeys.workspaces.byId(newWorkspace._id),
				newWorkspace,
			);

			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
		},
	});
}

export function useWorkspaceMembers(workspaceId: Id<"workspaces"> | undefined) {
	const convex = useConvex();

	return useQuery({
		queryKey: queryKeys.workspaces.members(workspaceId),
		queryFn: async () => {
			if (!workspaceId) return [];
			return await convex.query(api.workspaces.listMembers, { workspaceId });
		},
		enabled: !!workspaceId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useInviteMember() {
	const queryClient = useQueryClient();
	const convex = useConvex();

	return useMutation({
		mutationFn: async (input: {
			workspaceId: Id<"workspaces">;
			email: string;
			role: "viewer" | "editor" | "admin";
		}) => {
			return await convex.mutation(api.workspaces.inviteMember, input);
		},
		onSuccess: (_newMember, variables) => {
			// Invalidate members list
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.members(variables.workspaceId),
			});

			// Invalidate activities for this workspace
			queryClient.invalidateQueries({
				queryKey: queryKeys.activities.byWorkspace(variables.workspaceId),
			});
		},
	});
}

export function useRemoveMember() {
	const queryClient = useQueryClient();
	const convex = useConvex();

	return useMutation({
		mutationFn: async (input: {
			workspaceId: Id<"workspaces">;
			userId: Id<"users">;
		}) => {
			return await convex.mutation(api.workspaces.removeMember, input);
		},
		onSuccess: (_, variables) => {
			// Invalidate members list
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.members(variables.workspaceId),
			});

			// Invalidate activities
			queryClient.invalidateQueries({
				queryKey: queryKeys.activities.byWorkspace(variables.workspaceId),
			});
		},
	});
}

export function useUpdateMemberRole() {
	const queryClient = useQueryClient();
	const convex = useConvex();

	return useMutation({
		mutationFn: async (input: {
			workspaceId: Id<"workspaces">;
			userId: Id<"users">;
			newRole: "viewer" | "editor" | "admin";
		}) => {
			return await convex.mutation(api.workspaces.updateMemberRole, input);
		},
		onSuccess: (_updatedMember, variables) => {
			// Update member in cache
			queryClient.setQueryData(
				queryKeys.workspaces.members(variables.workspaceId),
				(old: WorkspaceMember[] | undefined) => {
					if (!old) return old;
					return old.map((member) =>
						member.userId === variables.userId
							? { ...member, role: variables.newRole }
							: member,
					);
				},
			);

			// Invalidate activities
			queryClient.invalidateQueries({
				queryKey: queryKeys.activities.byWorkspace(variables.workspaceId),
			});
		},
	});
}

export function useSetWorkspaceKillSwitch() {
	const queryClient = useQueryClient();
	const convex = useConvex();

	return useMutation({
		mutationFn: async (input: {
			workspaceId: Id<"workspaces">;
			disabled: boolean;
		}) => {
			return await convex.mutation(api.workspaces.setKillSwitch, input);
		},
		onSuccess: (updatedWorkspace, variables) => {
			// Update workspace in all caches
			queryClient.setQueryData(
				queryKeys.workspaces.byId(variables.workspaceId),
				updatedWorkspace,
			);

			queryClient.setQueryData<Workspace[]>(
				queryKeys.workspaces.all,
				(old = []) => {
					return old.map((ws) =>
						ws._id === variables.workspaceId
							? { ...ws, disabled: variables.disabled }
							: ws,
					);
				},
			);

			// Invalidate activities
			queryClient.invalidateQueries({
				queryKey: queryKeys.activities.byWorkspace(variables.workspaceId),
			});
		},
	});
}
