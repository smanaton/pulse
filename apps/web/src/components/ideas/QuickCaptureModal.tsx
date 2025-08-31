import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation } from "convex/react";
import {
	Button,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Textarea,
	TextInput,
} from "flowbite-react";
import { Lightbulb, Save } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

interface QuickCaptureModalProps {
	workspaceId: Id<"workspaces">;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: (ideaId: Id<"ideas">) => void;
}

export function QuickCaptureModal({
	workspaceId,
	isOpen,
	onClose,
	onSuccess,
}: QuickCaptureModalProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const titleId = useId();
	const descriptionId = useId();

	const createIdea = useMutation(api.ideas.create);

	// Reset form when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setTitle("");
			setDescription("");
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			toast.error("Title is required");
			return;
		}

		setIsSaving(true);
		try {
			const ideaId = await createIdea({
				workspaceId,
				title: title.trim(),
				contentMD:
					description.trim() ||
					`# ${title.trim()}\n\n*Add your thoughts here...*`,
			});

			toast.success("Idea captured!");
			onSuccess?.(ideaId);
			onClose();
		} catch (_error) {
			toast.error("Failed to save idea");
		} finally {
			setIsSaving(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			handleSubmit(e);
		}
	};

	return (
		<Modal show={isOpen} onClose={onClose} size="lg">
			<ModalHeader>
				<div className="flex items-center gap-2">
					<Lightbulb className="h-5 w-5 text-yellow-500" />
					Quick Capture
				</div>
			</ModalHeader>

			<form onSubmit={handleSubmit}>
				<ModalBody>
					<div className="space-y-4">
						<div>
							<Label htmlFor={titleId} className="mb-2 block">
								Idea Title *
							</Label>
							<TextInput
								id={titleId}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="What's your idea?"
								autoFocus
								onKeyDown={handleKeyDown}
							/>
						</div>

						<div>
							<Label htmlFor={descriptionId} className="mb-2 block">
								Quick Description
							</Label>
							<Textarea
								id={descriptionId}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Capture your initial thoughts... (you can expand later)"
								rows={4}
								onKeyDown={handleKeyDown}
							/>
						</div>

						<div className="text-gray-500 text-sm">
							💡 <strong>Tip:</strong> Just capture the core idea quickly. You
							can add structured details, get AI feedback, and develop it
							further afterwards.
						</div>
					</div>
				</ModalBody>

				<ModalFooter>
					<div className="flex w-full items-center justify-between">
						<div className="text-gray-500 text-sm">
							Press{" "}
							<kbd className="rounded bg-gray-100 px-1 text-gray-600">
								Cmd+Enter
							</kbd>{" "}
							to save
						</div>
						<div className="flex gap-2">
							<Button color="gray" onClick={onClose} disabled={isSaving}>
								Cancel
							</Button>
							<Button
								type="submit"
								color="blue"
								disabled={!title.trim() || isSaving}
							>
								<Save className="mr-2 h-4 w-4" />
								{isSaving ? "Saving..." : "Capture Idea"}
							</Button>
						</div>
					</div>
				</ModalFooter>
			</form>
		</Modal>
	);
}
