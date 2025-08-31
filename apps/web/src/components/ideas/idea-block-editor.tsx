import { BlockNoteView } from "@blocknote/mantine";
import type { Block, PartialBlock } from "@blocknote/core";
import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Button } from "flowbite-react";
import { ArrowLeft, Eye, Save, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBlockNoteSync } from "@/hooks/useBlockNoteSync";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface IdeaBlockEditorProps {
	ideaId: Id<"ideas">;
	workspaceId: Id<"workspaces">;
	onBack?: () => void;
	fullScreen?: boolean;
}

export function IdeaBlockEditor({
	ideaId,
	workspaceId: _workspaceId,
	onBack,
	fullScreen = true,
}: IdeaBlockEditorProps) {
	const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
		"saved",
	);
	const [showMetadata, setShowMetadata] = useState(false);
	const navigate = useNavigate();

	// Get idea data
	const idea = useQuery(api.ideas.get, { ideaId });
	const updateIdea = useMutation(api.ideas.update);

	// BlockNote sync hook
	const { editor, isLoading, initialContent, create, onChange } =
		useBlockNoteSync(ideaId);

	// Auto-save status tracking
	const handleContentChange = () => {
		setSaveStatus("saving");
		// After a short delay, mark as saved (in real implementation,
		// this would be connected to the actual save completion)
		setTimeout(() => setSaveStatus("saved"), 1000);

		// Call the hook's onChange handler
		onChange();
	};

	const handleManualSave = async () => {
		if (!editor || !idea) return;

		setSaveStatus("saving");
		try {
			const blocks = editor.document;
			const markdown = blocksToMarkdown(blocks);

			await updateIdea({
				ideaId: idea._id,
				contentMD: markdown,
				contentBlocks: JSON.stringify(blocks),
			});

			setSaveStatus("saved");
			toast.success("Changes saved!");
		} catch (error) {
			setSaveStatus("error");
			toast.error("Failed to save changes");
			console.error("Save error:", error);
		}
	};

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			navigate({ to: "/ideas" });
		}
	};

	if (isLoading || !idea) {
		return (
			<div className="flex min-h-64 items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-600 border-b-2" />
					<p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
				</div>
			</div>
		);
	}

	const getSaveStatusColor = () => {
		switch (saveStatus) {
			case "saving":
				return "text-yellow-600";
			case "saved":
				return "text-green-600";
			case "error":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getSaveStatusText = () => {
		switch (saveStatus) {
			case "saving":
				return "Saving...";
			case "saved":
				return "All changes saved";
			case "error":
				return "Failed to save";
			default:
				return "";
		}
	};

	return (
		<div
			className={`${fullScreen ? "min-h-screen" : "h-full"} bg-white dark:bg-gray-900`}
		>
			{/* Header */}
			<div className="sticky top-0 z-10 border-gray-200 border-b bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
				<div className="flex items-center justify-between px-4 py-3">
					<div className="flex items-center gap-3">
						<Button
							size="sm"
							color="gray"
							outline
							onClick={handleBack}
							className="flex items-center gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>
						<div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
						<h1 className="max-w-md truncate font-semibold text-gray-900 text-lg dark:text-white">
							{idea.title}
						</h1>
					</div>

					<div className="flex items-center gap-3">
						{/* Save Status */}
						<div className={`text-sm ${getSaveStatusColor()}`}>
							{getSaveStatusText()}
						</div>

						{/* Collaboration Indicators */}
						<div className="flex items-center gap-2">
							<Button
								size="xs"
								color="gray"
								outline
								className="flex items-center gap-1"
							>
								<Users className="h-3 w-3" />1
							</Button>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								color="gray"
								outline
								onClick={() => setShowMetadata(!showMetadata)}
							>
								<Eye className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								color="blue"
								onClick={handleManualSave}
								disabled={saveStatus === "saving"}
							>
								<Save className="mr-2 h-4 w-4" />
								Save
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex h-full">
				{/* Editor */}
				<div className="min-w-0 flex-1">
					{editor ? (
						<div className="p-6">
							<BlockNoteView
								editor={editor}
								theme="light"
								className="min-h-96"
								onChange={handleContentChange}
							/>
						</div>
					) : initialContent !== null ? (
						<div className="p-6 text-center">
							<div className="mx-auto max-w-md">
								<h3 className="mb-2 font-medium text-gray-900 text-lg dark:text-white">
									Start Writing
								</h3>
								<p className="mb-4 text-gray-600 dark:text-gray-400">
									Create your first block to get started.
								</p>
								<Button
									color="blue"
									onClick={() =>
										create([
											{
												type: "paragraph",
											} as PartialBlock,
										])
									}
								>
									Create Document
								</Button>
							</div>
						</div>
					) : (
						<div className="p-6 text-center">
							<div className="text-gray-400">Loading document...</div>
						</div>
					)}
				</div>

				{/* Sidebar - Metadata Panel */}
				{showMetadata && (
					<div className="w-80 border-gray-200 border-l bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
						<h3 className="mb-4 font-medium text-gray-900 dark:text-white">
							Document Info
						</h3>
						<div className="space-y-4 text-sm">
							<div>
								<dt className="font-medium text-gray-700 dark:text-gray-300">
									Status
								</dt>
								<dd className="mt-1">
									<span
										className={`inline-flex rounded-full px-2 py-1 font-medium text-xs ${
											idea.status === "draft"
												? "bg-gray-100 text-gray-800"
												: idea.status === "active"
													? "bg-blue-100 text-blue-800"
													: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{idea.status}
									</span>
								</dd>
							</div>
							<div>
								<dt className="font-medium text-gray-700 dark:text-gray-300">
									Created
								</dt>
								<dd className="mt-1 text-gray-600 dark:text-gray-400">
									{new Date(idea.createdAt).toLocaleString()}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-gray-700 dark:text-gray-300">
									Last Modified
								</dt>
								<dd className="mt-1 text-gray-600 dark:text-gray-400">
									{new Date(idea.updatedAt).toLocaleString()}
								</dd>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Convert BlockNote blocks to markdown (same as in the hook)
 */
function blocksToMarkdown(blocks: Block[]): string {
	return blocks
		.map((block) => {
			switch (block.type) {
				case "heading": {
					const level = (block.props as any)?.level || 1;
					const headingPrefix = "#".repeat(level);
					const text = (block.content as any)?.[0]?.text || "";
					return `${headingPrefix} ${text}`;
				}
				case "paragraph":
					return (block.content as any)?.map((item: any) => item.text).join("") || "";
				case "bulletListItem":
					return `- ${(block.content as any)?.map((item: any) => item.text).join("") || ""}`;
				case "numberedListItem":
					return `1. ${(block.content as any)?.map((item: any) => item.text).join("") || ""}`;
				case "codeBlock":
					return `\`\`\`\n${(block.content as any)?.map((item: any) => item.text).join("") || ""}\n\`\`\``;
				case "quote":
					return `> ${(block.content as any)?.map((item: any) => item.text).join("") || ""}`;
				default:
					return (block.content as any)?.map((item: any) => item.text).join("") || "";
			}
		})
		.join("\n\n");
}
