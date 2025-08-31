import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import {
	Badge,
	Button,
	Card,
	Spinner,
	TabItem,
	Tabs,
	Textarea,
	TextInput,
} from "flowbite-react";
import {
	Brain,
	ChevronLeft,
	Clock,
	Download,
	FileText,
	History,
	Share2,
	Sparkles,
	Tags,
	Target,
	User,
	X,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IdeasActionsProps {
	ideaId: Id<"ideas">;
	workspaceId: Id<"workspaces">;
	onCollapse: () => void;
}

export function IdeasActions({
	ideaId,
	workspaceId,
	onCollapse,
}: IdeasActionsProps) {
	const [newTag, setNewTag] = useState("");
	const [aiPrompt, setAiPrompt] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	// Get idea data
	const idea = useQuery(api.ideas.get, { ideaId });
	const tags = useQuery(api.tags.listForIdea, { ideaId }) || [];
	const user = useQuery(api.users.getCurrentUser);

	// Mutations
	const addTag = useMutation(api.tags.addToIdea);
	const removeTag = useMutation(api.tags.removeFromIdea);

	// Actions (AI functions)
	const processMessage = useAction(api.ai.processMessage);
	const suggestTags = useAction(api.ai.suggestTags);
	const summarizeIdea = useAction(api.ai.summarizeIdea);

	const handleGenerateTags = async () => {
		if (!idea) return;

		try {
			setIsProcessing(true);
			const suggestions = await suggestTags({
				workspaceId,
				ideaId: idea._id,
			});

			// Auto-add suggested tags
			for (const tagName of suggestions) {
				try {
					await addTag({
						ideaId: idea._id,
						tagName,
					});
				} catch (error) {
					// Tag might already exist, continue with others
				}
			}

			toast.success(`Generated ${suggestions.length} tag suggestions!`);
		} catch (error) {
			console.error("Tag generation error:", error);
			toast.error("Failed to generate tags");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleAddTag = async () => {
		if (!newTag.trim()) return;

		try {
			await addTag({
				ideaId,
				tagName: newTag.trim(),
			});
			setNewTag("");
			toast.success("Tag added!");
		} catch (error) {
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
		} catch (error) {
			toast.error("Failed to remove tag");
		}
	};

	const handleAiPrompt = async () => {
		if (!aiPrompt.trim() || !workspaceId) return;

		setIsProcessing(true);
		try {
			const result = await processMessage({
				workspaceId,
				message: aiPrompt,
				usePrivacy: false,
				model: "enhanced", // Use enhanced model for idea processing
			});

			if (result.text) {
				toast.success("AI response generated!");
				// TODO: Display the AI response in a modal or in the interface

				// If AI created an idea or wants to navigate somewhere, handle it
				if (result.action === "navigate" && result.target) {
					// TODO: Implement navigation
				}
			} else if (result.error) {
				toast.error("AI processing failed");
			}

			setAiPrompt(""); // Clear the prompt
		} catch (error) {
			console.error("AI processing error:", error);
			toast.error("Failed to process AI request");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSummarize = async () => {
		if (!idea) return;

		setIsProcessing(true);
		try {
			const result = await summarizeIdea({
				workspaceId,
				ideaId: idea._id,
			});

			toast.success("Summary generated and added to your idea!");
		} catch (error) {
			console.error("Summarization error:", error);
			toast.error("Failed to generate summary");
		} finally {
			setIsProcessing(false);
		}
	};

	if (!idea) {
		return (
			<div className="flex h-full items-center justify-center p-4">
				<Spinner size="lg" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-gray-200 border-b bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<h3 className="font-medium text-gray-900 dark:text-white">Actions</h3>
				<Button size="xs" color="gray" outline onClick={onCollapse}>
					<ChevronLeft className="h-4 w-4" />
				</Button>
			</div>

			{/* Tabs Content */}
			<div className="flex-1 overflow-hidden">
				<Tabs aria-label="Idea actions" variant="underline" className="h-full">
					<TabItem active title="AI Assistant" icon={Brain}>
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
											placeholder="Ask AI to help with your idea..."
											value={aiPrompt}
											onChange={(e) => setAiPrompt(e.target.value)}
											rows={3}
											className="text-sm"
										/>

										<div className="flex gap-2">
											<Button
												size="sm"
												color="blue"
												onClick={handleAiPrompt}
												disabled={!aiPrompt.trim() || isProcessing}
												className="flex-1"
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
									</div>

									{/* Quick AI Actions */}
									<div className="border-t pt-3">
										<p className="mb-2 text-gray-500 text-xs">Quick actions:</p>
										<div className="grid grid-cols-2 gap-2">
											<Button
												size="xs"
												color="gray"
												outline
												disabled={isProcessing}
												onClick={async () => {
													const prompt =
														"Improve the writing and clarity of this idea";
													setAiPrompt(prompt);
													setIsProcessing(true);
													try {
														const result = await processMessage({
															workspaceId,
															message: prompt,
															usePrivacy: false,
															model: "enhanced",
														});

														if (result.text) {
															toast.success(
																"AI improvement suggestions generated!",
															);
														}
													} catch (error) {
														console.error("AI processing error:", error);
														toast.error("Failed to process AI request");
													} finally {
														setIsProcessing(false);
														setAiPrompt("");
													}
												}}
											>
												<Sparkles className="mr-1 h-3 w-3" />
												Improve
											</Button>
											<Button
												size="xs"
												color="gray"
												outline
												disabled={isProcessing}
												onClick={handleSummarize}
											>
												<Target className="mr-1 h-3 w-3" />
												Summarize
											</Button>
											<Button
												size="xs"
												color="gray"
												outline
												disabled={isProcessing}
												onClick={async () => {
													const prompt =
														"Expand this idea with more details and examples";
													setAiPrompt(prompt);
													setIsProcessing(true);
													try {
														const result = await processMessage({
															workspaceId,
															message: prompt,
															usePrivacy: false,
															model: "enhanced",
														});

														if (result.text) {
															toast.success(
																"AI expansion suggestions generated!",
															);
														}
													} catch (error) {
														console.error("AI processing error:", error);
														toast.error("Failed to process AI request");
													} finally {
														setIsProcessing(false);
														setAiPrompt("");
													}
												}}
											>
												<FileText className="mr-1 h-3 w-3" />
												Expand
											</Button>
											<Button
												size="xs"
												color="gray"
												outline
												disabled={isProcessing}
												onClick={handleGenerateTags}
											>
												<Tags className="mr-1 h-3 w-3" />
												Tags
											</Button>
										</div>
									</div>
								</div>
							</Card>
						</div>
					</TabItem>

					<TabItem title="Tags" icon={Tags}>
						<div className="h-full space-y-4 overflow-y-auto p-4">
							{/* Tags Management */}
							<Card>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Tags className="h-5 w-5 text-blue-500" />
											<h4 className="font-medium">Tags</h4>
										</div>
										<Button
											size="xs"
											color="blue"
											onClick={handleGenerateTags}
											disabled={isProcessing}
										>
											{isProcessing ? (
												<>
													<Spinner size="xs" className="mr-1" />
													Generating...
												</>
											) : (
												<>
													<Sparkles className="mr-1 h-3 w-3" />
													AI Suggest
												</>
											)}
										</Button>
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
					</TabItem>

					<TabItem title="Info" icon={FileText}>
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
											<span className="text-gray-600 dark:text-gray-400">
												Status
											</span>
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
											<span className="text-gray-600 dark:text-gray-400">
												Words
											</span>
											<span className="font-medium">
												{idea.contentMD
													? idea.contentMD.split(/\s+/).length
													: 0}
											</span>
										</div>

										{/* Created */}
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">
												Created
											</span>
											<span className="font-medium">
												{new Date(idea.createdAt).toLocaleDateString()}
											</span>
										</div>

										{/* Modified */}
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">
												Modified
											</span>
											<span className="font-medium">
												{new Date(idea.updatedAt).toLocaleDateString()}
											</span>
										</div>

										{/* Author */}
										{user && (
											<div className="flex items-center justify-between">
												<span className="text-gray-600 dark:text-gray-400">
													Author
												</span>
												<div className="flex items-center">
													<User className="mr-1 h-3 w-3" />
													<span className="font-medium">
														{user.name || "You"}
													</span>
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
					</TabItem>
				</Tabs>
			</div>
		</div>
	);
}
