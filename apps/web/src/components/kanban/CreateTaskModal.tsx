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
import { Plus, X } from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import type { CreateKanbanTaskInput } from "../../types/kanban";

interface CreateTaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	boardId: string;
	onSubmit: (task: CreateKanbanTaskInput) => void;
}

export function CreateTaskModal({
	isOpen,
	onClose,
	boardId,
	onSubmit,
}: CreateTaskModalProps) {
	const [formData, setFormData] = useState<CreateKanbanTaskInput>({
		name: "",
		description: "",
		boardId,
		priority: "medium",
		tags: [],
		assignedTo: [],
	});

	const [tagInput, setTagInput] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const taskNameId = useId();
	const descriptionId = useId();
	const priorityId = useId();
	const dueDateId = useId();
	const estimatedHoursId = useId();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(formData);
			// Reset form
			setFormData({
				name: "",
				description: "",
				boardId,
				priority: "medium",
				tags: [],
				assignedTo: [],
			});
			setTagInput("");
		} finally {
			setIsSubmitting(false);
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

	return (
		<Modal show={isOpen} onClose={onClose} size="md">
			<ModalHeader>Create New Task</ModalHeader>
			<form onSubmit={handleSubmit}>
				<ModalBody className="space-y-4">
					{/* Task Name */}
					<div>
						<Label htmlFor="taskName" className="mb-2 block">
							Task Name *
						</Label>
						<TextInput
							id={taskNameId}
							value={formData.name}
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
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Describe the task..."
							rows={3}
						/>
					</div>

					{/* Priority */}
					<div>
						<Label htmlFor="priority" className="mb-2 block">
							Priority
						</Label>
						<Select
							id={priorityId}
							value={formData.priority}
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

					{/* Due Date */}
					<div>
						<Label htmlFor="dueDate" className="mb-2 block">
							Due Date
						</Label>
						<input
							type="date"
							id={dueDateId}
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

					{/* Estimated Hours */}
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
									<Plus className="h-4 w-4" />
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
				</ModalBody>

				<ModalFooter>
					<div className="flex gap-2">
						<Button
							type="submit"
							disabled={!formData.name.trim() || isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create Task"}
						</Button>
						<Button color="gray" onClick={onClose}>
							Cancel
						</Button>
					</div>
				</ModalFooter>
			</form>
		</Modal>
	);
}
