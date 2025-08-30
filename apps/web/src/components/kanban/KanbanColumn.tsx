import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "flowbite-react";
import { Plus } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";
import type {
	KanbanBoard,
	KanbanTask as KanbanTaskType,
} from "../../types/kanban";
import { KanbanTask } from "./KanbanTask";

interface KanbanColumnProps {
	board: KanbanBoard;
	onEditTask: (task: KanbanTaskType) => void;
	onCreateTask: () => void;
}

const getColumnColor = (title: string) => {
	switch (title.toLowerCase()) {
		case "todo":
		case "to do":
			return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800";
		case "in progress":
		case "doing":
			return "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20";
		case "done":
		case "completed":
			return "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20";
		case "review":
		case "testing":
			return "border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20";
		default:
			return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800";
	}
};

const getTaskCount = (tasks: KanbanTaskType[]) => {
	return tasks.filter((task) => task.status !== "archived").length;
};

export function KanbanColumn({
	board,
	onEditTask,
	onCreateTask,
}: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `board-${board.id}`,
	});

	const visibleTasks = board.tasks.filter((task) => task.status !== "archived");
	const taskCount = getTaskCount(board.tasks);

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"flex min-h-[600px] w-80 flex-col rounded-lg border-2 transition-colors",
				getColumnColor(board.title),
				isOver && "ring-2 ring-primary-500 ring-opacity-50",
			)}
		>
			{/* Column Header */}
			<div className="flex items-center justify-between border-gray-200 border-b p-4 dark:border-gray-700">
				<div className="flex items-center space-x-2">
					<h3 className="font-semibold text-gray-900 dark:text-white">
						{board.title}
					</h3>
					{taskCount > 0 && (
						<span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-800 text-xs dark:bg-gray-700 dark:text-gray-200">
							{taskCount}
						</span>
					)}
				</div>
				<Button size="xs" color="light" onClick={onCreateTask} className="p-1">
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{/* Tasks Container */}
			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				<SortableContext
					items={visibleTasks.map((t) => t.id)}
					strategy={verticalListSortingStrategy}
				>
					{visibleTasks.length === 0 ? (
						<div className="flex h-32 items-center justify-center text-gray-500 text-sm dark:text-gray-400">
							No tasks yet
						</div>
					) : (
						visibleTasks.map((task) => (
							<KanbanTask key={task.id} task={task} onEdit={onEditTask} />
						))
					)}
				</SortableContext>
			</div>

			{/* Add Task Button */}
			<div className="border-gray-200 border-t p-4 dark:border-gray-700">
				<Button
					color="light"
					onClick={onCreateTask}
					className="w-full justify-center border-2 border-gray-200 border-dashed hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add a card
				</Button>
			</div>
		</div>
	);
}
