import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useQuery } from "convex/react";
import { Avatar, Badge, Button, Card } from "flowbite-react";
import {
	Activity,
	CheckCircle2,
	Edit3,
	MessageCircle,
	Plus,
	RefreshCw,
	Trash2,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import { useWorkspaceContext } from "../../contexts/workspace-context";

interface ProjectActivityFeedProps {
	projectId?: Id<"projects">;
	limit?: number;
	showHeader?: boolean;
}

interface ActivityItem {
	_id: string;
	_creationTime: number;
	actorId: Id<"users">;
	actorType: "user" | "agent";
	action: string;
	entityType: string;
	entityId: string;
	description: string;
	metadata?: {
		updatedFields?: string[];
		[key: string]: unknown;
	};
	createdAt: number;
	actorName: string;
	actorAvatar?: string | null;
}

export function ProjectActivityFeed({
	projectId,
	limit = 20,
	showHeader = true,
}: ProjectActivityFeedProps) {
	const { currentWorkspace } = useWorkspaceContext();

	// Get activities for specific project or all projects in workspace
	const activities = useQuery(
		api.activities.list,
		currentWorkspace
			? {
					workspaceId: currentWorkspace._id,
					entityType: projectId ? "project" : undefined,
					entityId: projectId,
					limit,
				}
			: "skip",
	);

	// Format activities with better descriptions and icons
	const formattedActivities = useMemo(() => {
		if (!activities?.activities) return [];

		return activities.activities.map(
			(activity): ActivityItem & { icon: React.ReactNode; color: string } => {
				const baseActivity: ActivityItem = {
					_id: activity._id || "",
					_creationTime: activity._creationTime || 0,
					actorId: activity.actorId,
					actorType: activity.actorType || "user",
					action: activity.action || "",
					entityType: activity.entityType || "",
					entityId: activity.entityId || "",
					description:
						typeof activity.description === "string"
							? activity.description
							: "",
					metadata: activity.metadata || {},
					createdAt: activity.createdAt || activity._creationTime || 0,
					actorName: activity.actorName || "",
					actorAvatar: activity.actorAvatar || null,
				};

				// Determine icon and color based on action
				let icon: React.ReactNode;
				let color: string;
				let enhancedDescription = baseActivity.description;

				switch (baseActivity.action) {
					case "created":
						icon = <Plus className="h-4 w-4" />;
						color = "green";
						if (baseActivity.entityType === "project") {
							enhancedDescription = `created project "${baseActivity.metadata?.projectName || "Unknown"}"`;
						} else if (baseActivity.entityType === "task") {
							enhancedDescription = `created task "${baseActivity.metadata?.taskName || "Unknown"}"`;
						}
						break;
					case "updated":
						icon = <Edit3 className="h-4 w-4" />;
						color = "blue";
						if (baseActivity.entityType === "project") {
							enhancedDescription = `updated project "${baseActivity.metadata?.projectName || "Unknown"}"`;
						} else if (baseActivity.entityType === "task") {
							enhancedDescription = `updated task "${baseActivity.metadata?.taskName || "Unknown"}"`;
						}
						break;
					case "deleted":
						icon = <Trash2 className="h-4 w-4" />;
						color = "red";
						enhancedDescription = `deleted ${baseActivity.entityType}`;
						break;
					case "completed":
						icon = <CheckCircle2 className="h-4 w-4" />;
						color = "green";
						enhancedDescription = `completed task "${baseActivity.metadata?.taskName || "Unknown"}"`;
						break;
					case "assigned":
						icon = <Users className="h-4 w-4" />;
						color = "purple";
						enhancedDescription = `assigned task "${baseActivity.metadata?.taskName || "Unknown"}"`;
						break;
					case "commented":
						icon = <MessageCircle className="h-4 w-4" />;
						color = "blue";
						enhancedDescription = `commented on task "${baseActivity.metadata?.taskName || "Unknown"}"`;
						break;
					case "moved":
						icon = <RefreshCw className="h-4 w-4" />;
						color = "yellow";
						enhancedDescription = `moved task "${baseActivity.metadata?.taskName || "Unknown"}"`;
						break;
					default:
						icon = <Activity className="h-4 w-4" />;
						color = "gray";
				}

				return {
					...baseActivity,
					description: enhancedDescription,
					icon,
					color,
				};
			},
		);
	}, [activities?.activities]);

	// Group activities by date
	const groupedActivities = useMemo(() => {
		const groups: Record<string, typeof formattedActivities> = {};

		formattedActivities.forEach((activity) => {
			const date = new Date(activity.createdAt).toDateString();
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(activity);
		});

		return Object.entries(groups).sort(
			([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
		);
	}, [formattedActivities]);

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60),
		);

		if (diffInMinutes < 1) return "just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h ago`;

		return date.toLocaleDateString();
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date().toDateString();
		const yesterday = new Date(Date.now() - 86400000).toDateString();

		if (dateString === today) return "Today";
		if (dateString === yesterday) return "Yesterday";

		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric",
		});
	};

	if (!activities) {
		return (
			<Card>
				{showHeader && (
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Activity className="h-5 w-5 text-gray-400" />
							<h3 className="font-medium text-gray-900 text-lg dark:text-white">
								Activity Feed
							</h3>
						</div>
					</div>
				)}
				<div className="space-y-3">
					{[...Array(3)].map(() => (
						<div
							key={crypto.randomUUID()}
							className="flex animate-pulse items-start space-x-3"
						>
							<div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
								<div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
							</div>
						</div>
					))}
				</div>
			</Card>
		);
	}

	if (formattedActivities.length === 0) {
		return (
			<Card>
				{showHeader && (
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Activity className="h-5 w-5 text-gray-400" />
							<h3 className="font-medium text-gray-900 text-lg dark:text-white">
								Activity Feed
							</h3>
						</div>
					</div>
				)}
				<div className="py-8 text-center">
					<Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 className="mb-2 font-medium text-gray-900 text-lg dark:text-white">
						No Activity Yet
					</h3>
					<p className="text-gray-500 dark:text-gray-400">
						{projectId
							? "Activity for this project will appear here."
							: "Workspace activity will appear here as you work on projects."}
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card>
			{showHeader && (
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Activity className="h-5 w-5 text-gray-400" />
						<h3 className="font-medium text-gray-900 text-lg dark:text-white">
							Activity Feed
						</h3>
					</div>
					<Badge color="gray" size="sm">
						{formattedActivities.length}{" "}
						{formattedActivities.length === 1 ? "item" : "items"}
					</Badge>
				</div>
			)}

			<div className="space-y-6">
				{groupedActivities.map(([date, dayActivities]) => (
					<div key={date}>
						{/* Date Header */}
						<div className="mb-4 flex items-center space-x-4">
							<h4 className="font-medium text-gray-500 text-sm dark:text-gray-400">
								{formatDate(date)}
							</h4>
							<div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
						</div>

						{/* Activities for this date */}
						<div className="space-y-4">
							{dayActivities.map((activity) => (
								<div key={activity._id} className="flex items-start space-x-3">
									{/* Actor Avatar */}
									<div className="flex-shrink-0">
										{activity.actorAvatar ? (
											<Avatar
												img={activity.actorAvatar}
												alt={activity.actorName}
												size="sm"
											/>
										) : (
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
												<span className="font-medium text-gray-600 text-xs dark:text-gray-300">
													{activity.actorName.charAt(0).toUpperCase()}
												</span>
											</div>
										)}
									</div>

									{/* Activity Content */}
									<div className="min-w-0 flex-1">
										<div className="flex items-center space-x-2">
											{/* Action Icon */}
											<div
												className={`flex-shrink-0 rounded-full p-1 ${
													activity.color === "green"
														? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
														: activity.color === "blue"
															? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
															: activity.color === "red"
																? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
																: activity.color === "yellow"
																	? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
																	: activity.color === "purple"
																		? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
																		: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
												}`}
											>
												{activity.icon}
											</div>

											{/* Activity Description */}
											<p className="flex-1 text-gray-900 text-sm dark:text-white">
												<span className="font-medium">
													{activity.actorName}
												</span>{" "}
												<span>{activity.description}</span>
											</p>

											{/* Timestamp */}
											<span className="flex-shrink-0 text-gray-500 text-xs dark:text-gray-400">
												{formatTime(activity.createdAt)}
											</span>
										</div>

										{/* Additional Metadata */}
										{activity.metadata?.updatedFields && (
											<div className="mt-1 text-gray-500 text-xs dark:text-gray-400">
												Updated: {activity.metadata.updatedFields.join(", ")}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Load More Button */}
			{activities.hasMore && (
				<div className="mt-6 text-center">
					<Button color="gray" outline size="sm">
						<RefreshCw className="mr-2 h-4 w-4" />
						Load More Activity
					</Button>
				</div>
			)}
		</Card>
	);
}
