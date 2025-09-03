import type { Id } from "@pulse/backend/dataModel";
import { Badge, Card, Progress } from "flowbite-react";
import {
	AlertCircle,
	BarChart3,
	Calendar,
	CheckCircle2,
	Clock,
	DollarSign,
	Target,
	TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useWorkspaceContext } from "../../contexts/workspace-context";
import { useProjectStats } from "../../hooks/use-projects";
import { useTasks } from "../../hooks/use-tasks";
import { ProjectActivityFeed } from "./ProjectActivityFeed";
import { ProjectCharts } from "./ProjectCharts";
import { ProjectStatsCards } from "./ProjectStatsCards";

interface ProjectDashboardProps {
	projectId?: Id<"projects">;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
	const { currentWorkspace } = useWorkspaceContext();
	const { stats, isLoading } = useProjectStats(
		currentWorkspace?._id,
		projectId,
	);
	const { tasks } = useTasks(
		currentWorkspace?._id,
		projectId ? { projectId } : undefined,
	);

	// Calculate derived metrics
	const metrics = useMemo(() => {
		if (!stats) return null;

		if ("project" in stats && stats.project) {
			// Single project stats
			const { project, tasks, members, timeTracking } = stats;

			const completionRate =
				tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0;
			const overdueRate =
				tasks.total > 0 ? (tasks.overdue / tasks.total) * 100 : 0;
			const activeTasksRate =
				tasks.total > 0 ? (tasks.inProgress / tasks.total) * 100 : 0;

			const isOverdue =
				project.endDate &&
				project.endDate < Date.now() &&
				project.status !== "completed";
			const daysUntilDeadline = project.endDate
				? Math.ceil((project.endDate - Date.now()) / (1000 * 60 * 60 * 24))
				: null;

			return {
				type: "single" as const,
				project,
				completionRate,
				overdueRate,
				activeTasksRate,
				isOverdue,
				daysUntilDeadline,
				tasks,
				members,
				timeTracking,
			};
		}
		if ("projects" in stats) {
			// Workspace-wide stats
			const { projects } = stats;
			const totalProjects = projects.total;
			const activeRate =
				totalProjects > 0 ? (projects.active / totalProjects) * 100 : 0;
			const completedRate =
				totalProjects > 0 ? (projects.completed / totalProjects) * 100 : 0;
			const overdueRate =
				totalProjects > 0 ? (projects.overdue / totalProjects) * 100 : 0;

			return {
				type: "workspace" as const,
				projects,
				totalProjects,
				activeRate,
				completedRate,
				overdueRate,
			};
		}

		return null;
	}, [stats]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[...Array(4)].map(() => (
						<Card key={crypto.randomUUID()} className="animate-pulse">
							<div className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
						</Card>
					))}
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{[...Array(2)].map(() => (
						<Card key={crypto.randomUUID()} className="animate-pulse">
							<div className="h-64 rounded bg-gray-200 dark:bg-gray-700" />
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!metrics) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-center">
					<BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 className="mb-2 font-medium text-gray-900 text-lg dark:text-white">
						No Data Available
					</h3>
					<p className="text-gray-500 dark:text-gray-400">
						Project statistics will appear here once you have projects and
						tasks.
					</p>
				</div>
			</div>
		);
	}

	if (metrics.type === "single") {
		// Single project dashboard
		const {
			project,
			completionRate: _completionRate,
			overdueRate: _overdueRate,
			activeTasksRate: _activeTasksRate,
			isOverdue,
			daysUntilDeadline,
			tasks: projectTasks,
			members: _members,
			timeTracking,
		} = metrics;

		// Prepare data for enhanced components
		const taskStats = {
			tasksCompletedRecently: projectTasks.completed,
			tasksUpdatedRecently: Math.floor(projectTasks.total * 0.3), // Mock data - would come from actual updates
			tasksCreatedThisWeek: Math.floor(projectTasks.total * 0.2), // Mock data
			overdueTasks: projectTasks.overdue,
			totalTasks: projectTasks.total,
		};

		const chartData = tasks
			? {
					priority: {
						urgent: tasks.filter((t) => t.priority === "urgent").length,
						high: tasks.filter((t) => t.priority === "high").length,
						medium: tasks.filter((t) => t.priority === "medium").length,
						low: tasks.filter((t) => t.priority === "low").length,
					},
					status: {
						backlog: tasks.filter((t) => t.status === "backlog").length,
						todo: tasks.filter((t) => t.status === "todo").length,
						in_progress: tasks.filter((t) => t.status === "in_progress").length,
						in_review: tasks.filter((t) => t.status === "in_review").length,
						done: tasks.filter((t) => t.status === "done").length,
					},
				}
			: undefined;

		return (
			<div className="space-y-6">
				{/* Project Header */}
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center space-x-3">
							{project.color && (
								<div
									className="h-4 w-4 rounded-full"
									style={{ backgroundColor: project.color }}
								/>
							)}
							<h1 className="font-bold text-2xl text-gray-900 dark:text-white">
								{project.name}
							</h1>
							<Badge
								color={
									project.status === "active"
										? "green"
										: project.status === "completed"
											? "blue"
											: project.status === "on_hold"
												? "yellow"
												: "gray"
								}
							>
								{project.status.replace("_", " ").toUpperCase()}
							</Badge>
						</div>
						{project.description && (
							<p className="mt-1 text-gray-500 dark:text-gray-400">
								{project.description}
							</p>
						)}
					</div>
					{isOverdue && (
						<Badge color="red" size="sm" icon={AlertCircle}>
							Overdue
						</Badge>
					)}
				</div>

				{/* Enhanced Stats Cards */}
				<ProjectStatsCards stats={taskStats} timeframe="last 7 days" />

				{/* Charts */}
				<ProjectCharts charts={chartData} />

				{/* Timeline and Project Info */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Timeline */}
					{(project.startDate || project.endDate || daysUntilDeadline) && (
						<Card>
							<div className="mb-4 flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Calendar className="h-5 w-5 text-gray-400" />
									<h3 className="font-medium text-gray-900 text-lg dark:text-white">
										Timeline
									</h3>
								</div>
								{daysUntilDeadline !== null && (
									<Badge
										color={
											daysUntilDeadline < 0
												? "red"
												: daysUntilDeadline < 7
													? "yellow"
													: "green"
										}
									>
										{daysUntilDeadline < 0
											? `${Math.abs(daysUntilDeadline)} days overdue`
											: `${daysUntilDeadline} days remaining`}
									</Badge>
								)}
							</div>
							<div className="space-y-3">
								{project.startDate && (
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">
											Start Date:
										</span>
										<span className="font-medium">
											{new Date(project.startDate).toLocaleDateString()}
										</span>
									</div>
								)}
								{project.endDate && (
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">
											End Date:
										</span>
										<span className="font-medium">
											{new Date(project.endDate).toLocaleDateString()}
										</span>
									</div>
								)}
								{/* Overall Progress */}
								<div className="mt-4">
									<div className="mb-2 flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">
											Overall Progress
										</span>
										<span className="font-medium">
											{Math.round(project.progress || 0)}%
										</span>
									</div>
									<Progress progress={project.progress || 0} color="blue" />
								</div>
							</div>
						</Card>
					)}

					{/* Time & Budget Tracking */}
					<Card>
						<div className="mb-4 flex items-center space-x-2">
							<Clock className="h-5 w-5 text-gray-400" />
							<h3 className="font-medium text-gray-900 text-lg dark:text-white">
								Time & Budget
							</h3>
						</div>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-gray-500 text-sm dark:text-gray-400">
									Time: Estimated
								</span>
								<span className="font-medium">
									{timeTracking.estimatedHours}h
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-500 text-sm dark:text-gray-400">
									Time: Actual
								</span>
								<span className="font-medium">{timeTracking.actualHours}h</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-500 text-sm dark:text-gray-400">
									Efficiency
								</span>
								<Badge
									color={
										timeTracking.efficiency > 100
											? "green"
											: timeTracking.efficiency > 80
												? "yellow"
												: "red"
									}
								>
									{Math.round(timeTracking.efficiency)}%
								</Badge>
							</div>
							{project.budget && (
								<div className="flex items-center justify-between border-gray-100 border-t pt-2 dark:border-gray-700">
									<div className="flex items-center space-x-1">
										<DollarSign className="h-4 w-4 text-gray-400" />
										<span className="text-gray-500 text-sm dark:text-gray-400">
											Budget
										</span>
									</div>
									<span className="font-medium">
										${project.budget.toLocaleString()}
									</span>
								</div>
							)}
						</div>
					</Card>
				</div>

				{/* Activity Feed */}
				<ProjectActivityFeed projectId={projectId} showHeader={true} />

				{/* Project Tags */}
				{project.tags && project.tags.length > 0 && (
					<Card>
						<h3 className="mb-3 font-medium text-gray-900 text-lg dark:text-white">
							Project Tags
						</h3>
						<div className="flex flex-wrap gap-2">
							{project.tags.map((tag, _index) => (
								<Badge key={tag} color="gray" size="sm">
									#{tag}
								</Badge>
							))}
						</div>
					</Card>
				)}
			</div>
		);
	}
	// Workspace-wide dashboard
	const { projects, totalProjects, activeRate, completedRate, overdueRate } =
		metrics;

	// Prepare data for enhanced components
	const workspaceStats = {
		tasksCompletedRecently: projects.completed,
		tasksUpdatedRecently: projects.active,
		tasksCreatedThisWeek: Math.floor(totalProjects * 0.1), // Mock data
		overdueTasks: projects.overdue,
		totalTasks: totalProjects,
		activeProjects: projects.active,
		completionRate: completedRate,
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-2 font-bold text-2xl text-gray-900 dark:text-white">
					Project Overview
				</h2>
				<p className="text-gray-500 dark:text-gray-400">
					Summary of all projects in your workspace
				</p>
			</div>

			{/* Enhanced Stats Cards */}
			<ProjectStatsCards
				stats={workspaceStats}
				timeframe="across all projects"
			/>

			{/* Project Status Distribution */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<div className="mb-4 flex items-center space-x-2">
						<BarChart3 className="h-5 w-5 text-gray-400" />
						<h3 className="font-medium text-gray-900 text-lg dark:text-white">
							Project Status Distribution
						</h3>
					</div>
					<div className="space-y-4">
						<div>
							<div className="mb-1 flex justify-between">
								<span className="font-medium text-green-700 text-sm dark:text-green-400">
									Active
								</span>
								<span className="text-gray-500 text-sm dark:text-gray-400">
									{projects.active} projects
								</span>
							</div>
							<Progress progress={activeRate} color="green" />
						</div>
						<div>
							<div className="mb-1 flex justify-between">
								<span className="font-medium text-blue-700 text-sm dark:text-blue-400">
									Completed
								</span>
								<span className="text-gray-500 text-sm dark:text-gray-400">
									{projects.completed} projects
								</span>
							</div>
							<Progress progress={completedRate} color="blue" />
						</div>
						<div>
							<div className="mb-1 flex justify-between">
								<span className="font-medium text-sm text-yellow-700 dark:text-yellow-400">
									On Hold
								</span>
								<span className="text-gray-500 text-sm dark:text-gray-400">
									{projects.onHold} projects
								</span>
							</div>
							<Progress
								progress={
									totalProjects > 0
										? (projects.onHold / totalProjects) * 100
										: 0
								}
								color="yellow"
							/>
						</div>
						{projects.overdue > 0 && (
							<div>
								<div className="mb-1 flex justify-between">
									<span className="font-medium text-red-700 text-sm dark:text-red-400">
										Overdue
									</span>
									<span className="text-gray-500 text-sm dark:text-gray-400">
										{projects.overdue} projects
									</span>
								</div>
								<Progress progress={overdueRate} color="red" />
							</div>
						)}
					</div>
				</Card>

				<Card>
					<div className="mb-4 flex items-center space-x-2">
						<Target className="h-5 w-5 text-gray-400" />
						<h3 className="font-medium text-gray-900 text-lg dark:text-white">
							Workspace Summary
						</h3>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Target className="h-4 w-4 text-blue-500" />
								<span className="text-gray-500 text-sm dark:text-gray-400">
									Total Projects
								</span>
							</div>
							<span className="font-semibold text-gray-900 text-lg dark:text-white">
								{totalProjects}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<TrendingUp className="h-4 w-4 text-green-500" />
								<span className="text-gray-500 text-sm dark:text-gray-400">
									Success Rate
								</span>
							</div>
							<Badge color="green">{Math.round(completedRate)}%</Badge>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<CheckCircle2 className="h-4 w-4 text-blue-500" />
								<span className="text-gray-500 text-sm dark:text-gray-400">
									Active Progress
								</span>
							</div>
							<Badge color="blue">{Math.round(activeRate)}%</Badge>
						</div>
					</div>
				</Card>
			</div>

			{/* Recent Activity */}
			<ProjectActivityFeed showHeader={true} />
		</div>
	);
}
