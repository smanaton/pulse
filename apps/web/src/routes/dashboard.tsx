import { api } from "@pulse/backend";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Badge, Button, Card, Progress } from "flowbite-react";
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	Calendar,
	CheckCircle,
	Clock,
	Plus,
	Target,
	TrendingUp,
	Users,
} from "lucide-react";
import { SidebarLayout } from "@/components/layouts/dashboard/layout";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useProjects } from "@/hooks/use-projects";
import type { Task } from "@/hooks/use-tasks";
import { useTasks } from "@/hooks/use-tasks";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const user = useQuery(api.users.getCurrentUser);
	const { currentWorkspace } = useWorkspaceContext();
	const { tasks } = useTasks(currentWorkspace?._id);
	const { projects } = useProjects(currentWorkspace?._id);

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

	// Filter tasks assigned to current user
	const myTasks =
		tasks?.filter((task) =>
			task.assignees?.some((assignee) => assignee?._id === user._id),
		) || [];

	// Get upcoming tasks (due in next 7 days)
	const upcomingTasks = myTasks.filter((task) => {
		if (!task.dueDate) return false;
		const dueDate = new Date(task.dueDate);
		const now = new Date();
		const diffDays = Math.ceil(
			(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);
		return diffDays >= 0 && diffDays <= 7;
	});

	// Get overdue tasks
	const overdueTasks = myTasks.filter((task) => {
		if (!task.dueDate) return false;
		const dueDate = new Date(task.dueDate);
		const now = new Date();
		return dueDate.getTime() < now.getTime() && task.status !== "done";
	});

	// Get recent activity (projects updated in last 7 days)
	const recentActivity =
		projects
			?.filter((project) => {
				const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
				return project._creationTime > weekAgo;
			})
			.slice(0, 5) || [];

	// Calculate stats
	const totalTasks = myTasks.length;
	const completedTasks = myTasks.filter(
		(task) => task.status === "done",
	).length;
	const completionRate =
		totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

	const activeProjects =
		projects?.filter((p) => p.status === "active").length || 0;

	return (
		<SidebarLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl text-gray-900 dark:text-white">
							Welcome back, {user.name}!
						</h1>
						<p className="mt-1 text-gray-600 dark:text-gray-400">
							Here's your personal workspace overview
						</p>
					</div>
					<div className="text-gray-500 text-sm dark:text-gray-400">
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</div>
				</div>

				{/* Key Stats */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<div className="flex items-center justify-between">
							<div>
								<p className="mb-1 text-gray-500 text-sm dark:text-gray-400">
									My Tasks
								</p>
								<p className="font-bold text-2xl text-gray-900 dark:text-white">
									{completedTasks}/{totalTasks}
								</p>
							</div>
							<div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
								<CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
						</div>
						<div className="mt-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-500">Completion Rate</span>
								<span className="font-medium text-gray-900 dark:text-white">
									{completionRate}%
								</span>
							</div>
							<Progress
								progress={completionRate}
								color="blue"
								size="sm"
								className="mt-2"
							/>
						</div>
					</Card>

					<Card>
						<div className="flex items-center justify-between">
							<div>
								<p className="mb-1 text-gray-500 text-sm dark:text-gray-400">
									Due Soon
								</p>
								<p className="font-bold text-2xl text-orange-600 dark:text-orange-400">
									{upcomingTasks.length}
								</p>
							</div>
							<div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
								<Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
							</div>
						</div>
						{upcomingTasks.length > 0 && (
							<p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
								Next: {upcomingTasks[0].name}
							</p>
						)}
					</Card>

					<Card>
						<div className="flex items-center justify-between">
							<div>
								<p className="mb-1 text-gray-500 text-sm dark:text-gray-400">
									Overdue
								</p>
								<p className="font-bold text-2xl text-red-600 dark:text-red-400">
									{overdueTasks.length}
								</p>
							</div>
							<div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
								<AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
							</div>
						</div>
						{overdueTasks.length > 0 && (
							<p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
								Action required
							</p>
						)}
					</Card>

					<Card>
						<div className="flex items-center justify-between">
							<div>
								<p className="mb-1 text-gray-500 text-sm dark:text-gray-400">
									Active Projects
								</p>
								<p className="font-bold text-2xl text-green-600 dark:text-green-400">
									{activeProjects}
								</p>
							</div>
							<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
								<Target className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
						</div>
					</Card>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* My Priority Tasks */}
					<Card>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="flex items-center font-semibold text-gray-900 text-lg dark:text-white">
								<CheckCircle className="mr-2 h-5 w-5" />
								My Priority Tasks
							</h3>
							<Button size="sm" color="gray" outline>
								<Plus className="mr-1 h-4 w-4" />
								Add Task
							</Button>
						</div>

						<div className="space-y-3">
							{myTasks
								.filter((task) => task.status !== "done")
								.slice(0, 5)
								.map((task) => (
									<TaskQuickView key={task._id} task={task} />
								))}
							{myTasks.filter((task) => task.status !== "done").length ===
								0 && (
								<div className="py-8 text-center">
									<CheckCircle className="mx-auto mb-2 h-12 w-12 text-gray-400" />
									<p className="text-gray-500 dark:text-gray-400">
										No pending tasks
									</p>
									<p className="text-gray-400 text-sm">
										Great job staying on top of things!
									</p>
								</div>
							)}
							{myTasks.filter((task) => task.status !== "done").length > 5 && (
								<Button color="light" size="sm" className="w-full">
									<ArrowRight className="mr-2 h-4 w-4" />
									View All Tasks ({myTasks.length})
								</Button>
							)}
						</div>
					</Card>

					{/* Recent Activity */}
					<Card>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="flex items-center font-semibold text-gray-900 text-lg dark:text-white">
								<Activity className="mr-2 h-5 w-5" />
								Recent Activity
							</h3>
							<Button size="sm" color="gray" outline>
								View All
							</Button>
						</div>

						<div className="space-y-4">
							{recentActivity.map((project) => (
								<div key={project._id} className="flex items-start space-x-3">
									<div
										className="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
										style={{ backgroundColor: project.color || "#6b7280" }}
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between">
											<p className="truncate font-medium text-gray-900 text-sm dark:text-white">
												{project.name}
											</p>
											<Badge
												color={project.status === "active" ? "green" : "gray"}
												size="xs"
											>
												{project.status}
											</Badge>
										</div>
										<p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
											Created{" "}
											{new Date(project._creationTime).toLocaleDateString()}
										</p>
									</div>
								</div>
							))}
							{recentActivity.length === 0 && (
								<div className="py-6 text-center">
									<Activity className="mx-auto mb-2 h-10 w-10 text-gray-400" />
									<p className="text-gray-500 text-sm dark:text-gray-400">
										No recent activity
									</p>
								</div>
							)}
						</div>
					</Card>
				</div>

				{/* Quick Actions */}
				<Card>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
							Quick Actions
						</h3>
					</div>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<Button
							color="blue"
							className="flex h-auto flex-col items-center space-y-2 p-4"
						>
							<Plus className="h-6 w-6" />
							<span>New Task</span>
						</Button>
						<Button
							color="green"
							className="flex h-auto flex-col items-center space-y-2 p-4"
						>
							<Target className="h-6 w-6" />
							<span>New Project</span>
						</Button>
						<Button
							color="purple"
							className="flex h-auto flex-col items-center space-y-2 p-4"
						>
							<Users className="h-6 w-6" />
							<span>Invite Team</span>
						</Button>
						<Button
							color="gray"
							className="flex h-auto flex-col items-center space-y-2 p-4"
						>
							<TrendingUp className="h-6 w-6" />
							<span>View Reports</span>
						</Button>
					</div>
				</Card>
			</div>
		</SidebarLayout>
	);
}

// Helper component for quick task view
function TaskQuickView({ task }: { task: Task }) {
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
		<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
			<div className="min-w-0 flex-1">
				<div className="flex items-center space-x-2">
					<div
						className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}
					/>
					<p className="truncate font-medium text-gray-900 text-sm dark:text-white">
						{task.name}
					</p>
					{task.project && (
						<Badge color="gray" size="xs">
							{task.project.name}
						</Badge>
					)}
				</div>
				{dueDateInfo && (
					<div
						className={`mt-1 flex items-center space-x-1 ${dueDateInfo.color}`}
					>
						<Calendar className="h-3 w-3" />
						<span className="text-xs">{dueDateInfo.text}</span>
					</div>
				)}
			</div>
			<Button size="xs" color="light">
				View
			</Button>
		</div>
	);
}
