import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge, Button } from "flowbite-react";
import {
	AlertTriangle,
	Calendar,
	CheckCircle2,
	Circle,
	Clock,
	Edit,
	Paperclip,
	Timer,
	User,
	Users,
} from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";
import type { KanbanTask as KanbanTaskType } from "../../types/kanban";

interface KanbanTaskProps {
	task: KanbanTaskType;
	onEdit: (task: KanbanTaskType) => void;
	isDragging?: boolean;
}

const getPriorityColor = (priority: string) => {
	switch (priority) {
		case "urgent":
			return "failure";
		case "high":
			return "warning";
		case "medium":
			return "info";
		case "low":
			return "success";
		default:
			return "gray";
	}
};

const getPriorityIcon = (priority: string) => {
	switch (priority) {
		case "urgent":
		case "high":
			return <AlertTriangle className="h-3 w-3" />;
		case "medium":
			return <Circle className="h-3 w-3" />;
		case "low":
			return <CheckCircle2 className="h-3 w-3" />;
		default:
			return <Circle className="h-3 w-3" />;
	}
};

const formatDueDate = (timestamp: number) => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffTime = date.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays === -1) return "Yesterday";
	if (diffDays > 0) return `${diffDays} days left`;
	return `${Math.abs(diffDays)} days overdue`;
};

const getDueDateColor = (timestamp: number) => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffTime = date.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0)
		return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
	if (diffDays <= 1)
		return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
	if (diffDays <= 3)
		return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
	return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
};

export function KanbanTask({
	task,
	onEdit,
	isDragging = false,
}: KanbanTaskProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging: isSortableDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: "task",
			task,
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const isBeingDragged = isDragging || isSortableDragging;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={cn(
				"group cursor-grab rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800",
				"hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600",
				isBeingDragged && "rotate-3 scale-105 shadow-lg",
			)}
		>
			{/* Header with title and edit button */}
			<div className="mb-3 flex items-start justify-between">
				<h4 className="line-clamp-2 flex-1 pr-2 font-semibold text-gray-900 text-sm dark:text-white">
					{task.name}
				</h4>
				<Button
					size="xs"
					color="light"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(task);
					}}
					className="shrink-0 p-1 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<Edit className="h-3 w-3" />
				</Button>
			</div>

			{/* Description */}
			{task.description && (
				<p className="mb-3 line-clamp-2 text-gray-600 text-xs dark:text-gray-400">
					{task.description}
				</p>
			)}

			{/* Tags */}
			{task.tags && task.tags.length > 0 && (
				<div className="mb-3 flex flex-wrap gap-1">
					{task.tags.slice(0, 3).map((tag, index) => (
						<Badge key={index} color="info" size="xs" className="text-xs">
							{tag}
						</Badge>
					))}
					{task.tags.length > 3 && (
						<Badge color="gray" size="xs" className="text-xs">
							+{task.tags.length - 3}
						</Badge>
					)}
				</div>
			)}

			{/* Priority */}
			<div className="mb-3 flex items-center justify-between">
				<Badge
					color={getPriorityColor(task.priority)}
					size="xs"
					className="flex items-center gap-1"
				>
					{getPriorityIcon(task.priority)}
					{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
				</Badge>

				{/* Time tracking */}
				{(task.estimatedHours || task.actualHours) && (
					<div className="flex items-center gap-1 text-gray-500 text-xs dark:text-gray-400">
						<Timer className="h-3 w-3" />
						{task.actualHours && task.estimatedHours ? (
							<span>
								{task.actualHours}h / {task.estimatedHours}h
							</span>
						) : task.estimatedHours ? (
							<span>{task.estimatedHours}h estimated</span>
						) : (
							<span>{task.actualHours}h logged</span>
						)}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between">
				{/* Assignees */}
				<div className="flex items-center">
					{task.assignedTo && task.assignedTo.length > 0 ? (
						<div className="flex items-center gap-1">
							{task.assignedTo.length === 1 ? (
								<User className="h-3 w-3 text-gray-500" />
							) : (
								<Users className="h-3 w-3 text-gray-500" />
							)}
							<span className="text-gray-500 text-xs dark:text-gray-400">
								{task.assignedTo.length} assigned
							</span>
						</div>
					) : (
						<div className="flex items-center gap-1 text-gray-400">
							<User className="h-3 w-3" />
							<span className="text-xs">Unassigned</span>
						</div>
					)}
				</div>

				{/* Due date and attachments */}
				<div className="flex items-center gap-2">
					{task.attachment && <Paperclip className="h-3 w-3 text-gray-500" />}

					{task.dueDate && (
						<div
							className={cn(
								"flex items-center gap-1 rounded px-2 py-1 font-medium text-xs",
								getDueDateColor(task.dueDate),
							)}
						>
							<Calendar className="h-3 w-3" />
							{formatDueDate(task.dueDate)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
