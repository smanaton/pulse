import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery } from "convex/react";

export interface Project {
	_id: Id<"projects">;
	_creationTime: number;
	workspaceId: Id<"workspaces">;
	name: string;
	description?: string;
	status: "active" | "on_hold" | "completed" | "archived";
	priority?: "low" | "medium" | "high" | "urgent";
	startDate?: number;
	endDate?: number;
	ownerId: Id<"users">;
	clientId?: Id<"clients">;
	tags?: string[];
	color?: string;
	budget?: number;
	estimatedHours?: number;
	actualHours?: number;
	progress?: number;
	isTemplate?: boolean;
	templateId?: Id<"projects">;
	sortKey: number;
	createdBy: Id<"users">;
	deletedAt?: number;
	createdAt: number;
	updatedAt: number;
}

export interface ProjectMember {
	_id: Id<"projectMembers">;
	projectId: Id<"projects">;
	userId: Id<"users">;
	role: "owner" | "manager" | "member" | "viewer";
	canEditTasks?: boolean;
	canManageMembers?: boolean;
	addedBy: Id<"users">;
	addedAt: number;
	user?: {
		_id: Id<"users">;
		name?: string;
		email?: string;
		image?: string;
	};
}

export interface ProjectStats {
	project?: Project;
	tasks: {
		total: number;
		completed: number;
		inProgress: number;
		todo: number;
		overdue: number;
	};
	members: number;
	timeTracking: {
		estimatedHours: number;
		actualHours: number;
		efficiency: number;
	};
	progress: number;
}

export interface CreateProjectArgs {
	workspaceId: Id<"workspaces">;
	name: string;
	description?: string;
	priority?: "low" | "medium" | "high" | "urgent";
	startDate?: number;
	endDate?: number;
	ownerId?: Id<"users">;
	clientId?: Id<"clients">;
	tags?: string[];
	color?: string;
	budget?: number;
	estimatedHours?: number;
	isTemplate?: boolean;
	templateId?: Id<"projects">;
}

export interface UpdateProjectArgs {
	projectId: Id<"projects">;
	name?: string;
	description?: string;
	status?: "active" | "on_hold" | "completed" | "archived";
	priority?: "low" | "medium" | "high" | "urgent";
	startDate?: number;
	endDate?: number;
	ownerId?: Id<"users">;
	clientId?: Id<"clients">;
	tags?: string[];
	color?: string;
	budget?: number;
	estimatedHours?: number;
	actualHours?: number;
	progress?: number;
	sortKey?: number;
}

/**
 * Hook for managing projects in a workspace
 */
export function useProjects(
	workspaceId?: Id<"workspaces">,
	status?: "active" | "on_hold" | "completed" | "archived",
) {
	const projects = useQuery(
		api.projects.list,
		workspaceId ? { workspaceId, status } : "skip",
	);

	const createProject = useMutation(api.projects.create);
	const updateProject = useMutation(api.projects.update);
	const deleteProject = useMutation(api.projects.deleteProject);
	const reorderProjects = useMutation(api.projects.reorder);

	return {
		data: projects ? { projects } : undefined,
		projects,
		isLoading: projects === undefined,
		createProject,
		updateProject,
		deleteProject,
		reorderProjects,
	};
}

/**
 * Hook for getting a single project by ID
 */
export function useProject(
	workspaceId?: Id<"workspaces">,
	projectId?: Id<"projects">,
) {
	const project = useQuery(
		api.projects.get,
		workspaceId && projectId ? { workspaceId, projectId } : "skip",
	);

	const updateProject = useMutation(api.projects.update);

	return {
		project,
		isLoading: project === undefined,
		updateProject,
	};
}

/**
 * Hook for managing project members
 */
export function useProjectMembers(
	workspaceId?: Id<"workspaces">,
	projectId?: Id<"projects">,
) {
	const members = useQuery(
		api.projects.listMembers,
		workspaceId && projectId ? { workspaceId, projectId } : "skip",
	);

	const addMember = useMutation(api.projects.addMember);
	const updateMember = useMutation(api.projects.updateMember);
	const removeMember = useMutation(api.projects.removeMember);

	return {
		members,
		isLoading: members === undefined,
		addMember,
		updateMember,
		removeMember,
	};
}

/**
 * Hook for project statistics and analytics
 */
export function useProjectStats(
	workspaceId?: Id<"workspaces">,
	projectId?: Id<"projects">,
) {
	const stats = useQuery(
		api.projects.getStats,
		workspaceId ? { workspaceId, projectId } : "skip",
	);

	return {
		stats,
		isLoading: stats === undefined,
	};
}
