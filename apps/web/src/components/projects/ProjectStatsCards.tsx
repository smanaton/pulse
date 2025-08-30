import { Card } from "flowbite-react";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface ProjectStatsCardsProps {
	stats: {
		tasksCompletedRecently: number;
		tasksUpdatedRecently: number;
		tasksCreatedThisWeek: number;
		overdueTasks: number;
		totalTasks?: number;
		activeProjects?: number;
		completionRate?: number;
	};
	timeframe?: string;
}

interface StatCardProps {
	title: string;
	value: number;
	subtitle?: string;
	icon: React.ElementType;
	color: "green" | "blue" | "yellow" | "red" | "purple" | "gray";
	trend?: {
		value: number;
		isPositive: boolean;
	};
}

function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	color,
	trend,
}: StatCardProps) {
	const colorClasses = {
		green: {
			bg: "bg-green-50 dark:bg-green-900/20",
			border: "border-green-200 dark:border-green-800",
			icon: "text-green-600 dark:text-green-400",
			text: "text-green-900 dark:text-green-200",
		},
		blue: {
			bg: "bg-blue-50 dark:bg-blue-900/20",
			border: "border-blue-200 dark:border-blue-800",
			icon: "text-blue-600 dark:text-blue-400",
			text: "text-blue-900 dark:text-blue-200",
		},
		yellow: {
			bg: "bg-yellow-50 dark:bg-yellow-900/20",
			border: "border-yellow-200 dark:border-yellow-800",
			icon: "text-yellow-600 dark:text-yellow-400",
			text: "text-yellow-900 dark:text-yellow-200",
		},
		red: {
			bg: "bg-red-50 dark:bg-red-900/20",
			border: "border-red-200 dark:border-red-800",
			icon: "text-red-600 dark:text-red-400",
			text: "text-red-900 dark:text-red-200",
		},
		purple: {
			bg: "bg-purple-50 dark:bg-purple-900/20",
			border: "border-purple-200 dark:border-purple-800",
			icon: "text-purple-600 dark:text-purple-400",
			text: "text-purple-900 dark:text-purple-200",
		},
		gray: {
			bg: "bg-gray-50 dark:bg-gray-900/20",
			border: "border-gray-200 dark:border-gray-800",
			icon: "text-gray-600 dark:text-gray-400",
			text: "text-gray-900 dark:text-gray-200",
		},
	};

	const classes = colorClasses[color];

	return (
		<Card
			className={`${classes.bg} ${classes.border} border transition-all duration-200 hover:shadow-md`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<div
						className={`rounded-lg p-3 ${classes.bg} ${classes.border} border`}
					>
						<Icon className={`h-6 w-6 ${classes.icon}`} />
					</div>
					<div className="ml-4">
						<p className="font-medium text-gray-500 text-sm dark:text-gray-400">
							{title}
						</p>
						<p className={`font-bold text-2xl ${classes.text}`}>
							{value.toLocaleString()}
						</p>
						{subtitle && (
							<p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
								{subtitle}
							</p>
						)}
					</div>
				</div>
				{trend && (
					<div
						className={`flex items-center text-sm ${
							trend.isPositive
								? "text-green-600 dark:text-green-400"
								: "text-red-600 dark:text-red-400"
						}`}
					>
						<TrendingUp
							className={`mr-1 h-4 w-4 ${trend.isPositive ? "" : "rotate-180"}`}
						/>
						<span>{Math.abs(trend.value)}%</span>
					</div>
				)}
			</div>
		</Card>
	);
}

export function ProjectStatsCards({
	stats,
	timeframe = "last 7 days",
}: ProjectStatsCardsProps) {
	return (
		<div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Completed"
				value={stats.tasksCompletedRecently}
				subtitle={`done in the ${timeframe}`}
				icon={CheckCircle}
				color="green"
				trend={{
					value: 12,
					isPositive: true,
				}}
			/>

			<StatCard
				title="Updated"
				value={stats.tasksUpdatedRecently}
				subtitle={`updated in the ${timeframe}`}
				icon={Clock}
				color="blue"
				trend={{
					value: 8,
					isPositive: true,
				}}
			/>

			<StatCard
				title="Created"
				value={stats.tasksCreatedThisWeek}
				subtitle="created this week"
				icon={TrendingUp}
				color="purple"
				trend={{
					value: 5,
					isPositive: false,
				}}
			/>

			<StatCard
				title="Overdue"
				value={stats.overdueTasks}
				subtitle="tasks past due date"
				icon={AlertTriangle}
				color="red"
			/>
		</div>
	);
}
