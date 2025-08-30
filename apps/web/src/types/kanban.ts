import type { Id } from "@pulse/backend/dataModel";

export interface KanbanBoard {
	id: string;
	title: string;
	workspaceId: Id<"workspaces">;
	position: number;
	tasks: KanbanTask[];
}

export interface KanbanTask {
	id: string;
	name: string;
	description: string;
	boardId: string;
	position: number;
	status: "todo" | "in_progress" | "done" | "archived";
	priority: "low" | "medium" | "high" | "urgent";
	dueDate?: number;
	estimatedHours?: number;
	actualHours?: number;
	tags?: string[];
	attachment?: Id<"_storage">;
	assignedTo?: Id<"users">[];
	createdBy: Id<"users">;
	projectId?: Id<"projects">;
	clientId?: Id<"clients">;
	createdAt: number;
	updatedAt: number;
}

export interface KanbanMember {
	id: Id<"users">;
	name: string;
	avatar?: string;
	email: string;
}

// For drag and drop operations
export interface DragResult {
	source: {
		droppableId: string;
		index: number;
	};
	destination?: {
		droppableId: string;
		index: number;
	};
	draggableId: string;
}

// For task creation/editing
export interface CreateKanbanTaskInput {
	name: string;
	description: string;
	boardId: string;
	priority: "low" | "medium" | "high" | "urgent";
	dueDate?: number;
	estimatedHours?: number;
	tags?: string[];
	assignedTo?: Id<"users">[];
	projectId?: Id<"projects">;
	clientId?: Id<"clients">;
}

export interface UpdateKanbanTaskInput {
	id: string;
	name?: string;
	description?: string;
	priority?: "low" | "medium" | "high" | "urgent";
	status?: "todo" | "in_progress" | "done" | "archived";
	dueDate?: number;
	estimatedHours?: number;
	actualHours?: number;
	tags?: string[];
	assignedTo?: Id<"users">[];
	projectId?: Id<"projects">;
	clientId?: Id<"clients">;
}

// For board operations
export interface CreateKanbanBoardInput {
	title: string;
	workspaceId: Id<"workspaces">;
}

export interface UpdateKanbanBoardInput {
	id: string;
	title?: string;
	position?: number;
}
