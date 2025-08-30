import type { Id } from "@pulse/backend/dataModel";
import { Badge, Button, Card } from "flowbite-react";
import {
	AlertCircle,
	Calendar,
	Clock,
	DollarSign,
	Edit,
	Users,
} from "lucide-react";
import { useState } from "react";
import type { Project } from "@/hooks/use-projects";

interface ProjectSummaryProps {
	project: Project;
	onEdit?: () => void;
}

interface ProjectInfoItem {
	label: string;
	value: React.ReactNode;
}

export function ProjectSummary({ project, onEdit }: ProjectSummaryProps) {
	const [isExpanded, setIsExpanded] = useState(false);

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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "success";
			case "on_hold":
				return "warning";
			case "completed":
				return "info";
			case "archived":
				return "gray";
			default:
				return "gray";
		}
	};

	const formatDuration = (startDate?: number, endDate?: number) => {
		if (!startDate || !endDate) return "Not specified";
		const diffTime = Math.abs(endDate - startDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		const months = Math.floor(diffDays / 30);
		const days = diffDays % 30;

		if (months > 0) {
			return `${months} month${months > 1 ? "s" : ""} ${days > 0 ? `${days} day${days > 1 ? "s" : ""}` : ""}`.trim();
		}
		return `${days} day${days > 1 ? "s" : ""}`;
	};

	const formatBudget = (budget?: number) => {
		if (!budget) return "Not specified";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(budget);
	};

	const leftColumnItems: ProjectInfoItem[] = [
		{
			label: "Project name",
			value: project.name,
		},
		{
			label: "Description",
			value: project.description || "No description provided",
		},
		{
			label: "Status",
			value: (
				<Badge color={getStatusColor(project.status)} size="sm">
					{project.status.replace("_", " ").toUpperCase()}
				</Badge>
			),
		},
		{
			label: "Duration",
			value: (
				<div className="flex items-center text-gray-600 dark:text-gray-400">
					<Calendar className="mr-2 h-4 w-4" />
					{formatDuration(project.startDate, project.endDate)}
				</div>
			),
		},
	];

	const rightColumnItems: ProjectInfoItem[] = [
		{
			label: "Project budget",
			value: (
				<div className="flex items-center text-gray-600 dark:text-gray-400">
					<DollarSign className="mr-2 h-4 w-4" />
					{formatBudget(project.budget)}
				</div>
			),
		},
		{
			label: "Priority",
			value: project.priority ? (
				<div className="flex items-center">
					<AlertCircle
						className={`mr-2 h-4 w-4 ${
							project.priority === "urgent"
								? "text-red-500"
								: project.priority === "high"
									? "text-orange-500"
									: project.priority === "medium"
										? "text-blue-500"
										: "text-green-500"
						}`}
					/>
					<Badge color={getPriorityColor(project.priority)} size="sm">
						{project.priority.toUpperCase()}
					</Badge>
				</div>
			) : (
				"Not specified"
			),
		},
		{
			label: "Time tracking",
			value:
				project.estimatedHours || project.actualHours ? (
					<div className="flex items-center text-gray-600 dark:text-gray-400">
						<Clock className="mr-2 h-4 w-4" />
						<span>
							{project.actualHours || 0}h / {project.estimatedHours || 0}h
							{project.estimatedHours && project.actualHours && (
								<span
									className={`ml-2 text-sm ${
										project.actualHours > project.estimatedHours
											? "text-red-500"
											: "text-green-500"
									}`}
								>
									(
									{Math.round(
										((project.actualHours || 0) / project.estimatedHours) * 100,
									)}
									%)
								</span>
							)}
						</span>
					</div>
				) : (
					"No time tracking"
				),
		},
		{
			label: "Tags",
			value:
				project.tags && project.tags.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{project.tags.slice(0, 3).map((tag, index) => (
							<Badge key={index} color="gray" size="xs">
								{tag}
							</Badge>
						))}
						{project.tags.length > 3 && (
							<Badge color="gray" size="xs">
								+{project.tags.length - 3} more
							</Badge>
						)}
					</div>
				) : (
					"No tags"
				),
		},
	];

	return (
		<Card className="w-full">
			<div className="mb-6 flex items-start justify-between">
				<div>
					<h2 className="mb-2 font-bold text-2xl text-gray-900 dark:text-white">
						Project Information
					</h2>
					{project.color && (
						<div className="flex items-center">
							<div
								className="mr-2 h-4 w-4 rounded-full"
								style={{ backgroundColor: project.color }}
							/>
							<span className="text-gray-500 text-sm dark:text-gray-400">
								Project Color
							</span>
						</div>
					)}
				</div>
				{onEdit && (
					<Button
						size="sm"
						color="light"
						onClick={onEdit}
						className="flex items-center"
					>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{/* Left Column */}
				<div className="space-y-6">
					<dl className="space-y-4">
						{leftColumnItems.map((item, index) => (
							<div
								key={index}
								className="border-gray-100 border-b pb-3 last:border-b-0 last:pb-0 dark:border-gray-700"
							>
								<dt className="mb-1 font-medium text-gray-500 text-sm dark:text-gray-400">
									{item.label}
								</dt>
								<dd className="text-gray-900 text-sm dark:text-white">
									{item.value}
								</dd>
							</div>
						))}
					</dl>
				</div>

				{/* Right Column */}
				<div className="space-y-6">
					<dl className="space-y-4">
						{rightColumnItems.map((item, index) => (
							<div
								key={index}
								className="border-gray-100 border-b pb-3 last:border-b-0 last:pb-0 dark:border-gray-700"
							>
								<dt className="mb-1 font-medium text-gray-500 text-sm dark:text-gray-400">
									{item.label}
								</dt>
								<dd className="text-gray-900 text-sm dark:text-white">
									{item.value}
								</dd>
							</div>
						))}
					</dl>
				</div>
			</div>

			{/* Progress Section */}
			{typeof project.progress === "number" && (
				<div className="mt-6 border-gray-100 border-t pt-6 dark:border-gray-700">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-medium text-gray-500 text-sm dark:text-gray-400">
							Project Progress
						</span>
						<span className="font-medium text-gray-900 text-sm dark:text-white">
							{project.progress}%
						</span>
					</div>
					<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
						<div
							className={`h-2 rounded-full transition-all duration-300 ${
								project.progress >= 100
									? "bg-green-500"
									: project.progress >= 75
										? "bg-blue-500"
										: project.progress >= 50
											? "bg-yellow-500"
											: "bg-red-500"
							}`}
							style={{ width: `${Math.min(project.progress, 100)}%` }}
						/>
					</div>
				</div>
			)}

			{/* Expandable Description */}
			{project.description && project.description.length > 200 && (
				<div className="mt-4">
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="text-blue-600 text-sm hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
					>
						{isExpanded ? "Show Less" : "Show More"}
					</button>
				</div>
			)}
		</Card>
	);
}
