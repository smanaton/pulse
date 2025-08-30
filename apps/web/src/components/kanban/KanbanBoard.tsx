import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { Button } from "flowbite-react";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useWorkspaceContext } from "../../contexts/workspace-context";
import type {
	KanbanBoard as KanbanBoardType,
	KanbanTask as KanbanTaskType,
} from "../../types/kanban";
import { CreateTaskModal } from "./CreateTaskModal";
import { EditTaskModal } from "./EditTaskModal";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";

interface KanbanBoardProps {
	boards: KanbanBoardType[];
	onUpdateBoard?: (boardId: string, updates: Partial<KanbanBoardType>) => void;
	onUpdateTask?: (taskId: string, updates: Partial<KanbanTaskType>) => void;
	onCreateTask?: (boardId: string, task: Partial<KanbanTaskType>) => void;
	onDeleteTask?: (taskId: string) => void;
}

export function KanbanBoard({
	boards,
	onUpdateBoard,
	onUpdateTask,
	onCreateTask,
	onDeleteTask,
}: KanbanBoardProps) {
	const { currentWorkspace } = useWorkspaceContext();
	const [activeTask, setActiveTask] = useState<KanbanTaskType | null>(null);
	const [editingTask, setEditingTask] = useState<KanbanTaskType | null>(null);
	const [createTaskForBoard, setCreateTaskForBoard] = useState<string | null>(
		null,
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3,
			},
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const task = findTask(active.id as string);
		setActiveTask(task);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// If dragging over a column (board)
		if (overId.startsWith("board-")) {
			const boardId = overId.replace("board-", "");
			const task = findTask(activeId);
			if (task && task.boardId !== boardId) {
				onUpdateTask?.(activeId, { boardId });
			}
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTask(null);

		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// Find the task and its current board
		const activeTask = findTask(activeId);
		if (!activeTask) return;

		const activeBoard = boards.find((b) => b.id === activeTask.boardId);
		if (!activeBoard) return;

		// If dropping on a board
		if (overId.startsWith("board-")) {
			const targetBoardId = overId.replace("board-", "");
			if (activeTask.boardId !== targetBoardId) {
				onUpdateTask?.(activeId, { boardId: targetBoardId });
			}
		} else {
			// Reordering within the same board or between boards
			const overTask = findTask(overId);
			if (!overTask) return;

			const overBoard = boards.find((b) => b.id === overTask.boardId);
			if (!overBoard) return;

			if (activeBoard.id === overBoard.id) {
				// Same board - reorder tasks
				const oldIndex = activeBoard.tasks.findIndex((t) => t.id === activeId);
				const newIndex = activeBoard.tasks.findIndex((t) => t.id === overId);

				if (oldIndex !== newIndex) {
					const newTasks = arrayMove(activeBoard.tasks, oldIndex, newIndex);
					onUpdateBoard?.(activeBoard.id, { tasks: newTasks });
				}
			} else {
				// Different boards - move task
				onUpdateTask?.(activeId, { boardId: overBoard.id });
			}
		}
	};

	const findTask = (taskId: string): KanbanTaskType | null => {
		for (const board of boards) {
			const task = board.tasks.find((t) => t.id === taskId);
			if (task) return task;
		}
		return null;
	};

	if (!currentWorkspace) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-gray-900 text-xl dark:text-white">
						No Workspace Selected
					</h2>
					<p className="text-gray-500 dark:text-gray-400">
						Please select a workspace to view kanban boards.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl text-gray-900 dark:text-white">
						Project Board
					</h1>
					<p className="mt-1 text-gray-500 dark:text-gray-400">
						Manage tasks and track project progress
					</p>
				</div>
				<Button
					onClick={() => setCreateTaskForBoard(boards[0]?.id || "")}
					disabled={boards.length === 0}
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Task
				</Button>
			</div>

			{boards.length === 0 ? (
				<div className="flex h-64 items-center justify-center rounded-lg border-2 border-gray-200 border-dashed dark:border-gray-700">
					<div className="text-center">
						<h3 className="mb-2 font-medium text-gray-900 text-lg dark:text-white">
							No boards found
						</h3>
						<p className="mb-4 text-gray-500 dark:text-gray-400">
							Create your first kanban board to start organizing tasks.
						</p>
					</div>
				</div>
			) : (
				<DndContext
					sensors={sensors}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					<div className="overflow-x-auto">
						<div className="inline-flex min-w-full space-x-6 p-6">
							{boards.map((board) => (
								<SortableContext
									key={board.id}
									id={`board-${board.id}`}
									items={board.tasks.map((t) => t.id)}
								>
									<KanbanColumn
										board={board}
										onEditTask={setEditingTask}
										onCreateTask={() => setCreateTaskForBoard(board.id)}
									/>
								</SortableContext>
							))}
						</div>
					</div>

					<DragOverlay>
						{activeTask && (
							<KanbanTask task={activeTask} onEdit={() => {}} isDragging />
						)}
					</DragOverlay>
				</DndContext>
			)}

			{/* Modals */}
			{createTaskForBoard && (
				<CreateTaskModal
					isOpen={true}
					onClose={() => setCreateTaskForBoard(null)}
					boardId={createTaskForBoard}
					onSubmit={(task) => {
						onCreateTask?.(createTaskForBoard, task);
						setCreateTaskForBoard(null);
					}}
				/>
			)}

			{editingTask && (
				<EditTaskModal
					isOpen={true}
					task={editingTask}
					onClose={() => setEditingTask(null)}
					onSubmit={(updates) => {
						onUpdateTask?.(editingTask.id, updates);
						setEditingTask(null);
					}}
					onDelete={() => {
						onDeleteTask?.(editingTask.id);
						setEditingTask(null);
					}}
				/>
			)}
		</div>
	);
}
