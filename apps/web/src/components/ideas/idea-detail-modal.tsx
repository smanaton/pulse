import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Button } from "flowbite-react";
import { Edit, ExternalLink, FileEdit, Save, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IdeaDetailModalProps {
	idea: {
		_id: Id<"ideas">;
		title: string;
		contentMD: string;
		contentBlocks?: string;
		status: "draft" | "active" | "archived";
		createdAt: number;
		updatedAt: number;
	};
	workspaceId: Id<"workspaces">;
	onClose: () => void;
}

/**
 * Render idea content, preferring blocks over markdown
 */
function renderIdeaContent(idea: IdeaDetailModalProps["idea"]) {
	// Try to render block content first if available
	if (idea.contentBlocks) {
		try {
			const blocks = JSON.parse(idea.contentBlocks);
			return (
				<div className="space-y-3">
					{blocks.map((block: any, index: number) => renderBlock(block, index))}
				</div>
			);
		} catch (error) {
			console.error("Failed to parse block content:", error);
		}
	}

	// Fallback to markdown content
	if (idea.contentMD) {
		return (
			<pre className="whitespace-pre-wrap font-sans text-gray-700">
				{idea.contentMD}
			</pre>
		);
	}

	return <p className="text-gray-500 italic">No content provided</p>;
}

/**
 * Render a single block in read-only mode
 */
function renderBlock(block: any, index: number) {
	const getTextContent = (content: any[]) => {
		return content?.map((item) => item.text).join("") || "";
	};

	switch (block.type) {
		case "heading": {
			const level = block.props?.level || 1;
			const HeadingTag =
				`h${Math.min(level + 2, 6)}` as keyof React.JSX.IntrinsicElements;
			return React.createElement(
				HeadingTag,
				{
					key: index,
					className: `font-bold ${
						level === 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base"
					} text-gray-900`,
				},
				getTextContent(block.content),
			);
		}

		case "paragraph":
			return (
				<p key={index} className="text-gray-700 leading-relaxed">
					{getTextContent(block.content) || "\u00A0"}
				</p>
			);

		case "bulletListItem":
			return (
				<div key={index} className="flex items-start gap-2">
					<span className="mt-2 text-gray-400 text-xs">•</span>
					<span className="flex-1 text-gray-700">
						{getTextContent(block.content)}
					</span>
				</div>
			);

		case "numberedListItem":
			return (
				<div key={index} className="flex items-start gap-2">
					<span className="mt-0 min-w-[1.5rem] text-gray-400 text-sm">
						{index + 1}.
					</span>
					<span className="flex-1 text-gray-700">
						{getTextContent(block.content)}
					</span>
				</div>
			);

		case "codeBlock":
			return (
				<pre
					key={index}
					className="overflow-x-auto rounded-md border bg-gray-100 p-3 font-mono text-gray-800 text-sm"
				>
					{getTextContent(block.content)}
				</pre>
			);

		case "quote":
			return (
				<blockquote
					key={index}
					className="border-gray-300 border-l-4 bg-gray-50 py-2 pl-4 text-gray-700 italic"
				>
					{getTextContent(block.content)}
				</blockquote>
			);

		default:
			return (
				<div key={index} className="text-gray-700">
					{getTextContent(block.content)}
				</div>
			);
	}
}

export function IdeaDetailModal({
	idea,
	workspaceId,
	onClose,
}: IdeaDetailModalProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(idea.title);
	const [content, setContent] = useState(idea.contentMD);
	const [status, setStatus] = useState<"draft" | "active" | "archived">(
		idea.status,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateIdea = useMutation(api.ideas.update);

	const handleSave = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);

		try {
			await updateIdea({
				ideaId: idea._id,
				title: title.trim(),
				contentMD: content.trim(),
				status,
			});
			toast.success("Idea updated successfully!");
			setIsEditing(false);
		} catch (error) {
			toast.error("Failed to update idea");
			console.error("Update idea error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setTitle(idea.title);
		setContent(idea.contentMD);
		setStatus(idea.status);
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			if (isEditing) {
				handleCancel();
			} else {
				onClose();
			}
		}
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && isEditing) {
			handleSave();
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "draft":
				return "bg-gray-100 text-gray-800 border-gray-300";
			case "active":
				return "bg-blue-100 text-blue-800 border-blue-300";
			case "archived":
				return "bg-yellow-100 text-yellow-800 border-yellow-300";
			default:
				return "bg-gray-100 text-gray-800 border-gray-300";
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b p-6">
					<div className="flex items-center gap-3">
						<h2 className="font-bold text-gray-900 text-xl">
							{isEditing ? "Edit Idea" : "Idea Details"}
						</h2>
						<span
							className={`rounded-full border px-2.5 py-1 font-medium text-xs ${getStatusColor(status)}`}
						>
							{status}
						</span>
					</div>
					<div className="flex items-center gap-2">
						{!isEditing ? (
							<>
								<Link
									to="/ideas/$ideaId/edit"
									params={{ ideaId: idea._id }}
									className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 font-medium text-sm text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									<FileEdit className="mr-2 h-4 w-4" />
									Open Editor
								</Link>
								<Button
									color="gray"
									outline
									size="sm"
									onClick={() => setIsEditing(true)}
								>
									<Edit className="mr-2 h-4 w-4" />
									Quick Edit
								</Button>
							</>
						) : (
							<div className="flex gap-2">
								<Button
									color="gray"
									outline
									size="sm"
									onClick={handleCancel}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									color="blue"
									size="sm"
									onClick={handleSave}
									disabled={!title.trim() || isSubmitting}
								>
									<Save className="mr-2 h-4 w-4" />
									{isSubmitting ? "Saving..." : "Save"}
								</Button>
							</div>
						)}
						<Button color="gray" size="sm" onClick={onClose} className="p-1">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
					<div className="space-y-6 p-6">
						{isEditing ? (
							<>
								{/* Edit Form */}
								<div>
									<Label
										htmlFor="edit-title"
										className="font-medium text-gray-700 text-sm"
									>
										Title *
									</Label>
									<Input
										id="edit-title"
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										onKeyDown={handleKeyDown}
										maxLength={200}
										required
									/>
									<p className="mt-1 text-gray-500 text-xs">
										{title.length}/200 characters
									</p>
								</div>

								<div>
									<Label
										htmlFor="edit-status"
										className="font-medium text-gray-700 text-sm"
									>
										Status
									</Label>
									<select
										id="edit-status"
										value={status}
										onChange={(e) =>
											setStatus(
												e.target.value as "draft" | "active" | "archived",
											)
										}
										className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="draft">Draft</option>
										<option value="active">Active</option>
										<option value="archived">Archived</option>
									</select>
								</div>

								<div>
									<Label
										htmlFor="edit-content"
										className="font-medium text-gray-700 text-sm"
									>
										Content
									</Label>
									<textarea
										id="edit-content"
										value={content}
										onChange={(e) => setContent(e.target.value)}
										onKeyDown={handleKeyDown}
										rows={12}
										className="resize-vertical w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<p className="mt-1 text-gray-500 text-xs">
										Supports Markdown formatting
									</p>
								</div>
							</>
						) : (
							<>
								{/* View Mode */}
								<div>
									<h3 className="mb-2 font-bold text-gray-900 text-lg">
										{idea.title}
									</h3>
									<div className="space-y-1 text-gray-500 text-sm">
										<p>Created: {new Date(idea.createdAt).toLocaleString()}</p>
										{idea.updatedAt !== idea.createdAt && (
											<p>
												Updated: {new Date(idea.updatedAt).toLocaleString()}
											</p>
										)}
									</div>
								</div>

								<div>
									<h4 className="mb-2 font-medium text-gray-900">Content</h4>
									<div className="prose prose-sm max-w-none rounded-lg border bg-gray-50 p-4">
										{renderIdeaContent(idea)}
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
