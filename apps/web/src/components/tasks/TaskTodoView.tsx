import type { Id } from "@pulse/backend/dataModel";
import { Badge, Button, Card, Checkbox } from "flowbite-react";
import {
	AlertTriangle,
	ArrowRight,
	Calendar,
	Clock,
	Plus,
	Star,
} from "lucide-react";
import { useState } from "react";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import type { Task } from "@/hooks/use-tasks";
import { useTasks } from "@/hooks/use-tasks";

interface TaskTodoViewProps {
	projectId?: Id<"projects">;
}

interface TaskPrioritySection {
	priority: "urgent" | "high" | "medium" | "low";
	title: string;
	color: "red" | "orange" | "blue" | "green";
	icon: React.ElementType;
	tasks: Task[];
}

function TaskItem({
	task,
	onToggle,
}: {
	task: Task;
	onToggle: (taskId: string, completed: boolean) => void;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const isCompleted = task.status === "done";

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "urgent":
				return "text-red-500";
			case "high":
				return "text-orange-500";
			case "medium":
				return "text-blue-500";
			case "low":
				return "text-green-500";
			default:
				return "text-gray-500";
		}
	};

	const formatDueDate = (dueDate?: number) => {
		if (!dueDate) return null;
		const date = new Date(dueDate);
		const now = new Date();
		const diffDays = Math.ceil(
			(date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);

		if (diffDays < 0)
			return {
				text: `${Math.abs(diffDays)} days overdue`,
				color: "text-red-500",
			};
		if (diffDays === 0) return { text: "Due today", color: "text-orange-500" };
		if (diffDays === 1)
			return { text: "Due tomorrow", color: "text-yellow-500" };
		return { text: `Due in ${diffDays} days`, color: "text-gray-500" };
	};

	const dueDateInfo = formatDueDate(task.dueDate);

	return (
		<div
			className={`group flex items-start space-x-3 rounded-lg p-3 transition-all duration-200 ${
				isCompleted
					? "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
					: "border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
			}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="flex items-center">
				<Checkbox
					checked={isCompleted}
					onChange={(e) => onToggle(task._id, e.target.checked)}
					className="mt-0.5"
				/>
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h4
							className={`font-medium text-sm transition-all duration-200 ${
								isCompleted
									? "text-gray-500 line-through dark:text-gray-400"
									: "text-gray-900 dark:text-white"
							}`}
						>
							{task.name}
						</h4>

						{task.description && (
							<p
								className={`mt-1 text-xs transition-all duration-200 ${
									isCompleted
										? "text-gray-400 dark:text-gray-500"
										: "text-gray-600 dark:text-gray-400"
								}`}
							>
								{task.description}
							</p>
						)}

						{/* Task metadata */}
						<div className="mt-2 flex items-center space-x-3">
							{/* Priority indicator */}
							<div
								className={`flex items-center space-x-1 ${getPriorityColor(task.priority)}`}
							>
								{task.priority === "urgent" && (
									<AlertTriangle className="h-3 w-3" />
								)}
								{task.priority === "high" && <Star className="h-3 w-3" />}
								{task.priority === "medium" && <Clock className="h-3 w-3" />}
								{task.priority === "low" && <ArrowRight className="h-3 w-3" />}
								<span className="text-xs capitalize">{task.priority}</span>
							</div>

							{/* Due date */}
							{dueDateInfo && (
								<div
									className={`flex items-center space-x-1 ${dueDateInfo.color}`}
								>
									<Calendar className="h-3 w-3" />
									<span className="text-xs">{dueDateInfo.text}</span>
								</div>
							)}

							{/* Estimated hours */}
							{task.estimatedHours && (
								<div className="flex items-center space-x-1 text-gray-500">
									<Clock className="h-3 w-3" />
									<span className="text-xs">{task.estimatedHours}h</span>
								</div>
							)}

							{/* Project indicator */}
							{task.project && (
								<Badge color="gray" size="xs">
									{task.project.name}
								</Badge>
							)}
						</div>

						{/* Assignees */}
						{task.assignees && task.assignees.length > 0 && (
							<div className="mt-2 flex items-center space-x-1">
								{task.assignees.slice(0, 3).map(
									(assignee, index) =>
										assignee && (
											<div key={index} className="flex items-center">
												{assignee.image ? (
													<img
														src={assignee.image}
														alt={assignee.name || assignee.email || "User"}
														className="h-5 w-5 rounded-full"
													/>
												) : (
													<div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
														<span className="text-gray-600 text-xs dark:text-gray-300">
															{(assignee.name ||
																assignee.email ||
																"U")[0].toUpperCase()}
														</span>
													</div>
												)}
											</div>
										),
								)}
								{task.assignees.length > 3 && (
									<span className="text-gray-500 text-xs">
										+{task.assignees.length - 3}
									</span>
								)}
							</div>
						)}
					</div>

					{/* Task actions */}
					{isHovered && !isCompleted && (
						<div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
							<Button
								size="xs"
								color="light"
								className="text-gray-500 hover:text-gray-700"
								onClick={() => console.log("Edit task:", task._id)}
							>
								Edit
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function PrioritySection({
	section,
	onToggleTask,
	onAddTask,
}: {
	section: TaskPrioritySection;
	onToggleTask: (taskId: string, completed: boolean) => void;
	onAddTask: (priority: string) => void;
}) {
	const IconComponent = section.icon;
	const completedTasks = section.tasks.filter((task) => task.status === "done");
	const pendingTasks = section.tasks.filter((task) => task.status !== "done");

	return (
		<Card className="h-fit">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<IconComponent
						className={`h-5 w-5 ${
							section.priority === "urgent"
								? "text-red-500"
								: section.priority === "high"
									? "text-orange-500"
									: section.priority === "medium"
										? "text-blue-500"
										: "text-green-500"
						}`}
					/>
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						{section.title}
					</h3>
					<Badge color={section.color} size="sm">
						{section.tasks.length}
					</Badge>
				</div>
			</div>

			<div className="space-y-2">
				{/* Pending tasks */}
				{pendingTasks.map((task) => (
					<TaskItem key={task._id} task={task} onToggle={onToggleTask} />
				))}

				{/* Add task button */}
				<Button
					size="sm"
					color="light"
					className="w-full border-2 border-gray-300 border-dashed dark:border-gray-600"
					onClick={() => onAddTask(section.priority)}
				>
					<Plus className="mr-2 h-4 w-4" />
					Add {section.title.toLowerCase()} priority task
				</Button>

				{/* Completed tasks (collapsed) */}
				{completedTasks.length > 0 && (
					<div className="mt-3 border-gray-200 border-t pt-3 dark:border-gray-700">
						<div className="mb-2 text-gray-500 text-sm dark:text-gray-400">
							Completed ({completedTasks.length})
						</div>
						<div className="space-y-2">
							{completedTasks.slice(0, 3).map((task) => (
								<TaskItem key={task._id} task={task} onToggle={onToggleTask} />
							))}
							{completedTasks.length > 3 && (
								<div className="py-1 text-center text-gray-500 text-xs">
									+{completedTasks.length - 3} more completed
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}

export function TaskTodoView({ projectId }: TaskTodoViewProps) {
	const { currentWorkspace } = useWorkspaceContext();
	const { tasks, updateTask, createTask } = useTasks(
		currentWorkspace?._id,
		projectId ? { projectId } : undefined,
	);

	const handleToggleTask = async (taskId: string, completed: boolean) => {
		try {
			await updateTask({
				taskId: taskId as Id<"tasks">,
				status: completed ? "done" : "todo",
			});
		} catch (error) {
			console.error("Failed to update task:", error);
		}
	};

	const handleAddTask = (priority: string) => {
		// TODO: Open task creation modal or form
		console.log("Add task with priority:", priority);
	};

	if (!tasks) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i} className="animate-pulse">
						<div className="h-64 rounded bg-gray-200 dark:bg-gray-700" />
					</Card>
				))}
			</div>
		);
	}

	const prioritySections: TaskPrioritySection[] = [
		{
			priority: "urgent",
			title: "Urgent Priority",
			color: "red",
			icon: AlertTriangle,
			tasks: tasks.filter((task) => task.priority === "urgent"),
		},
		{
			priority: "high",
			title: "High Priority",
			color: "orange",
			icon: Star,
			tasks: tasks.filter((task) => task.priority === "high"),
		},
		{
			priority: "medium",
			title: "Medium Priority",
			color: "blue",
			icon: Clock,
			tasks: tasks.filter((task) => task.priority === "medium"),
		},
		{
			priority: "low",
			title: "Low Priority",
			color: "green",
			icon: ArrowRight,
			tasks: tasks.filter((task) => task.priority === "low"),
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl text-gray-900 dark:text-white">
						{projectId ? "Project Tasks" : "My Tasks"}
					</h2>
					<p className="text-gray-500 dark:text-gray-400">
						Organize tasks by priority and track your daily progress
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Calendar className="h-5 w-5 text-gray-400" />
					<span className="text-gray-500 text-sm dark:text-gray-400">
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</span>
				</div>
			</div>

			{/* Priority Sections */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{prioritySections.map((section) => (
					<PrioritySection
						key={section.priority}
						section={section}
						onToggleTask={handleToggleTask}
						onAddTask={handleAddTask}
					/>
				))}
			</div>

			{tasks.length === 0 && (
				<div className="py-12 text-center">
					<Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
					<h3 className="mb-2 font-medium text-gray-900 text-xl dark:text-white">
						No tasks yet
					</h3>
					<p className="mb-6 text-gray-500 dark:text-gray-400">
						Get started by creating your first task in any priority section.
					</p>
					<Button onClick={() => handleAddTask("medium")} className="mx-auto">
						<Plus className="mr-2 h-4 w-4" />
						Create your first task
					</Button>
				</div>
			)}
		</div>
	);
}
