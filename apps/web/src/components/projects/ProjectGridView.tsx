import { Badge, Button, Card, Progress } from "flowbite-react";
import { Calendar, Clock, MoreHorizontal, Target, Users } from "lucide-react";
import { useState, useMemo } from "react";
import type { Project } from "@/hooks/use-projects";
import { createSkeletonKeys } from "@/lib/skeleton-utils";

interface ProjectGridViewProps {
	projects: Project[];
	onProjectClick?: (project: Project) => void;
	isLoading?: boolean;
}

export function ProjectGridView({
	projects,
	onProjectClick,
	isLoading = false,
}: ProjectGridViewProps) {
	const [hoveredProject, setHoveredProject] = useState<string | null>(null);
	const skeletonKeys = useMemo(() => createSkeletonKeys(6, "project-grid"), []);

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

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{skeletonKeys.map((key) => (
					<Card key={key} className="animate-pulse">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="h-4 w-3/4 rounded bg-gray-200" />
								<div className="h-6 w-16 rounded bg-gray-200" />
							</div>
							<div className="h-3 w-full rounded bg-gray-200" />
							<div className="h-3 w-2/3 rounded bg-gray-200" />
							<div className="flex items-center justify-between">
								<div className="h-4 w-1/3 rounded bg-gray-200" />
								<div className="h-4 w-1/4 rounded bg-gray-200" />
							</div>
						</div>
					</Card>
				))}
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<div className="py-12 text-center">
				<Target className="mx-auto mb-4 h-16 w-16 text-gray-400" />
				<h3 className="mb-2 font-medium text-gray-900 text-xl dark:text-white">
					No projects found
				</h3>
				<p className="text-gray-500 dark:text-gray-400">
					Create your first project to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{projects.map((project) => {
				const dueDateInfo = formatDueDate(project.endDate);
				const mockTeamSize = Math.floor(Math.random() * 5) + 2; // Mock team size

				return (
					<Card
						key={project._id}
						className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
							hoveredProject === project._id ? "ring-2 ring-blue-500" : ""
						}`}
						onMouseEnter={() => setHoveredProject(project._id)}
						onMouseLeave={() => setHoveredProject(null)}
						onClick={() => onProjectClick?.(project)}
					>
						<div className="space-y-4">
							{/* Header */}
							<div className="flex items-start justify-between">
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center space-x-2">
										{project.color && (
											<div
												className="h-3 w-3 flex-shrink-0 rounded-full"
												style={{ backgroundColor: project.color }}
											/>
										)}
										<h3 className="truncate font-semibold text-gray-900 dark:text-white">
											{project.name}
										</h3>
									</div>
									{project.description && (
										<p className="line-clamp-2 text-gray-600 text-sm dark:text-gray-400">
											{project.description}
										</p>
									)}
								</div>
								<div className="ml-2 flex items-center space-x-2">
									<Badge color={getStatusColor(project.status)} size="sm">
										{project.status.replace("_", " ").toUpperCase()}
									</Badge>
									<Button size="xs" color="gray" className="p-1">
										<MoreHorizontal className="h-3 w-3" />
									</Button>
								</div>
							</div>

							{/* Progress */}
							{typeof project.progress === "number" && (
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">
											Progress
										</span>
										<span className="font-medium">{project.progress}%</span>
									</div>
									<Progress
										progress={project.progress}
										color={
											project.progress >= 75
												? "green"
												: project.progress >= 50
													? "blue"
													: "yellow"
										}
										size="sm"
									/>
								</div>
							)}

							{/* Metadata */}
							<div className="space-y-2 text-sm">
								{/* Priority */}
								{project.priority && (
									<div className="flex items-center justify-between">
										<span className="text-gray-500 dark:text-gray-400">
											Priority
										</span>
										<Badge color={getPriorityColor(project.priority)} size="xs">
											{project.priority.toUpperCase()}
										</Badge>
									</div>
								)}

								{/* Team */}
								<div className="flex items-center justify-between">
									<span className="text-gray-500 dark:text-gray-400">Team</span>
									<div className="flex items-center space-x-1">
										<Users className="h-3 w-3 text-gray-400" />
										<span className="text-gray-600 dark:text-gray-400">
											{mockTeamSize}
										</span>
									</div>
								</div>

								{/* Due Date */}
								{dueDateInfo && (
									<div className="flex items-center justify-between">
										<span className="text-gray-500 dark:text-gray-400">
											Due Date
										</span>
										<div className="text-right">
											<div
												className={`flex items-center space-x-1 ${
													dueDateInfo.isOverdue
														? "text-red-600 dark:text-red-400"
														: dueDateInfo.isDueSoon
															? "text-orange-600 dark:text-orange-400"
															: "text-gray-600 dark:text-gray-400"
												}`}
											>
												<Calendar className="h-3 w-3" />
												<span>{dueDateInfo.date}</span>
											</div>
											{(dueDateInfo.isOverdue || dueDateInfo.isDueSoon) && (
												<div
													className={`text-xs ${
														dueDateInfo.isOverdue
															? "text-red-500"
															: "text-orange-500"
													}`}
												>
													{dueDateInfo.text}
												</div>
											)}
										</div>
									</div>
								)}

								{/* Time Tracking */}
								{(project.estimatedHours || project.actualHours) && (
									<div className="flex items-center justify-between">
										<span className="text-gray-500 dark:text-gray-400">
											Hours
										</span>
										<div className="flex items-center space-x-1">
											<Clock className="h-3 w-3 text-gray-400" />
											<span className="text-gray-600 dark:text-gray-400">
												{project.actualHours || 0}h /{" "}
												{project.estimatedHours || 0}h
											</span>
										</div>
									</div>
								)}
							</div>

							{/* Tags */}
							{project.tags && project.tags.length > 0 && (
								<div className="flex flex-wrap gap-1 border-gray-100 border-t pt-2 dark:border-gray-700">
									{project.tags.slice(0, 3).map((tag, _index) => (
										<Badge key={tag} color="gray" size="xs">
											#{tag}
										</Badge>
									))}
									{project.tags.length > 3 && (
										<Badge color="gray" size="xs">
											+{project.tags.length - 3} more
										</Badge>
									)}
								</div>
							)}
						</div>
					</Card>
				);
			})}
		</div>
	);
}
