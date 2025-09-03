import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/dashboard/layout";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { useWorkspaceContext } from "../contexts/workspace-context";
import type {
	KanbanBoard as KanbanBoardType,
	KanbanTask,
} from "../types/kanban";

export const Route = createFileRoute("/kanban")({
	component: KanbanPage,
});

// Mock data for demonstration
const createMockBoards = (workspaceId: string): KanbanBoardType[] => [
	{
		id: "board-1",
		title: "To Do",
		workspaceId: workspaceId as Id<"workspaces">,
		position: 0,
		tasks: [
			{
				id: "task-1",
				name: "Design user dashboard wireframes",
				description:
					"Create wireframes for the main dashboard showing key metrics and user actions",
				boardId: "board-1",
				position: 0,
				status: "todo",
				priority: "high",
				dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
				estimatedHours: 8,
				tags: ["design", "wireframes", "dashboard"],
				assignedTo: [],
				createdBy: "user1" as Id<"users">,
				createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
				updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
			},
			{
				id: "task-2",
				name: "Set up project repository",
				description:
					"Initialize Git repository with proper branch structure and CI/CD pipeline",
				boardId: "board-1",
				position: 1,
				status: "todo",
				priority: "medium",
				dueDate: Date.now() + 1 * 24 * 60 * 60 * 1000, // 1 day from now
				estimatedHours: 4,
				tags: ["setup", "repository", "devops"],
				assignedTo: [],
				createdBy: "user2" as Id<"users">,
				createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
				updatedAt: Date.now() - 6 * 60 * 60 * 1000,
			},
		],
	},
	{
		id: "board-2",
		title: "In Progress",
		workspaceId: workspaceId as Id<"workspaces">,
		position: 1,
		tasks: [
			{
				id: "task-3",
				name: "Implement authentication system",
				description:
					"Build user authentication with JWT tokens, password reset, and email verification",
				boardId: "board-2",
				position: 0,
				status: "in_progress",
				priority: "urgent",
				dueDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
				estimatedHours: 16,
				actualHours: 8,
				tags: ["backend", "auth", "security"],
				assignedTo: [],
				createdBy: "user1" as Id<"users">,
				createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
				updatedAt: Date.now() - 2 * 60 * 60 * 1000,
			},
		],
	},
	{
		id: "board-3",
		title: "Review",
		workspaceId: workspaceId as Id<"workspaces">,
		position: 2,
		tasks: [
			{
				id: "task-4",
				name: "Code review for API endpoints",
				description:
					"Review the REST API implementation for user management and data operations",
				boardId: "board-3",
				position: 0,
				status: "todo", // Using todo as review status
				priority: "medium",
				dueDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
				estimatedHours: 3,
				actualHours: 2,
				tags: ["review", "api", "backend"],
				assignedTo: [],
				createdBy: "user3" as Id<"users">,
				createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
				updatedAt: Date.now() - 1 * 60 * 60 * 1000,
			},
		],
	},
	{
		id: "board-4",
		title: "Done",
		workspaceId: workspaceId as Id<"workspaces">,
		position: 3,
		tasks: [
			{
				id: "task-5",
				name: "Project planning and requirements gathering",
				description:
					"Complete project scope definition, user stories, and technical requirements",
				boardId: "board-4",
				position: 0,
				status: "done",
				priority: "high",
				estimatedHours: 12,
				actualHours: 14,
				tags: ["planning", "requirements", "documentation"],
				assignedTo: [],
				createdBy: "user1" as Id<"users">,
				createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
				updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
			},
			{
				id: "task-6",
				name: "Database schema design",
				description:
					"Design and implement the initial database schema with proper relationships",
				boardId: "board-4",
				position: 1,
				status: "done",
				priority: "high",
				estimatedHours: 8,
				actualHours: 6,
				tags: ["database", "schema", "backend"],
				assignedTo: [],
				createdBy: "user2" as Id<"users">,
				createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
				updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
			},
		],
	},
];

function KanbanPage() {
	const user = useQuery(api.users.getCurrentUser);
	const { currentWorkspace } = useWorkspaceContext();

	// Mock state management - in real app this would connect to backend
	const [boards, setBoards] = useState<KanbanBoardType[]>(() =>
		currentWorkspace ? createMockBoards(currentWorkspace._id) : [],
	);

	// Show loading while checking auth status
	if (user === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-32 w-32 animate-spin rounded-full border-blue-600 border-b-2" />
			</div>
		);
	}

	// If not authenticated, redirect to sign-in
	if (!user) {
		return <Navigate to="/auth/sign-in" replace />;
	}

	// Update boards when workspace changes
	if (currentWorkspace && boards.length === 0) {
		setBoards(createMockBoards(currentWorkspace._id));
	}

	const handleUpdateBoard = (
		boardId: string,
		updates: Partial<KanbanBoardType>,
	) => {
		setBoards((prev) =>
			prev.map((board) =>
				board.id === boardId ? { ...board, ...updates } : board,
			),
		);
	};

	const handleUpdateTask = (taskId: string, updates: Partial<KanbanTask>) => {
		setBoards((prev) =>
			prev
				.map((board) => ({
					...board,
					tasks: board.tasks
						.map((task) =>
							task.id === taskId
								? {
										...task,
										...updates,
										updatedAt: Date.now(),
										// If boardId changed, remove from current board
										...(updates.boardId && updates.boardId !== task.boardId
											? {}
											: {}),
									}
								: task,
						)
						.filter(
							(task) =>
								// Remove task if it was moved to another board
								!(
									task.id === taskId &&
									updates.boardId &&
									updates.boardId !== board.id
								),
						),
				}))
				.map((board) => {
					// Add task to new board if it was moved here
					if (updates.boardId === board.id) {
						const taskExists = board.tasks.some((t) => t.id === taskId);
						if (!taskExists) {
							// Find the task from another board
							const task = prev
								.flatMap((b) => b.tasks)
								.find((t) => t.id === taskId);
							if (task) {
								return {
									...board,
									tasks: [
										...board.tasks,
										{
											...task,
											...updates,
											boardId: board.id,
											updatedAt: Date.now(),
										},
									],
								};
							}
						}
					}
					return board;
				}),
		);
	};

	const handleCreateTask = (boardId: string, taskData: Partial<KanbanTask>) => {
		const newTask: KanbanTask = {
			id: `task-${Date.now()}`,
			name: taskData.name || "",
			description: taskData.description || "",
			boardId,
			position: 0,
			status: "todo",
			priority: taskData.priority || "medium",
			dueDate: taskData.dueDate,
			estimatedHours: taskData.estimatedHours,
			tags: taskData.tags || [],
			assignedTo: taskData.assignedTo || [],
			createdBy: user._id,
			projectId: taskData.projectId,
			clientId: taskData.clientId,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		setBoards((prev) =>
			prev.map((board) =>
				board.id === boardId
					? { ...board, tasks: [newTask, ...board.tasks] }
					: board,
			),
		);
	};

	const handleDeleteTask = (taskId: string) => {
		setBoards((prev) =>
			prev.map((board) => ({
				...board,
				tasks: board.tasks.filter((task) => task.id !== taskId),
			})),
		);
	};

	return (
		<SidebarLayout>
			<KanbanBoard
				boards={boards}
				onUpdateBoard={handleUpdateBoard}
				onUpdateTask={handleUpdateTask}
				onCreateTask={handleCreateTask}
				onDeleteTask={handleDeleteTask}
			/>
		</SidebarLayout>
	);
}
