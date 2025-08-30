import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation } from "convex/react";
import { Button } from "flowbite-react";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IdeaFormProps {
	workspaceId: Id<"workspaces">;
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
	onClose: () => void;
}

export function IdeaForm({
	workspaceId,
	projectId,
	folderId,
	onClose,
}: IdeaFormProps) {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createIdea = useMutation(api.ideas.create);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await createIdea({
				workspaceId,
				projectId,
				folderId,
				title: title.trim(),
				contentMD: content.trim(),
			});
			toast.success("Idea created successfully!");
			onClose();
		} catch (error) {
			toast.error("Failed to create idea");
			console.error("Create idea error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onClose();
		}
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			handleSubmit(e);
		}
	};

	return (
		<Card className="border-2 border-blue-200 bg-blue-50/50">
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle className="text-blue-900">Create New Idea</CardTitle>
				<Button color="gray" size="sm" onClick={onClose} className="p-1">
					<X className="h-4 w-4" />
				</Button>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Title */}
					<div>
						<Label
							htmlFor="idea-title"
							className="font-medium text-gray-700 text-sm"
						>
							Title *
						</Label>
						<Input
							id="idea-title"
							type="text"
							placeholder="Enter idea title..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onKeyDown={handleKeyDown}
							maxLength={200}
							required
							autoFocus
						/>
						<p className="mt-1 text-gray-500 text-xs">
							{title.length}/200 characters
						</p>
					</div>

					{/* Content */}
					<div>
						<Label
							htmlFor="idea-content"
							className="font-medium text-gray-700 text-sm"
						>
							Content
						</Label>
						<textarea
							id="idea-content"
							placeholder="Describe your idea..."
							value={content}
							onChange={(e) => setContent(e.target.value)}
							onKeyDown={handleKeyDown}
							rows={6}
							className="resize-vertical w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<p className="mt-1 text-gray-500 text-xs">
							Supports Markdown formatting
						</p>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3">
						<Button
							color="gray"
							outline
							onClick={onClose}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							color="blue"
							type="submit"
							disabled={!title.trim() || isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create Idea"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
