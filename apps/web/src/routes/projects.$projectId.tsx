import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Badge, Button, Card, Progress } from "flowbite-react";
import {
	Activity,
	ArrowLeft,
	Calendar,
	CheckSquare,
	Edit,
	FolderOpen,
	Target,
	Users,
} from "lucide-react";
import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/dashboard/layout";
import { ProjectFilesTable } from "@/components/projects/ProjectFilesTable";
import { TaskTodoView } from "@/components/tasks/TaskTodoView";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";

export const Route = createFileRoute("/projects/$projectId")({
	component: ProjectDetailPage,
});

function ProjectDetailPage() {
	const { projectId } = Route.useParams();
	const user = useQuery(api.users.getCurrentUser);
	const { currentWorkspace } = useWorkspaceContext();
	const { projects } = useProjects(currentWorkspace?._id);
	const { tasks } = useTasks(currentWorkspace?._id, {
		projectId: projectId as Id<"projects">,
	});

	const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "files">(
		"overview",
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

	const project = projects?.find((p) => p._id === projectId);

	if (!project) {
		return (
			<SidebarLayout>
				<div className="flex h-64 items-center justify-center">
					<div className="text-center">
						<Target className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 font-medium text-gray-900 text-xl dark:text-white">
							Project not found
						</h3>
						<p className="mb-4 text-gray-500 dark:text-gray-400">
							The project you're looking for doesn't exist or you don't have
							access to it.
						</p>
						<Link to="/projects">
							<Button>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Projects
							</Button>
						</Link>
					</div>
				</div>
			</SidebarLayout>
		);
	}

	// Calculate project stats
	const projectTasks = tasks || [];
	const completedTasks = projectTasks.filter(
		(task) => task.status === "done",
	).length;
	const totalTasks = projectTasks.length;
	const taskCompletionRate =
		totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

	const overdueTasks = projectTasks.filter((task) => {
		if (!task.dueDate || task.status === "done") return false;
		const dueDate = new Date(task.dueDate);
		const now = new Date();
		return dueDate.getTime() < now.getTime();
	}).length;

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "green";
			case "on_hold":
				return "yellow";
			case "completed":
				return "blue";
			case "archived":
				return "gray";
			default:
				return "gray";
		}
	};

	const getPriorityColor = (priority?: string) => {
		switch (priority) {
			case "urgent":
				return "red";
			case "high":
				return "orange";
			case "medium":
				return "blue";
			case "low":
				return "green";
			default:
				return "gray";
		}
	};

	const formatDueDate = (endDate?: number) => {
		if (!endDate) return null;

		const date = new Date(endDate);
		const now = new Date();
		const diffTime = date.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		const isOverdue = diffDays < 0;
		const isDueSoon = diffDays <= 7 && diffDays >= 0;

		return {
			date: date.toLocaleDateString(),
			isOverdue,
			isDueSoon,
			text: isOverdue
				? `${Math.abs(diffDays)} days overdue`
				: diffDays === 0
					? "Due today"
					: diffDays === 1
						? "Due tomorrow"
						: `${diffDays} days left`,
		};
	};

	const dueDateInfo = formatDueDate(project.endDate);

	return (
		<SidebarLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-4">
						<Link to="/projects">
							<Button size="sm" color="gray" outline>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>

						<div className="flex-1">
							<div className="mb-2 flex items-center space-x-3">
								{project.color && (
									<div
										className="h-4 w-4 flex-shrink-0 rounded-full"
										style={{ backgroundColor: project.color }}
									/>
								)}
								<h1 className="font-bold text-3xl text-gray-900 dark:text-white">
									{project.name}
								</h1>
								<Badge color={getStatusColor(project.status)} size="sm">
									{project.status.replace("_", " ").toUpperCase()}
								</Badge>
								{project.priority && (
									<Badge color={getPriorityColor(project.priority)} size="sm">
										{project.priority.toUpperCase()}
									</Badge>
								)}
							</div>
							{project.description && (
								<p className="max-w-2xl text-gray-600 dark:text-gray-400">
									{project.description}
								</p>
							)}
						</div>
					</div>

					<Button size="sm">
						<Edit className="mr-2 h-4 w-4" />
						Edit Project
					</Button>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
					<Card className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-500 text-sm dark:text-gray-400">
									Progress
								</p>
								<p className="font-bold text-2xl text-gray-900 dark:text-white">
									{project.progress || 0}%
								</p>
							</div>
							<Target className="h-8 w-8 text-blue-500" />
						</div>
						<Progress
							progress={project.progress || 0}
							color={
								(project.progress || 0) >= 75
									? "green"
									: (project.progress || 0) >= 50
										? "blue"
										: "yellow"
							}
							size="sm"
							className="mt-2"
						/>
					</Card>

					<Card className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-500 text-sm dark:text-gray-400">
									Tasks
								</p>
								<p className="font-bold text-2xl text-gray-900 dark:text-white">
									{completedTasks}/{totalTasks}
								</p>
							</div>
							<CheckSquare className="h-8 w-8 text-green-500" />
						</div>
						<div className="mt-2">
							<p className="text-gray-500 text-xs">
								{taskCompletionRate}% complete
								{overdueTasks > 0 && (
									<span className="ml-1 text-red-500">
										• {overdueTasks} overdue
									</span>
								)}
							</p>
						</div>
					</Card>

					<Card className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-500 text-sm dark:text-gray-400">Team</p>
								<p className="font-bold text-2xl text-gray-900 dark:text-white">
									{Math.floor(Math.random() * 5) + 2}
								</p>
							</div>
							<Users className="h-8 w-8 text-purple-500" />
						</div>
					</Card>

					<Card className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-500 text-sm dark:text-gray-400">
									Due Date
								</p>
								<p
									className={`font-semibold text-lg ${
										dueDateInfo?.isOverdue
											? "text-red-600 dark:text-red-400"
											: dueDateInfo?.isDueSoon
												? "text-orange-600 dark:text-orange-400"
												: "text-gray-900 dark:text-white"
									}`}
								>
									{dueDateInfo ? dueDateInfo.date : "No due date"}
								</p>
							</div>
							<Calendar
								className={`h-8 w-8 ${
									dueDateInfo?.isOverdue
										? "text-red-500"
										: dueDateInfo?.isDueSoon
											? "text-orange-500"
											: "text-gray-500"
								}`}
							/>
						</div>
						{dueDateInfo &&
							(dueDateInfo.isOverdue || dueDateInfo.isDueSoon) && (
								<p
									className={`mt-1 text-xs ${
										dueDateInfo.isOverdue ? "text-red-500" : "text-orange-500"
									}`}
								>
									{dueDateInfo.text}
								</p>
							)}
					</Card>
				</div>

				{/* Navigation Tabs */}
				<div className="border-gray-200 border-b dark:border-gray-700">
					<nav className="flex space-x-8">
						<button
							onClick={() => setActiveTab("overview")}
							className={`border-b-2 px-1 py-2 font-medium text-sm ${
								activeTab === "overview"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							}`}
						>
							<Activity className="mr-2 inline h-4 w-4" />
							Overview
						</button>
						<button
							onClick={() => setActiveTab("tasks")}
							className={`border-b-2 px-1 py-2 font-medium text-sm ${
								activeTab === "tasks"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							}`}
						>
							<CheckSquare className="mr-2 inline h-4 w-4" />
							Tasks ({totalTasks})
						</button>
						<button
							onClick={() => setActiveTab("files")}
							className={`border-b-2 px-1 py-2 font-medium text-sm ${
								activeTab === "files"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							}`}
						>
							<FolderOpen className="mr-2 inline h-4 w-4" />
							Files
						</button>
					</nav>
				</div>

				{/* Tab Content */}
				{activeTab === "overview" && (
					<div className="space-y-6">
						{/* Project Details */}
						<Card>
							<div className="space-y-4">
								<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
									Project Details
								</h3>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div className="space-y-4">
										<div>
											<dt className="font-medium text-gray-500 text-sm dark:text-gray-400">
												Created
											</dt>
											<dd className="text-gray-900 text-sm dark:text-white">
												{new Date(project._creationTime).toLocaleDateString()}
											</dd>
										</div>
										{project.estimatedHours && (
											<div>
												<dt className="font-medium text-gray-500 text-sm dark:text-gray-400">
													Estimated Hours
												</dt>
												<dd className="text-gray-900 text-sm dark:text-white">
													{project.estimatedHours} hours
												</dd>
											</div>
										)}
										{project.actualHours && (
											<div>
												<dt className="font-medium text-gray-500 text-sm dark:text-gray-400">
													Actual Hours
												</dt>
												<dd className="text-gray-900 text-sm dark:text-white">
													{project.actualHours} hours
												</dd>
											</div>
										)}
									</div>
									<div className="space-y-4">
										{project.tags && project.tags.length > 0 && (
											<div>
												<dt className="mb-2 font-medium text-gray-500 text-sm dark:text-gray-400">
													Tags
												</dt>
												<dd className="flex flex-wrap gap-1">
													{project.tags.map((tag, index) => (
														<Badge key={index} color="gray" size="xs">
															#{tag}
														</Badge>
													))}
												</dd>
											</div>
										)}
									</div>
								</div>
							</div>
						</Card>

						{/* Quick Task Overview */}
						<Card>
							<div className="mb-4 flex items-center justify-between">
								<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
									Recent Tasks
								</h3>
								<Button
									size="sm"
									color="gray"
									outline
									onClick={() => setActiveTab("tasks")}
								>
									View All Tasks
								</Button>
							</div>
							<div className="space-y-3">
								{projectTasks.slice(0, 5).map((task) => (
									<div
										key={task._id}
										className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
									>
										<div className="flex items-center space-x-3">
											<div
												className={`h-2 w-2 rounded-full ${
													task.priority === "urgent"
														? "bg-red-500"
														: task.priority === "high"
															? "bg-orange-500"
															: task.priority === "medium"
																? "bg-blue-500"
																: "bg-green-500"
												}`}
											/>
											<span
												className={`text-sm ${
													task.status === "done"
														? "text-gray-500 line-through"
														: "text-gray-900 dark:text-white"
												}`}
											>
												{task.name}
											</span>
											<Badge
												color={task.status === "done" ? "green" : "gray"}
												size="xs"
											>
												{task.status}
											</Badge>
										</div>
									</div>
								))}
								{projectTasks.length === 0 && (
									<div className="py-6 text-center text-gray-500 dark:text-gray-400">
										No tasks created yet
									</div>
								)}
							</div>
						</Card>
					</div>
				)}

				{activeTab === "tasks" && (
					<TaskTodoView projectId={projectId as Id<"projects">} />
				)}

				{activeTab === "files" && (
					<ProjectFilesTable projectId={projectId as Id<"projects">} />
				)}
			</div>
		</SidebarLayout>
	);
}
