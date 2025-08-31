import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { Badge, Button, Card, Label, Spinner, Textarea } from "flowbite-react";
import {
	AlertTriangle,
	ArrowRight,
	Brain,
	Lightbulb,
	MessageSquare,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IdeaOverviewProps {
	ideaId: Id<"ideas">;
	workspaceId: Id<"workspaces">;
}

export function IdeaOverview({ ideaId, workspaceId }: IdeaOverviewProps) {
	const [activeTab, setActiveTab] = useState<
		"overview" | "discussion" | "research"
	>("overview");
	const [chatMessage, setChatMessage] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	// Data queries
	const idea = useQuery(api.ideas.get, { ideaId });
	const discussion = useQuery(api.ideasExtensions.getIdeaDiscussion, {
		workspaceId,
		ideaId,
	});
	const linkedTasks = useQuery(api.ideasExtensions.getLinkedTasks, {
		workspaceId,
		ideaId,
	});

	// AI actions
	const qualifyIdea = useAction(api.ai.actions.qualifyIdea);
	const contrarianView = useAction(api.ai.actions.contrarianView);
	const ideaChat = useAction(api.ai.actions.ideaChat);
	const promoteToProject = useMutation(api.ideasExtensions.promoteToProject);

	if (!idea) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	const handleQualify = async () => {
		setIsProcessing(true);
		try {
			await qualifyIdea({ workspaceId, ideaId });
			toast.success("Idea qualified!");
		} catch (_error) {
			toast.error("Failed to qualify idea");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleContrarian = async () => {
		setIsProcessing(true);
		try {
			await contrarianView({ workspaceId, ideaId });
			toast.success("Contrarian analysis complete!");
		} catch (_error) {
			toast.error("Failed to generate contrarian view");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleChat = async () => {
		if (!chatMessage.trim()) return;

		setIsProcessing(true);
		try {
			await ideaChat({ workspaceId, ideaId, message: chatMessage });
			setChatMessage("");
			toast.success("Message sent!");
		} catch (_error) {
			toast.error("Failed to send message");
		} finally {
			setIsProcessing(false);
		}
	};

	const handlePromoteToProject = async () => {
		setIsProcessing(true);
		try {
			const result = await promoteToProject({ workspaceId, ideaId });
			toast.success(
				`Promoted to project! ${result.tasksTransferred} tasks transferred.`,
			);
		} catch (_error) {
			toast.error("Failed to promote to project");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-gray-200 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-semibold text-2xl text-gray-900 dark:text-white">
							{idea.title}
						</h1>
						<div className="mt-2 flex items-center gap-2">
							<Badge color={idea.status === "active" ? "green" : "gray"}>
								{idea.status}
							</Badge>
							{idea.projectId && <Badge color="blue">Linked to Project</Badge>}
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							color="blue"
							onClick={handleQualify}
							disabled={isProcessing}
						>
							<Brain className="mr-2 h-4 w-4" />
							Qualify
						</Button>
						<Button
							size="sm"
							color="yellow"
							onClick={handleContrarian}
							disabled={isProcessing}
						>
							<AlertTriangle className="mr-2 h-4 w-4" />
							10th Man
						</Button>
						<Button
							size="sm"
							color="green"
							onClick={handlePromoteToProject}
							disabled={isProcessing || !!idea.projectId}
						>
							<ArrowRight className="mr-2 h-4 w-4" />
							Promote to Project
						</Button>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="border-gray-200 border-b bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
				<div className="flex space-x-8">
					{[
						{ key: "overview" as const, label: "Overview", icon: Lightbulb },
						{
							key: "discussion" as const,
							label: "Discussion",
							icon: MessageSquare,
						},
						{ key: "research" as const, label: "Research", icon: Users },
					].map(({ key, label, icon: Icon }) => (
						<button
							key={key}
							type="button"
							onClick={() => setActiveTab(key)}
							className={`flex items-center gap-2 border-b-2 px-1 py-4 font-medium text-sm ${
								activeTab === key
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
							}`}
						>
							<Icon className="h-4 w-4" />
							{label}
							{key === "research" && linkedTasks && linkedTasks.length > 0 && (
								<Badge color="blue" size="sm">
									{linkedTasks.length}
								</Badge>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-6">
				{activeTab === "overview" && (
					<div className="space-y-6">
						{/* Structured Fields */}
						<div className="grid gap-6 md:grid-cols-2">
							{idea.problem && (
								<Card>
									<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
										Problem
									</h3>
									<p className="text-gray-600 text-sm dark:text-gray-400">
										{idea.problem}
									</p>
								</Card>
							)}
							{idea.hypothesis && (
								<Card>
									<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
										Hypothesis
									</h3>
									<p className="text-gray-600 text-sm dark:text-gray-400">
										{idea.hypothesis}
									</p>
								</Card>
							)}
							{idea.value && (
								<Card>
									<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
										Value
									</h3>
									<p className="text-gray-600 text-sm dark:text-gray-400">
										{idea.value}
									</p>
								</Card>
							)}
							{idea.risks && (
								<Card>
									<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
										Risks
									</h3>
									<p className="text-gray-600 text-sm dark:text-gray-400">
										{idea.risks}
									</p>
								</Card>
							)}
						</div>

						{/* AI Summary */}
						{idea.aiSummary && (
							<Card>
								<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
									AI Summary
								</h3>
								<p className="text-gray-600 text-sm dark:text-gray-400">
									{idea.aiSummary}
								</p>
							</Card>
						)}

						{/* Content */}
						<Card>
							<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
								Content
							</h3>
							<div className="text-gray-600 text-sm dark:text-gray-400">
								{idea.contentMD}
							</div>
						</Card>
					</div>
				)}

				{activeTab === "discussion" && (
					<div className="space-y-4">
						{/* Chat Interface */}
						<Card>
							<div className="space-y-4">
								<Label>Chat with AI about this idea</Label>
								<div className="flex gap-2">
									<Textarea
										value={chatMessage}
										onChange={(e) => setChatMessage(e.target.value)}
										placeholder="Ask questions or discuss aspects of this idea..."
										rows={3}
										className="flex-1"
									/>
									<Button
										onClick={handleChat}
										disabled={!chatMessage.trim() || isProcessing}
									>
										Send
									</Button>
								</div>
							</div>
						</Card>

						{/* Discussion History */}
						<div className="space-y-3">
							{discussion?.map((msg) => (
								<Card key={msg._id}>
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0">
											{msg.role === "assistant" ? (
												<div className="rounded-full bg-blue-100 p-2 text-blue-600">
													<Brain className="h-4 w-4" />
												</div>
											) : (
												<div className="rounded-full bg-gray-100 p-2 text-gray-600">
													<Users className="h-4 w-4" />
												</div>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between">
												<div className="font-medium text-gray-900 text-sm dark:text-white">
													{msg.role === "assistant"
														? "AI Assistant"
														: msg.author?.name || "You"}
												</div>
												{msg.messageType && (
													<Badge color="gray" size="sm">
														{msg.messageType}
													</Badge>
												)}
											</div>
											<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
												{msg.message}
											</p>
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				)}

				{activeTab === "research" && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium text-gray-900 text-lg dark:text-white">
								Research Tasks
							</h3>
							<Button size="sm" color="blue">
								Create Research Task
							</Button>
						</div>

						{linkedTasks && linkedTasks.length > 0 ? (
							<div className="space-y-3">
								{linkedTasks.map((task) => (
									<Card key={task._id}>
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-medium text-gray-900 dark:text-white">
													{task.name}
												</h4>
												{task.description && (
													<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
														{task.description}
													</p>
												)}
												<div className="mt-2 flex items-center gap-2">
													<Badge
														color={
															task.status === "done"
																? "green"
																: task.status === "in_progress"
																	? "blue"
																	: "gray"
														}
													>
														{task.status}
													</Badge>
													<Badge color="gray">{task.priority}</Badge>
													{task.project && (
														<Badge color="indigo">{task.project.name}</Badge>
													)}
												</div>
											</div>
											<div className="text-right">
												{task.progress !== undefined && (
													<div className="text-gray-600 text-sm">
														{task.progress}% complete
													</div>
												)}
												{task.assignees.length > 0 && (
													<div className="-space-x-1 mt-1 flex">
														{task.assignees.slice(0, 3).map((assignee) => (
															<div
																key={assignee._id}
																className="rounded-full bg-gray-200 px-2 py-1 text-gray-600 text-xs"
																title={assignee.name || assignee.email}
															>
																{(assignee.name || assignee.email || "")
																	.charAt(0)
																	.toUpperCase()}
															</div>
														))}
													</div>
												)}
											</div>
										</div>
									</Card>
								))}
							</div>
						) : (
							<div className="py-8 text-center">
								<Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
								<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
									No research tasks yet
								</h3>
								<p className="text-gray-500 dark:text-gray-400">
									Create research tasks to validate this idea.
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
