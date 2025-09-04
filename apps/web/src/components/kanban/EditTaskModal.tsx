import {
	Button,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Select,
	Textarea,
	TextInput,
} from "flowbite-react";
import { Save, Trash2, X } from "lucide-react";
import type React from "react";
import { useEffect, useId, useState } from "react";
import type { KanbanTask, UpdateKanbanTaskInput } from "../../types/kanban";

interface EditTaskModalProps {
	isOpen: boolean;
	task: KanbanTask;
	onClose: () => void;
	onSubmit: (updates: UpdateKanbanTaskInput) => void;
	onDelete: () => void;
}

export function EditTaskModal({
	isOpen,
	task,
	onClose,
	onSubmit,
	onDelete,
}: EditTaskModalProps) {
	const [formData, setFormData] = useState<UpdateKanbanTaskInput>({
		id: task.id,
		name: task.name,
		description: task.description,
		priority: task.priority,
		status: task.status,
		dueDate: task.dueDate,
		estimatedHours: task.estimatedHours,
		actualHours: task.actualHours,
		tags: task.tags || [],
		assignedTo: task.assignedTo || [],
	});

	const [tagInput, setTagInput] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const taskNameId = useId();
	const descriptionId = useId();
	const priorityId = useId();
	const statusId = useId();
	const dueDateId = useId();
	const estimatedHoursId = useId();
	const actualHoursId = useId();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Update form data when task changes
	useEffect(() => {
		setFormData({
			id: task.id,
			name: task.name,
			description: task.description,
			priority: task.priority,
			status: task.status,
			dueDate: task.dueDate,
			estimatedHours: task.estimatedHours,
			actualHours: task.actualHours,
			tags: task.tags || [],
			assignedTo: task.assignedTo || [],
		});
	}, [task]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name?.trim()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(formData);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (showDeleteConfirm) {
			await onDelete();
		} else {
			setShowDeleteConfirm(true);
			// Auto hide delete confirmation after 3 seconds
			setTimeout(() => setShowDeleteConfirm(false), 3000);
		}
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...(prev.tags || []), tagInput.trim()],
			}));
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
		}));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (
			e.key === "Enter" &&
			e.target === document.querySelector('input[placeholder="Add tag..."]')
		) {
			e.preventDefault();
			handleAddTag();
		}
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "";
		return new Date(timestamp).toISOString().split("T")[0];
	};

	return (
		<Modal show={isOpen} onClose={onClose} size="lg">
			<ModalHeader>Edit Task</ModalHeader>
			<form onSubmit={handleSubmit}>
				<ModalBody className="space-y-4">
					{/* Task Name */}
					<div>
						<Label htmlFor="taskName" className="mb-2 block">
							Task Name *
						</Label>
						<TextInput
							id={taskNameId}
							value={formData.name || ""}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="Enter task name..."
							required
						/>
					</div>

					{/* Description */}
					<div>
						<Label htmlFor="description" className="mb-2 block">
							Description
						</Label>
						<Textarea
							id={descriptionId}
							value={formData.description || ""}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Describe the task..."
							rows={4}
						/>
					</div>

					{/* Priority and Status */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="priority" className="mb-2 block">
								Priority
							</Label>
							<Select
								id={priorityId}
								value={formData.priority || "medium"}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										priority: e.target.value as
											| "low"
											| "medium"
											| "high"
											| "urgent",
									}))
								}
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="urgent">Urgent</option>
							</Select>
						</div>

						<div>
							<Label htmlFor="status" className="mb-2 block">
								Status
							</Label>
							<Select
								id={statusId}
								value={formData.status || "todo"}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										status: e.target.value as
											| "todo"
											| "in_progress"
											| "done"
											| "archived",
									}))
								}
							>
								<option value="todo">To Do</option>
								<option value="in_progress">In Progress</option>
								<option value="done">Done</option>
								<option value="archived">Archived</option>
							</Select>
						</div>
					</div>

					{/* Due Date */}
					<div>
						<Label htmlFor="dueDate" className="mb-2 block">
							Due Date
						</Label>
						<input
							type="date"
							id={dueDateId}
							value={formatDate(formData.dueDate)}
							className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									dueDate: e.target.value
										? new Date(e.target.value).getTime()
										: undefined,
								}))
							}
						/>
					</div>

					{/* Time Tracking */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="estimatedHours" className="mb-2 block">
								Estimated Hours
							</Label>
							<TextInput
								id={estimatedHoursId}
								type="number"
								min="0"
								step="0.5"
								value={formData.estimatedHours || ""}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										estimatedHours: e.target.value
											? Number.parseFloat(e.target.value)
											: undefined,
									}))
								}
								placeholder="0"
							/>
						</div>

						<div>
							<Label htmlFor="actualHours" className="mb-2 block">
								Actual Hours
							</Label>
							<TextInput
								id={actualHoursId}
								type="number"
								min="0"
								step="0.5"
								value={formData.actualHours || ""}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										actualHours: e.target.value
											? Number.parseFloat(e.target.value)
											: undefined,
									}))
								}
								placeholder="0"
							/>
						</div>
					</div>

					{/* Tags */}
					<div>
						<Label className="mb-2 block">Tags</Label>
						<div className="space-y-2">
							<div className="flex gap-2">
								<TextInput
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Add tag..."
									className="flex-1"
								/>
								<Button
									type="button"
									size="sm"
									onClick={handleAddTag}
									disabled={!tagInput.trim()}
								>
									Add
								</Button>
							</div>

							{formData.tags && formData.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.tags.map((tag) => (
										<span
											key={tag}
											className="inline-flex items-center gap-1 rounded bg-primary-100 px-2 py-1 font-medium text-primary-800 text-xs dark:bg-primary-900 dark:text-primary-300"
										>
											{tag}
											<button
												type="button"
												onClick={() => handleRemoveTag(tag)}
												className="hover:text-primary-600 dark:hover:text-primary-400"
											>
												<X className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Task Metadata */}
					<div className="border-gray-200 border-t pt-4 dark:border-gray-600">
						<div className="space-y-1 text-gray-500 text-sm dark:text-gray-400">
							<p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
							<p>Updated: {new Date(task.updatedAt).toLocaleDateString()}</p>
						</div>
					</div>
				</ModalBody>

				<ModalFooter>
					<div className="flex w-full justify-between">
						<Button
							color="failure"
							onClick={handleDelete}
							type="button"
							className={showDeleteConfirm ? "animate-pulse" : ""}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{showDeleteConfirm ? "Confirm Delete" : "Delete"}
						</Button>

						<div className="flex gap-2">
							<Button
								type="submit"
								disabled={!formData.name?.trim() || isSubmitting}
							>
								<Save className="mr-2 h-4 w-4" />
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
							<Button color="gray" onClick={onClose} type="button">
								Cancel
							</Button>
						</div>
					</div>
				</ModalFooter>
			</form>
		</Modal>
	);
}
