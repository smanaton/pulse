import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Button,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
} from "flowbite-react";
import { AlertTriangle, FolderX, MoveRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FolderDeleteConfirmDialogProps {
	folderId: Id<"folders"> | null;
	folderName?: string;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function FolderDeleteConfirmDialog({
	folderId,
	folderName = "this folder",
	isOpen,
	onClose,
	onSuccess,
}: FolderDeleteConfirmDialogProps) {
	const [selectedAction, setSelectedAction] = useState<
		"moveToRoot" | "deleteAll" | null
	>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Get folder deletion status
	const deletionStatus = useQuery(
		api.folders.checkDeletionStatus,
		folderId ? { folderId } : "skip",
	);

	const removeWithOptions = useMutation(api.folders.removeWithOptions);

	const handleConfirmDelete = async () => {
		if (!folderId || !selectedAction) return;

		setIsDeleting(true);
		try {
			const result = await removeWithOptions({
				folderId,
				action: selectedAction,
			});

			const actionMessages = {
				moveToRoot: `Folder deleted! ${result.movedIdeas} ideas moved to root.`,
				deleteAll: `Folder deleted! ${result.deletedIdeas} ideas also deleted.`,
			};

			toast.success(actionMessages[selectedAction]);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to delete folder:", error);
			toast.error("Failed to delete folder");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		setSelectedAction(null);
		onClose();
	};

	// If folder can be deleted normally (no ideas), show simple confirmation
	if (deletionStatus?.canDelete) {
		return (
			<Modal show={isOpen} onClose={handleClose} size="md">
				<ModalHeader>
					<div className="flex items-center gap-2">
						<FolderX className="h-5 w-5 text-red-500" />
						Delete Folder
					</div>
				</ModalHeader>

				<ModalBody>
					<p className="text-gray-600 dark:text-gray-300">
						Are you sure you want to delete <strong>{folderName}</strong>? This
						action cannot be undone.
					</p>
				</ModalBody>

				<ModalFooter>
					<div className="flex justify-end gap-2">
						<Button color="gray" onClick={handleClose} disabled={isDeleting}>
							Cancel
						</Button>
						<Button
							color="failure"
							onClick={handleConfirmDelete}
							disabled={isDeleting}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{isDeleting ? "Deleting..." : "Delete Folder"}
						</Button>
					</div>
				</ModalFooter>
			</Modal>
		);
	}

	// Show options for folders with ideas
	return (
		<Modal show={isOpen} onClose={handleClose} size="lg">
			<ModalHeader>
				<div className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5 text-amber-500" />
					Folder Contains Ideas
				</div>
			</ModalHeader>

			<ModalBody>
				<div className="space-y-4">
					<p className="text-gray-600 dark:text-gray-300">
						<strong>{folderName}</strong> contains{" "}
						<strong>{deletionStatus?.ideaCount || 0} ideas</strong>. What would
						you like to do with them?
					</p>

					{/* Show list of ideas */}
					{deletionStatus && deletionStatus.ideas.length > 0 && (
						<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
							<h4 className="mb-2 font-medium text-gray-900 text-sm dark:text-white">
								Ideas in this folder:
							</h4>
							<ul className="space-y-1 text-gray-600 text-sm dark:text-gray-400">
								{deletionStatus.ideas.slice(0, 5).map((idea) => (
									<li key={idea._id} className="flex items-center gap-2">
										<div className="h-1 w-1 rounded-full bg-gray-400" />
										{idea.title}
									</li>
								))}
								{deletionStatus.ideas.length > 5 && (
									<li className="text-gray-500 text-xs">
										... and {deletionStatus.ideas.length - 5} more
									</li>
								)}
							</ul>
						</div>
					)}

					{/* Action options */}
					<div className="space-y-3">
						<button
							type="button"
							className={`w-full cursor-pointer rounded-lg border-2 p-4 text-left transition-all ${
								selectedAction === "moveToRoot"
									? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
							}`}
							onClick={() => setSelectedAction("moveToRoot")}
						>
							<div className="flex items-start gap-3">
								<div className="mt-1 flex-shrink-0">
									<MoveRight className="h-5 w-5 text-blue-500" />
								</div>
								<div>
									<h3 className="font-medium text-gray-900 dark:text-white">
										Move ideas to root folder
									</h3>
									<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
										Keep all ideas but move them out of this folder to the main
										ideas list. This is the safest option.
									</p>
								</div>
							</div>
						</button>

						<button
							type="button"
							className={`w-full cursor-pointer rounded-lg border-2 p-4 text-left transition-all ${
								selectedAction === "deleteAll"
									? "border-red-500 bg-red-50 dark:bg-red-900/20"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
							}`}
							onClick={() => setSelectedAction("deleteAll")}
						>
							<div className="flex items-start gap-3">
								<div className="mt-1 flex-shrink-0">
									<Trash2 className="h-5 w-5 text-red-500" />
								</div>
								<div>
									<h3 className="font-medium text-gray-900 dark:text-white">
										Delete folder and all ideas
									</h3>
									<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
										Permanently delete this folder and all ideas inside it. This
										cannot be undone.
									</p>
								</div>
							</div>
						</button>
					</div>
				</div>
			</ModalBody>

			<ModalFooter>
				<div className="flex w-full items-center justify-between">
					<div className="text-gray-500 text-sm">
						{selectedAction === "deleteAll" && (
							<span className="text-red-600">⚠️ This action is permanent</span>
						)}
					</div>
					<div className="flex gap-2">
						<Button color="gray" onClick={handleClose} disabled={isDeleting}>
							Cancel
						</Button>
						<Button
							color={selectedAction === "deleteAll" ? "failure" : "blue"}
							onClick={handleConfirmDelete}
							disabled={!selectedAction || isDeleting}
						>
							{selectedAction === "moveToRoot" && (
								<MoveRight className="mr-2 h-4 w-4" />
							)}
							{selectedAction === "deleteAll" && (
								<Trash2 className="mr-2 h-4 w-4" />
							)}
							{isDeleting
								? "Processing..."
								: selectedAction === "moveToRoot"
									? "Move Ideas & Delete Folder"
									: selectedAction === "deleteAll"
										? "Delete All"
										: "Select an option"}
						</Button>
					</div>
				</div>
			</ModalFooter>
		</Modal>
	);
}
