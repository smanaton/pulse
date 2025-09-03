import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { invalidatePatterns, queryKeys } from "../lib/query-client";

// Types
export interface Client {
	_id: Id<"clients">;
	_creationTime: number;
	workspaceId: Id<"workspaces">;
	name: string;
	email?: string;
	phone?: string;
	company?: string;
	website?: string;
	notes?: string;
	status: "active" | "inactive";
	tags?: string[];
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	};
	createdBy: Id<"users">;
	deletedAt?: number;
	createdAt: number;
	updatedAt: number;
}

export interface CreateClientInput {
	workspaceId: Id<"workspaces">;
	name: string;
	email?: string;
	phone?: string;
	company?: string;
	website?: string;
	notes?: string;
	tags?: string[];
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	};
}

export interface UpdateClientInput {
	clientId: Id<"clients">;
	name?: string;
	email?: string;
	phone?: string;
	company?: string;
	website?: string;
	notes?: string;
	status?: "active" | "inactive";
	tags?: string[];
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	};
}

// Query hooks
export function useClients(
	workspaceId: Id<"workspaces"> | undefined,
	options?: {
		status?: "active" | "inactive";
		search?: string;
		limit?: number;
	},
) {
	const convex = useConvex();

	return useQuery({
		queryKey: [...queryKeys.clients.byWorkspace(workspaceId || ""), options],
		queryFn: () => {
			if (!workspaceId) {
				throw new Error("Workspace ID is required");
			}
			return convex.query(api.clients.list, {
				workspaceId,
				...options,
			});
		},
		enabled: !!workspaceId,
	});
}

export function useClient(clientId: Id<"clients">) {
	const convex = useConvex();

	return useQuery({
		queryKey: queryKeys.clients.byId(clientId),
		queryFn: () => convex.query(api.clients.getById, { clientId }),
		enabled: !!clientId,
	});
}

export function useClientsByProject(projectId: Id<"projects">) {
	const convex = useConvex();

	return useQuery({
		queryKey: queryKeys.clients.byProject(projectId),
		queryFn: () => convex.query(api.clients.getByProject, { projectId }),
		enabled: !!projectId,
	});
}

// Mutation hooks
export function useCreateClient() {
	const convex = useConvex();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateClientInput) =>
			convex.mutation(api.clients.create, input),
		onSuccess: (newClient, variables) => {
			// Invalidate and refetch clients list
			queryClient.invalidateQueries({
				queryKey: queryKeys.clients.byWorkspace(variables.workspaceId),
			});

			// Invalidate activities
			invalidatePatterns.activities(variables.workspaceId).forEach((key) => {
				queryClient.invalidateQueries({ queryKey: key });
			});

			// Add to cache
			queryClient.setQueryData(
				queryKeys.clients.byId(newClient?._id || ""),
				newClient,
			);
		},
		onError: (error) => {
			console.error("Failed to create client:", error);
		},
	});
}

export function useUpdateClient() {
	const convex = useConvex();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateClientInput) =>
			convex.mutation(api.clients.update, input),
		onMutate: async (variables) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({
				queryKey: queryKeys.clients.byId(variables.clientId),
			});

			// Snapshot the previous value
			const previousClient = queryClient.getQueryData(
				queryKeys.clients.byId(variables.clientId),
			);

			// Optimistically update
			queryClient.setQueryData(
				queryKeys.clients.byId(variables.clientId),
				(old: Client | undefined) => {
					if (!old) return old;
					return {
						...old,
						...variables,
						updatedAt: Date.now(),
					};
				},
			);

			return { previousClient };
		},
		onError: (_error, variables, context) => {
			// Rollback on error
			queryClient.setQueryData(
				queryKeys.clients.byId(variables.clientId),
				context?.previousClient,
			);
		},
		onSuccess: (updatedClient, variables) => {
			// Update cache with server response
			if (updatedClient) {
				queryClient.setQueryData(
					queryKeys.clients.byId(variables.clientId),
					updatedClient,
				);

				// Invalidate workspace clients list
				const client = queryClient.getQueryData(
					queryKeys.clients.byId(variables.clientId),
				) as Client | undefined;

				if (client) {
					queryClient.invalidateQueries({
						queryKey: queryKeys.clients.byWorkspace(client.workspaceId),
					});

					// Invalidate activities
					invalidatePatterns.activities(client.workspaceId).forEach((key) => {
						queryClient.invalidateQueries({ queryKey: key });
					});
				}
			}
		},
	});
}

export function useDeleteClient() {
	const convex = useConvex();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (clientId: Id<"clients">) =>
			convex.mutation(api.clients.remove, { clientId }),
		onMutate: async (clientId) => {
			// Get client data before deletion for rollback
			const client = queryClient.getQueryData(
				queryKeys.clients.byId(clientId),
			) as Client | undefined;

			// Optimistically remove from cache
			queryClient.removeQueries({
				queryKey: queryKeys.clients.byId(clientId),
			});

			return { client };
		},
		onError: (_error, clientId, context) => {
			// Rollback on error
			if (context?.client) {
				queryClient.setQueryData(
					queryKeys.clients.byId(clientId),
					context.client,
				);
			}
		},
		onSuccess: (_result, _clientId, context) => {
			// Invalidate workspace clients list
			if (context?.client) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.clients.byWorkspace(context.client.workspaceId),
				});

				// Invalidate activities
				invalidatePatterns
					.activities(context.client.workspaceId)
					.forEach((key) => {
						queryClient.invalidateQueries({ queryKey: key });
					});
			}
		},
	});
}

// Project-Client relationship mutations
export function useLinkClientToProject() {
	const convex = useConvex();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			clientId: Id<"clients">;
			projectId: Id<"projects">;
			isPrimary?: boolean;
		}) => convex.mutation(api.clients.linkToProject, input),
		onSuccess: (_result, variables) => {
			// Invalidate project clients
			queryClient.invalidateQueries({
				queryKey: queryKeys.clients.byProject(variables.projectId),
			});

			// Get client and project for activity invalidation
			const client = queryClient.getQueryData(
				queryKeys.clients.byId(variables.clientId),
			) as Client | undefined;

			if (client) {
				invalidatePatterns.activities(client.workspaceId).forEach((key) => {
					queryClient.invalidateQueries({ queryKey: key });
				});
			}
		},
	});
}

export function useUnlinkClientFromProject() {
	const convex = useConvex();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (relationshipId: Id<"projectClients">) =>
			convex.mutation(api.clients.unlinkFromProject, { relationshipId }),
		onSuccess: () => {
			// Invalidate all project-client relationships
			// We don't know which specific project was affected, so invalidate broadly
			queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "clients" && query.queryKey[2] === "project",
			});
		},
	});
}

// Combined hook for client management
export function useClientManagement(workspaceId: Id<"workspaces">) {
	const clients = useClients(workspaceId);
	const createClient = useCreateClient();
	const updateClient = useUpdateClient();
	const deleteClient = useDeleteClient();
	const linkToProject = useLinkClientToProject();
	const unlinkFromProject = useUnlinkClientFromProject();

	return {
		// Queries
		clients: clients.data?.clients || [],
		isLoading: clients.isLoading,
		error: clients.error,

		// Mutations
		createClient: createClient.mutate,
		updateClient: updateClient.mutate,
		deleteClient: deleteClient.mutate,
		linkToProject: linkToProject.mutate,
		unlinkFromProject: unlinkFromProject.mutate,

		// Status
		isCreating: createClient.isPending,
		isUpdating: updateClient.isPending,
		isDeleting: deleteClient.isPending,
		isLinking: linkToProject.isPending,
		isUnlinking: unlinkFromProject.isPending,
	};
}
