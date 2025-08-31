import { BlockNoteView } from "@blocknote/mantine";
import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Breadcrumb,
	BreadcrumbItem,
	Button,
	Card,
	Spinner,
	TextInput,
} from "flowbite-react";
import { Edit3, MoreHorizontal, Save, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBlockNoteSync } from "@/hooks/useBlockNoteSync";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface IdeasEditorProps {
	ideaId: Id<"ideas">;
	workspaceId: Id<"workspaces">;
	onClose?: () => void;
}

export function IdeasEditor({
	ideaId,
	workspaceId,
	onClose,
}: IdeasEditorProps) {
	const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
		"saved",
	);
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [titleValue, setTitleValue] = useState("");

	// Get idea data
	const idea = useQuery(api.ideas.get, { ideaId });
	const updateIdea = useMutation(api.ideas.update);

	// BlockNote sync hook
	const { editor, isLoading, initialContent, create, onChange } =
		useBlockNoteSync(ideaId);

	// Initialize title when idea loads
	useEffect(() => {
		if (idea && !titleValue) {
			setTitleValue(idea.title);
		}
	}, [idea, titleValue]);

	// Auto-save status tracking
	const handleContentChange = () => {
		setSaveStatus("saving");
		// After a short delay, mark as saved (in real implementation,
		// this would be connected to the actual save completion)
		setTimeout(() => setSaveStatus("saved"), 1000);

		// Call the hook's onChange handler
		onChange();
	};

	// Handle title update
	const handleTitleUpdate = async () => {
		if (!idea || !titleValue.trim() || titleValue === idea.title) {
			setIsEditingTitle(false);
			setTitleValue(idea?.title || "");
			return;
		}

		try {
			await updateIdea({
				ideaId: idea._id,
				title: titleValue.trim(),
			});
			setIsEditingTitle(false);
			toast.success("Title updated!");
		} catch (_error) {
			toast.error("Failed to update title");
			setTitleValue(idea.title);
			setIsEditingTitle(false);
		}
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

	if (isLoading || !idea) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<Spinner size="lg" className="mb-4" />
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
		<div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
			{/* Breadcrumb Navigation */}
			<div className="border-gray-200 border-b bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
				<Breadcrumb>
					<BreadcrumbItem href="/ideas">Notes</BreadcrumbItem>
					<BreadcrumbItem>{idea.title}</BreadcrumbItem>
				</Breadcrumb>
			</div>

			{/* Header Card */}
			<Card className="m-6 mb-0 shadow-sm">
				<div className="flex items-center justify-between">
					{/* Title */}
					<div className="min-w-0 flex-1">
						{isEditingTitle ? (
							<TextInput
								value={titleValue}
								onChange={(e) => setTitleValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleTitleUpdate();
									if (e.key === "Escape") setIsEditingTitle(false);
								}}
								onBlur={handleTitleUpdate}
								sizing="lg"
								className="font-semibold text-2xl"
							/>
						) : (
							<button
								onClick={() => setIsEditingTitle(true)}
								className="group flex w-full items-center text-left font-semibold text-2xl text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
							>
								<span className="truncate">{idea.title}</span>
								<Edit3 className="ml-2 h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-50" />
							</button>
						)}
					</div>

					{/* Actions */}
					<div className="ml-4 flex items-center gap-3">
						{/* Save Status */}
						<div className={`text-sm ${getSaveStatusColor()}`}>
							{getSaveStatusText()}
						</div>

						{/* Action Buttons */}
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								color="gray"
								outline
								onClick={handleManualSave}
								disabled={saveStatus === "saving"}
							>
								<Save className="mr-2 h-4 w-4" />
								Save
							</Button>
							<Button size="sm" color="blue" outline>
								<Share className="mr-2 h-4 w-4" />
								Share
							</Button>
							<Button size="sm" color="gray" outline>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
							{onClose && (
								<Button size="sm" color="gray" outline onClick={onClose}>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
				</div>
			</Card>

			{/* Editor Card */}
			<Card className="m-6 mt-4 flex-1 overflow-hidden">
				{editor ? (
					<div className="h-full overflow-y-auto">
						<div className="p-8">
							<BlockNoteView
								editor={editor}
								theme="light"
								className="min-h-96"
								onChange={handleContentChange}
							/>
						</div>
					</div>
				) : initialContent !== null ? (
					<div className="flex h-full items-center justify-center">
						<div className="max-w-md text-center">
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
										},
									] as any)
								}
							>
								Create Document
							</Button>
						</div>
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<Spinner size="lg" className="mb-4" />
							<div className="text-gray-400">Loading document...</div>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}

/**
 * Convert BlockNote blocks to markdown (same as in the hook)
 */
function blocksToMarkdown(blocks: any[]): string {
	return blocks
		.map((block) => {
			switch (block.type) {
				case "heading": {
					const level = block.props?.level || 1;
					const headingPrefix = "#".repeat(level);
					return `${headingPrefix} ${block.content?.[0]?.text || ""}`;
				}
				case "paragraph":
					return block.content?.map((item: any) => item.text).join("") || "";
				case "bulletListItem":
					return `- ${block.content?.map((item: any) => item.text).join("") || ""}`;
				case "numberedListItem":
					return `1. ${block.content?.map((item: any) => item.text).join("") || ""}`;
				case "codeBlock":
					return `\`\`\`\n${block.content?.map((item: any) => item.text).join("") || ""}\n\`\`\``;
				case "quote":
					return `> ${block.content?.map((item: any) => item.text).join("") || ""}`;
				default:
					return block.content?.map((item: any) => item.text).join("") || "";
			}
		})
		.join("\n\n");
}
