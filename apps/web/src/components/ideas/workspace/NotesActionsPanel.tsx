import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import {
	Badge,
	Button,
	Card,
	Spinner,
	Textarea,
	TextInput,
} from "flowbite-react";
import {
	Brain,
	Download,
	FileText,
	History,
	Share2,
	Tags,
	Target,
	User,
	X,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NotesToolbar } from "./NotesToolbar";

interface NotesActionsPanelProps {
	ideaId: Id<"ideas">;
	workspaceId: Id<"workspaces">;
}

interface AssistantPanelProps {
	ideaId: Id<"ideas">;
	workspaceId: Id<"workspaces">;
}

interface InfoPanelProps {
	ideaId: Id<"ideas">;
}

interface TagsPanelProps {
	ideaId: Id<"ideas">;
}

function AssistantPanel({ ideaId, workspaceId }: AssistantPanelProps) {
	const [aiPrompt, setAiPrompt] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	// Get data
	const idea = useQuery(api.ideas.get, { ideaId });

	// Actions (AI functions)
	const processMessage = useAction(api.ai.processMessage);
	const suggestTags = useAction(api.ai.suggestTags);
	const summarizeIdea = useAction(api.ai.summarizeIdea);

	const handleAiPrompt = async () => {
		if (!aiPrompt.trim() || !workspaceId) return;

		setIsProcessing(true);
		try {
			const result = await processMessage({
				workspaceId,
				message: aiPrompt,
				usePrivacy: false,
				model: "enhanced",
			});

			if (result.text) {
				toast.success("AI response generated!");
			} else if (result.error) {
				toast.error("AI processing failed");
			}

			setAiPrompt("");
		} catch (error) {
			console.error("AI processing error:", error);
			toast.error("Failed to process AI request");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleGenerateTags = async () => {
		if (!idea) return;

		try {
			setIsProcessing(true);
			const suggestions = await suggestTags({
				workspaceId,
				ideaId: idea._id,
			});

			toast.success(`Generated ${suggestions.length} tag suggestions!`);
		} catch (error) {
			console.error("Tag generation error:", error);
			toast.error("Failed to generate tags");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSummarize = async () => {
		if (!idea) return;

		setIsProcessing(true);
		try {
			await summarizeIdea({
				workspaceId,
				ideaId: idea._id,
			});

			toast.success("Summary generated and added to your note!");
		} catch (error) {
			console.error("Summarization error:", error);
			toast.error("Failed to generate summary");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="h-full space-y-4 overflow-y-auto p-4">
			{/* AI Chat Interface */}
			<Card>
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Brain className="h-5 w-5 text-blue-500" />
						<h4 className="font-medium">AI Assistant</h4>
					</div>

					<div className="space-y-3">
						<Textarea
							placeholder="Ask AI to help with your note..."
							value={aiPrompt}
							onChange={(e) => setAiPrompt(e.target.value)}
							rows={3}
							className="text-sm"
						/>

						<Button
							size="sm"
							color="blue"
							onClick={handleAiPrompt}
							disabled={!aiPrompt.trim() || isProcessing}
							className="w-full"
						>
							{isProcessing ? (
								<>
									<Spinner size="sm" className="mr-2" />
									Processing...
								</>
							) : (
								<>
									<Zap className="mr-2 h-4 w-4" />
									Ask AI
								</>
							)}
						</Button>
					</div>

					{/* Quick AI Actions */}
					<div className="border-t pt-3">
						<p className="mb-2 text-gray-500 text-xs">Quick actions:</p>
						<div className="grid grid-cols-1 gap-2">
							<Button
								size="xs"
								color="gray"
								outline
								disabled={isProcessing}
								onClick={handleSummarize}
								className="justify-start"
							>
								<Target className="mr-2 h-3 w-3" />
								Summarize
							</Button>
							<Button
								size="xs"
								color="gray"
								outline
								disabled={isProcessing}
								onClick={handleGenerateTags}
								className="justify-start"
							>
								<Tags className="mr-2 h-3 w-3" />
								Generate Tags
							</Button>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}

function InfoPanel({ ideaId }: InfoPanelProps) {
	// Get idea data
	const idea = useQuery(api.ideas.get, { ideaId });
	const user = useQuery(api.users.getCurrentUser);

	if (!idea) {
		return (
			<div className="flex h-full items-center justify-center p-4">
				<Spinner size="lg" />
			</div>
		);
	}

	return (
		<div className="h-full space-y-4 overflow-y-auto p-4">
			{/* Document Info */}
			<Card>
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5 text-blue-500" />
						<h4 className="font-medium">Document Info</h4>
					</div>

					<div className="space-y-3 text-sm">
						{/* Status */}
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Status</span>
							<Badge
								color={
									idea.status === "active"
										? "green"
										: idea.status === "draft"
											? "yellow"
											: "gray"
								}
							>
								{idea.status}
							</Badge>
						</div>

						{/* Word Count */}
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Words</span>
							<span className="font-medium">
								{idea.contentMD ? idea.contentMD.split(/\s+/).length : 0}
							</span>
						</div>

						{/* Created */}
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Created</span>
							<span className="font-medium">
								{new Date(idea.createdAt).toLocaleDateString()}
							</span>
						</div>

						{/* Modified */}
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Modified</span>
							<span className="font-medium">
								{new Date(idea.updatedAt).toLocaleDateString()}
							</span>
						</div>

						{/* Author */}
						{user && (
							<div className="flex items-center justify-between">
								<span className="text-gray-600 dark:text-gray-400">Author</span>
								<div className="flex items-center">
									<User className="mr-1 h-3 w-3" />
									<span className="font-medium">{user.name || "You"}</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</Card>

			{/* Export & Share */}
			<Card>
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Share2 className="h-5 w-5 text-blue-500" />
						<h4 className="font-medium">Export & Share</h4>
					</div>

					<div className="space-y-2">
						<Button
							size="sm"
							color="gray"
							outline
							className="w-full justify-start"
						>
							<Download className="mr-2 h-4 w-4" />
							Export as PDF
						</Button>
						<Button
							size="sm"
							color="gray"
							outline
							className="w-full justify-start"
						>
							<FileText className="mr-2 h-4 w-4" />
							Export as Markdown
						</Button>
						<Button
							size="sm"
							color="gray"
							outline
							className="w-full justify-start"
						>
							<Share2 className="mr-2 h-4 w-4" />
							Share link
						</Button>
						<Button
							size="sm"
							color="gray"
							outline
							className="w-full justify-start"
						>
							<History className="mr-2 h-4 w-4" />
							Version history
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}

function TagsPanel({ ideaId }: TagsPanelProps) {
	const [newTag, setNewTag] = useState("");

	// Get tags
	const tags = useQuery(api.tags.listForIdea, { ideaId }) || [];

	// Mutations
	const addTag = useMutation(api.tags.addToIdea);
	const removeTag = useMutation(api.tags.removeFromIdea);

	const handleAddTag = async () => {
		if (!newTag.trim()) return;

		try {
			await addTag({
				ideaId,
				tagName: newTag.trim(),
			});
			setNewTag("");
			toast.success("Tag added!");
		} catch (_error) {
			toast.error("Failed to add tag");
		}
	};

	const handleRemoveTag = async (tagId: Id<"tags">) => {
		try {
			await removeTag({
				ideaId,
				tagId,
			});
			toast.success("Tag removed!");
		} catch (_error) {
			toast.error("Failed to remove tag");
		}
	};

	return (
		<div className="h-full space-y-4 overflow-y-auto p-4">
			{/* Tags Management */}
			<Card>
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Tags className="h-5 w-5 text-blue-500" />
						<h4 className="font-medium">Tags</h4>
					</div>

					{/* Existing Tags */}
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{tags.map(
								(tag) =>
									tag && (
										<Badge
											key={tag._id}
											color="blue"
											className="cursor-pointer hover:bg-red-100"
											onClick={() => handleRemoveTag(tag._id)}
										>
											{tag.name}
											<X className="ml-1 h-3 w-3" />
										</Badge>
									),
							)}
						</div>
					)}

					{/* Add Tag */}
					<div className="flex gap-2">
						<TextInput
							placeholder="Add tag..."
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleAddTag();
							}}
							sizing="sm"
							className="flex-1"
						/>
						<Button
							size="sm"
							color="blue"
							onClick={handleAddTag}
							disabled={!newTag.trim()}
						>
							Add
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}

export function NotesActionsPanel({
	ideaId,
	workspaceId,
}: NotesActionsPanelProps) {
	const [selectedTool, setSelectedTool] = useState<
		"assistant" | "info" | "tags" | null
	>("assistant");
	const [isCollapsed, setIsCollapsed] = useState(false);

	const renderPanel = () => {
		if (isCollapsed || !selectedTool) return null;

		switch (selectedTool) {
			case "assistant":
				return <AssistantPanel ideaId={ideaId} workspaceId={workspaceId} />;
			case "info":
				return <InfoPanel ideaId={ideaId} />;
			case "tags":
				return <TagsPanel ideaId={ideaId} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex h-full">
			{/* Toolbar */}
			<NotesToolbar
				selectedTool={selectedTool}
				onSelectTool={setSelectedTool}
				isCollapsed={isCollapsed}
				onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
			/>

			{/* Panel Content */}
			{!isCollapsed && selectedTool && (
				<div className="w-80 border-gray-200 border-l bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
					{renderPanel()}
				</div>
			)}
		</div>
	);
}
