import { Card } from "flowbite-react";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

interface ProjectChartsProps {
	projectId?: string;
	charts?: {
		priority?: {
			high: number;
			medium: number;
			low: number;
			urgent: number;
		};
		status?: {
			backlog: number;
			todo: number;
			in_progress: number;
			in_review: number;
			done: number;
		};
		workload?: Array<{
			user: string;
			tasks: number;
			hours: number;
		}>;
		progress?: Array<{
			date: string;
			completed: number;
			total: number;
		}>;
	};
}

interface DonutChartProps {
	data: Array<{
		label: string;
		value: number;
		color: string;
	}>;
	title: string;
}

function DonutChart({ data, title }: DonutChartProps) {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	const radius = 80;
	const strokeWidth = 20;
	const normalizedRadius = radius - strokeWidth * 2;
	const circumference = normalizedRadius * 2 * Math.PI;

	let cumulativePercentage = 0;

	return (
		<div className="flex flex-col items-center">
			<div className="relative">
				<svg
					height={radius * 2}
					width={radius * 2}
					className="-rotate-90 transform"
				>
					<circle
						stroke="#e5e7eb"
						fill="transparent"
						strokeWidth={strokeWidth}
						r={normalizedRadius}
						cx={radius}
						cy={radius}
						className="dark:stroke-gray-700"
					/>
					{data.map((item, index) => {
						const percentage = total > 0 ? (item.value / total) * 100 : 0;
						const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
						const strokeDashoffset =
							(-cumulativePercentage * circumference) / 100;
						cumulativePercentage += percentage;

						return (
							<circle
								key={index}
								stroke={item.color}
								fill="transparent"
								strokeWidth={strokeWidth}
								strokeDasharray={strokeDasharray}
								strokeDashoffset={strokeDashoffset}
								r={normalizedRadius}
								cx={radius}
								cy={radius}
								className="transition-all duration-300"
							/>
						);
					})}
				</svg>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center">
						<div className="font-bold text-2xl text-gray-900 dark:text-white">
							{total}
						</div>
						<div className="text-gray-500 text-sm dark:text-gray-400">
							Total
						</div>
					</div>
				</div>
			</div>
			<div className="mt-4 space-y-2">
				{data.map((item, index) => (
					<div key={index} className="flex items-center text-sm">
						<div
							className="mr-2 h-3 w-3 rounded-full"
							style={{ backgroundColor: item.color }}
						/>
						<span className="text-gray-600 dark:text-gray-400">
							{item.label}: {item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

interface BarChartProps {
	data: Array<{
		label: string;
		value: number;
		color: string;
	}>;
	title: string;
}

function BarChart({ data, title }: BarChartProps) {
	const maxValue = Math.max(...data.map((item) => item.value));

	return (
		<div className="space-y-4">
			{data.map((item, index) => {
				const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

				return (
					<div key={index} className="space-y-1">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600 dark:text-gray-400">
								{item.label}
							</span>
							<span className="font-medium text-gray-900 dark:text-white">
								{item.value}
							</span>
						</div>
						<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
							<div
								className="h-2 rounded-full transition-all duration-500"
								style={{
									width: `${percentage}%`,
									backgroundColor: item.color,
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function ProjectCharts({ charts }: ProjectChartsProps) {
	if (!charts) {
		return (
			<div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
						<div className="text-center">
							<BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p>No chart data available</p>
						</div>
					</div>
				</Card>
				<Card>
					<div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
						<div className="text-center">
							<PieChart className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p>No chart data available</p>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	const priorityData = charts.priority
		? [
				{ label: "Urgent", value: charts.priority.urgent, color: "#ef4444" },
				{ label: "High", value: charts.priority.high, color: "#f97316" },
				{ label: "Medium", value: charts.priority.medium, color: "#3b82f6" },
				{ label: "Low", value: charts.priority.low, color: "#10b981" },
			].filter((item) => item.value > 0)
		: [];

	const statusData = charts.status
		? [
				{ label: "Backlog", value: charts.status.backlog, color: "#6b7280" },
				{ label: "To Do", value: charts.status.todo, color: "#3b82f6" },
				{
					label: "In Progress",
					value: charts.status.in_progress,
					color: "#f59e0b",
				},
				{
					label: "In Review",
					value: charts.status.in_review,
					color: "#8b5cf6",
				},
				{ label: "Done", value: charts.status.done, color: "#10b981" },
			].filter((item) => item.value > 0)
		: [];

	return (
		<div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
			{/* Priority Breakdown */}
			<Card>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						Priority Breakdown
					</h3>
					<PieChart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
				</div>
				{priorityData.length > 0 ? (
					<DonutChart data={priorityData} title="Priority" />
				) : (
					<div className="flex h-48 items-center justify-center text-gray-500 dark:text-gray-400">
						<p>No priority data available</p>
					</div>
				)}
			</Card>

			{/* Status Distribution */}
			<Card>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						Task Status
					</h3>
					<BarChart3 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
				</div>
				{statusData.length > 0 ? (
					<BarChart data={statusData} title="Status" />
				) : (
					<div className="flex h-48 items-center justify-center text-gray-500 dark:text-gray-400">
						<p>No status data available</p>
					</div>
				)}
			</Card>

			{/* Team Workload */}
			{charts.workload && charts.workload.length > 0 && (
				<Card className="lg:col-span-2">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
							Team Workload
						</h3>
						<TrendingUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
					</div>
					<div className="space-y-4">
						{charts.workload.map((member, index) => {
							const maxTasks = Math.max(
								...(charts.workload?.map((m) => m.tasks) || [0]),
							);
							const taskPercentage =
								maxTasks > 0 ? (member.tasks / maxTasks) * 100 : 0;

							return (
								<div key={index} className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="font-medium text-gray-900 text-sm dark:text-white">
											{member.user}
										</span>
										<span className="text-gray-500 text-sm dark:text-gray-400">
											{member.tasks} tasks • {member.hours}h
										</span>
									</div>
									<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
										<div
											className="h-2 rounded-full bg-blue-500 transition-all duration-500"
											style={{ width: `${taskPercentage}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</Card>
			)}
		</div>
	);
}
