import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery } from "convex/react";

export interface Task {
	_id: Id<"tasks">;
	_creationTime: number;
	workspaceId: Id<"workspaces">;
	projectId: Id<"projects">;
	boardId?: string;
	name: string;
	description?: string;
	status:
		| "backlog"
		| "todo"
		| "in_progress"
		| "in_review"
		| "done"
		| "cancelled";
	priority: "low" | "medium" | "high" | "urgent";
	assignedTo?: Id<"users">[];
	reporterId: Id<"users">;
	parentTaskId?: Id<"tasks">;
	dueDate?: number;
	startDate?: number;
	completedAt?: number;
	estimatedHours?: number;
	actualHours?: number;
	tags?: string[];
	position: number;
	sortKey: number;
	attachments?: Id<"files">[];
	dependencies?: Id<"tasks">[];
	progress?: number;
	createdBy: Id<"users">;
	deletedAt?: number;
	createdAt: number;
	updatedAt: number;
	// Enriched fields from query
	project?: {
		_id: Id<"projects">;
		name: string;
		color?: string;
	} | null;
	assignees?: Array<{
		_id: Id<"users">;
		name?: string;
		email?: string;
		image?: string;
	} | null>;
	reporter?: {
		_id: Id<"users">;
		name?: string;
		email?: string;
		image?: string;
	};
}

export interface TaskComment {
	_id: Id<"taskComments">;
	_creationTime: number;
	taskId: Id<"tasks">;
	workspaceId: Id<"workspaces">;
	projectId: Id<"projects">;
	content: string;
	authorId: Id<"users">;
	parentCommentId?: Id<"taskComments">;
	attachments?: Id<"files">[];
	isInternal?: boolean;
	editedAt?: number;
	deletedAt?: number;
	createdAt: number;
	updatedAt: number;
	author?: {
		_id: Id<"users">;
		name?: string;
		email?: string;
		image?: string;
	};
}

export interface CreateTaskArgs {
	workspaceId: Id<"workspaces">;
	projectId: Id<"projects">;
	name: string;
	description?: string;
	status?:
		| "backlog"
		| "todo"
		| "in_progress"
		| "in_review"
		| "done"
		| "cancelled";
	priority?: "low" | "medium" | "high" | "urgent";
	assignedTo?: Id<"users">[];
	parentTaskId?: Id<"tasks">;
	dueDate?: number;
	startDate?: number;
	estimatedHours?: number;
	tags?: string[];
	boardId?: string;
}

export interface UpdateTaskArgs {
	taskId: Id<"tasks">;
	name?: string;
	description?: string;
	status?:
		| "backlog"
		| "todo"
		| "in_progress"
		| "in_review"
		| "done"
		| "cancelled";
	priority?: "low" | "medium" | "high" | "urgent";
	assignedTo?: Id<"users">[];
	dueDate?: number;
	startDate?: number;
	estimatedHours?: number;
	actualHours?: number;
	tags?: string[];
	progress?: number;
	boardId?: string;
	position?: number;
}

export interface MoveTaskArgs {
	taskId: Id<"tasks">;
	targetBoardId: string;
	targetPosition: number;
}

/**
 * Hook for managing tasks in a workspace or project
 */
export function useTasks(
	workspaceId?: Id<"workspaces">,
	filters?: {
		projectId?: Id<"projects">;
		status?:
			| "backlog"
			| "todo"
			| "in_progress"
			| "in_review"
			| "done"
			| "cancelled";
		assignedTo?: Id<"users">;
		boardId?: string;
		limit?: number;
	},
) {
	const tasks = useQuery(
		api.tasks.list,
		workspaceId
			? {
					workspaceId,
					projectId: filters?.projectId,
					status: filters?.status,
					assignedTo: filters?.assignedTo,
					boardId: filters?.boardId,
					limit: filters?.limit,
				}
			: "skip",
	);

	const createTask = useMutation(api.tasks.create);
	const updateTask = useMutation(api.tasks.update);
	const moveTask = useMutation(api.tasks.move);
	const deleteTask = useMutation(api.tasks.deleteTask);

	return {
		data: tasks ? { tasks } : undefined,
		tasks,
		isLoading: tasks === undefined,
		createTask,
		updateTask,
		moveTask,
		deleteTask,
	};
}

/**
 * Hook for getting a single task by ID
 */
export function useTask(workspaceId?: Id<"workspaces">, taskId?: Id<"tasks">) {
	const task = useQuery(
		api.tasks.get,
		workspaceId && taskId ? { workspaceId, taskId } : "skip",
	);

	const updateTask = useMutation(api.tasks.update);

	return {
		task,
		isLoading: task === undefined,
		updateTask,
	};
}

/**
 * Hook for managing task comments
 */
export function useTaskComments(
	workspaceId?: Id<"workspaces">,
	taskId?: Id<"tasks">,
) {
	const comments = useQuery(
		api.tasks.getComments,
		workspaceId && taskId ? { workspaceId, taskId } : "skip",
	);

	const addComment = useMutation(api.tasks.addComment);
	const updateComment = useMutation(api.tasks.updateComment);
	const deleteComment = useMutation(api.tasks.deleteComment);

	return {
		comments,
		isLoading: comments === undefined,
		addComment,
		updateComment,
		deleteComment,
	};
}

/**
 * Hook for organizing tasks by board/status for kanban view
 */
export function useKanbanTasks(
	workspaceId?: Id<"workspaces">,
	projectId?: Id<"projects">,
) {
	const tasks = useQuery(
		api.tasks.list,
		workspaceId && projectId
			? {
					workspaceId,
					projectId,
					limit: 200, // Get more tasks for kanban view
				}
			: "skip",
	);

	const moveTask = useMutation(api.tasks.move);

	// Organize tasks by board/status
	const boards = tasks ? groupTasksByBoard(tasks) : undefined;

	return {
		boards,
		tasks,
		isLoading: tasks === undefined,
		moveTask,
	};
}

/**
 * Group tasks by their board/status for kanban display
 */
function groupTasksByBoard(tasks: Task[]): Record<string, Task[]> {
	const boards: Record<string, Task[]> = {
		backlog: [],
		todo: [],
		in_progress: [],
		in_review: [],
		done: [],
	};

	tasks.forEach((task) => {
		const boardKey = task.boardId || task.status;
		if (!boards[boardKey]) {
			boards[boardKey] = [];
		}
		boards[boardKey].push(task);
	});

	// Sort tasks within each board by position
	Object.keys(boards).forEach((boardKey) => {
		boards[boardKey].sort((a, b) => a.position - b.position);
	});

	return boards;
}

/**
 * Helper to get task status color
 */
export function getTaskStatusColor(status: Task["status"]): string {
	switch (status) {
		case "backlog":
			return "gray";
		case "todo":
			return "blue";
		case "in_progress":
			return "yellow";
		case "in_review":
			return "purple";
		case "done":
			return "green";
		case "cancelled":
			return "red";
		default:
			return "gray";
	}
}

/**
 * Helper to get task priority color
 */
export function getTaskPriorityColor(priority: Task["priority"]): string {
	switch (priority) {
		case "low":
			return "green";
		case "medium":
			return "blue";
		case "high":
			return "yellow";
		case "urgent":
			return "red";
		default:
			return "gray";
	}
}
