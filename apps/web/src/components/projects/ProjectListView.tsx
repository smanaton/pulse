import type { ColumnDef } from "@tanstack/react-table";
import {
	Badge,
	Button,
	Dropdown,
	Label,
	Modal,
	Select,
	Textarea,
	TextInput,
} from "flowbite-react";
import {
	Calendar,
	Clock,
	Download,
	MoreHorizontal,
	Plus,
	Search,
	Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useWorkspaceContext } from "../../contexts/workspace-context";
import {
	type CreateProjectArgs,
	type Project,
	type UpdateProjectArgs,
	useProjects,
} from "../../hooks/use-projects";
import { DataTable } from "../ui/data-table";
import { ProjectGridView } from "./ProjectGridView";

interface ProjectListViewProps {
	onProjectClick?: (project: Project) => void;
	selectedProject?: Project | null;
	viewMode?: "table" | "grid";
}

export function ProjectListView({
	onProjectClick,
	selectedProject,
	viewMode = "table",
}: ProjectListViewProps) {
	const { currentWorkspace } = useWorkspaceContext();
	const { projects, isLoading, createProject, updateProject, deleteProject } =
		useProjects(currentWorkspace?._id);

	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Filter projects based on status and search
	const filteredProjects = useMemo(() => {
		if (!projects) return [];

		let filtered = projects;

		// Filter by status
		if (statusFilter !== "all") {
			filtered = filtered.filter((project) => project.status === statusFilter);
		}

		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(project) =>
					project.name.toLowerCase().includes(query) ||
					project.description?.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [projects, statusFilter, searchQuery]);

	// Function definitions (moved here to avoid hoisting issues)
	const handleCreateProject = () => {
		setCreateModalOpen(true);
	};

	const handleEditProject = (project: Project) => {
		setEditingProject(project);
		setEditModalOpen(true);
	};

	const handleDeleteProject = async (project: Project) => {
		if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
			try {
				await deleteProject({ projectId: project._id });
			} catch (error) {
				console.error("Failed to delete project:", error);
			}
		}
	};

	// Column definitions for the data table
	const columns = useMemo<ColumnDef<Project>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Project Name",
				cell: ({ row }) => {
					const project = row.original;
					return (
						<div className="flex items-center space-x-3">
							{project.color && (
								<div
									className="h-3 w-3 flex-shrink-0 rounded-full"
									style={{ backgroundColor: project.color }}
								/>
							)}
							<div>
								<div className="font-medium text-gray-900 dark:text-white">
									{project.name}
								</div>
								{project.description && (
									<div className="max-w-md truncate text-gray-500 text-sm dark:text-gray-400">
										{project.description}
									</div>
								)}
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => {
					const status = row.original.status;
					const statusColors = {
						active: "green",
						on_hold: "yellow",
						completed: "blue",
						archived: "gray",
					} as const;

					const statusLabels = {
						active: "Active",
						on_hold: "On Hold",
						completed: "Completed",
						archived: "Archived",
					} as const;

					return (
						<Badge color={statusColors[status] || "gray"} size="sm">
							{statusLabels[status] || status}
						</Badge>
					);
				},
			},
			{
				accessorKey: "priority",
				header: "Priority",
				cell: ({ row }) => {
					const priority = row.original.priority;
					if (!priority) return null;

					const priorityColors = {
						low: "green",
						medium: "blue",
						high: "yellow",
						urgent: "red",
					} as const;

					return (
						<Badge color={priorityColors[priority] || "gray"} size="sm">
							{priority.charAt(0).toUpperCase() + priority.slice(1)}
						</Badge>
					);
				},
			},
			{
				accessorKey: "progress",
				header: "Progress",
				cell: ({ row }) => {
					const progress = row.original.progress || 0;
					const progressColor =
						progress >= 100
							? "bg-green-600"
							: progress >= 75
								? "bg-blue-600"
								: progress >= 50
									? "bg-yellow-500"
									: progress >= 25
										? "bg-orange-500"
										: "bg-red-500";

					return (
						<div className="flex items-center space-x-2">
							<div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									className={`${progressColor} h-2 rounded-full transition-all duration-300`}
									style={{ width: `${Math.min(progress, 100)}%` }}
								/>
							</div>
							<span
								className={`min-w-max font-medium text-sm ${
									progress >= 75
										? "text-green-600 dark:text-green-400"
										: progress >= 50
											? "text-blue-600 dark:text-blue-400"
											: progress >= 25
												? "text-yellow-600 dark:text-yellow-400"
												: "text-gray-500 dark:text-gray-400"
								}`}
							>
								{progress}%
							</span>
						</div>
					);
				},
			},
			{
				accessorKey: "team",
				header: "Team",
				cell: ({ row }) => {
					// TODO: This would come from project members data
					// For now, showing mock avatars based on project owner
					const mockTeamSize = Math.floor(Math.random() * 5) + 1;
					const avatarColors = [
						"bg-blue-500",
						"bg-green-500",
						"bg-purple-500",
						"bg-red-500",
						"bg-yellow-500",
					];

					return (
						<div className="flex items-center space-x-1">
							{[...Array(Math.min(mockTeamSize, 3))].map((_, index) => (
								<div
									key={index}
									className={`h-6 w-6 rounded-full ${avatarColors[index % avatarColors.length]} -ml-1 flex items-center justify-center border-2 border-white font-medium text-white text-xs first:ml-0 dark:border-gray-800`}
								>
									{String.fromCharCode(65 + index)}
								</div>
							))}
							{mockTeamSize > 3 && (
								<div className="-ml-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 font-medium text-gray-600 text-xs dark:border-gray-800 dark:bg-gray-600 dark:text-gray-300">
									+{mockTeamSize - 3}
								</div>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "timeTracking",
				header: "Time Tracking",
				cell: ({ row }) => {
					const project = row.original;
					if (!project.estimatedHours && !project.actualHours) return null;

					const estimated = project.estimatedHours || 0;
					const actual = project.actualHours || 0;
					const isOverBudget = actual > estimated && estimated > 0;

					return (
						<div className="space-y-1 text-sm">
							<div
								className={`flex items-center space-x-1 ${
									isOverBudget
										? "text-red-600 dark:text-red-400"
										: "text-gray-600 dark:text-gray-400"
								}`}
							>
								<Clock className="h-3 w-3" />
								<span>
									{actual}h / {estimated}h
								</span>
							</div>
							{estimated > 0 && (
								<div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										className={`h-1.5 rounded-full ${
											isOverBudget
												? "bg-red-500"
												: actual / estimated > 0.8
													? "bg-yellow-500"
													: "bg-green-500"
										}`}
										style={{
											width: `${Math.min((actual / estimated) * 100, 100)}%`,
										}}
									/>
								</div>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "dueDate",
				header: "Due Date",
				cell: ({ row }) => {
					const project = row.original;
					if (!project.endDate) return null;

					const endDate = new Date(project.endDate);
					const now = new Date();
					const diffTime = endDate.getTime() - now.getTime();
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

					const isOverdue = diffDays < 0;
					const isDueSoon = diffDays <= 7 && diffDays >= 0;

					return (
						<div className="text-sm">
							<div
								className={`flex items-center space-x-1 ${
									isOverdue
										? "text-red-600 dark:text-red-400"
										: isDueSoon
											? "text-orange-600 dark:text-orange-400"
											: "text-gray-600 dark:text-gray-400"
								}`}
							>
								<Calendar className="h-3 w-3" />
								<span>{endDate.toLocaleDateString()}</span>
							</div>
							{(isOverdue || isDueSoon) && (
								<div
									className={`text-xs ${
										isOverdue ? "text-red-500" : "text-orange-500"
									}`}
								>
									{isOverdue
										? `${Math.abs(diffDays)} days overdue`
										: diffDays === 0
											? "Due today"
											: diffDays === 1
												? "Due tomorrow"
												: `${diffDays} days left`}
								</div>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "tags",
				header: "Tags",
				cell: ({ row }) => {
					const tags = row.original.tags;
					if (!tags || tags.length === 0) return null;

					return (
						<div className="flex flex-wrap gap-1">
							{tags.slice(0, 2).map((tag, index) => (
								<Badge key={index} color="gray" size="xs">
									{tag}
								</Badge>
							))}
							{tags.length > 2 && (
								<Badge color="gray" size="xs">
									+{tags.length - 2}
								</Badge>
							)}
						</div>
					);
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => {
					const project = row.original;
					return (
						<Dropdown
							arrowIcon={false}
							placement="left-start"
							label=""
							renderTrigger={() => (
								<Button size="sm" color="gray" className="p-2">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							)}
						>
							<ul className="py-2 text-gray-700 text-sm dark:text-gray-200">
								<li>
									<button
										onClick={() => onProjectClick?.(project)}
										className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
									>
										<Target className="mr-2 h-4 w-4" />
										View Project
									</button>
								</li>
								<li>
									<button
										onClick={() => handleEditProject(project)}
										className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
									>
										Edit Project
									</button>
								</li>
								<li className="border-gray-100 border-t dark:border-gray-600">
									<button
										onClick={() => handleDeleteProject(project)}
										className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
									>
										Delete Project
									</button>
								</li>
							</ul>
						</Dropdown>
					);
				},
			},
		],
		[onProjectClick, handleDeleteProject, handleEditProject],
	);

	const handleSubmitCreate = async (formData: FormData) => {
		if (!currentWorkspace) return;

		try {
			const args: CreateProjectArgs = {
				workspaceId: currentWorkspace._id,
				name: formData.get("name") as string,
				description: (formData.get("description") as string) || undefined,
				priority: (formData.get("priority") as any) || "medium",
				color: (formData.get("color") as string) || undefined,
				estimatedHours: Number(formData.get("estimatedHours")) || undefined,
				tags:
					(formData.get("tags") as string)
						?.split(",")
						.map((t) => t.trim())
						.filter(Boolean) || [],
			};

			await createProject(args);
			setCreateModalOpen(false);
		} catch (error) {
			console.error("Failed to create project:", error);
		}
	};

	const handleSubmitEdit = async (formData: FormData) => {
		if (!editingProject) return;

		try {
			const args: UpdateProjectArgs = {
				projectId: editingProject._id,
				name: formData.get("name") as string,
				description: (formData.get("description") as string) || undefined,
				status: formData.get("status") as any,
				priority: (formData.get("priority") as any) || "medium",
				color: (formData.get("color") as string) || undefined,
				estimatedHours: Number(formData.get("estimatedHours")) || undefined,
				progress: Number(formData.get("progress")) || undefined,
				tags:
					(formData.get("tags") as string)
						?.split(",")
						.map((t) => t.trim())
						.filter(Boolean) || [],
			};

			await updateProject(args);
			setEditModalOpen(false);
			setEditingProject(null);
		} catch (error) {
			console.error("Failed to update project:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-2xl text-gray-900 dark:text-white">
						Projects
					</h2>
					<Button onClick={handleCreateProject}>
						<Plus className="mr-2 h-4 w-4" />
						New Project
					</Button>
				</div>
				<div className="flex h-64 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-primary-600 border-b-2" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Simple Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative max-w-md flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
					<TextInput
						type="search"
						placeholder="Search projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<option value="all">All Status</option>
						<option value="active">Active</option>
						<option value="on_hold">On Hold</option>
						<option value="completed">Completed</option>
						<option value="archived">Archived</option>
					</Select>
					<Button color="gray" outline>
						<Download className="mr-2 h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			{/* Projects View */}
			{viewMode === "table" ? (
				<div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
					<DataTable
						columns={columns}
						data={filteredProjects}
						onRowClick={onProjectClick}
					/>
				</div>
			) : (
				<ProjectGridView
					projects={filteredProjects}
					onProjectClick={onProjectClick}
					isLoading={isLoading}
				/>
			)}

			{/* Create Project Modal */}
			<Modal
				show={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				size="md"
			>
				<div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
					<h3 className="font-semibold text-gray-900 text-xl dark:text-white">
						Create New Project
					</h3>
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmitCreate(new FormData(e.currentTarget));
					}}
				>
					<div className="space-y-6 p-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">Project Name *</Label>
								<TextInput
									id="name"
									name="name"
									required
									placeholder="Enter project name"
								/>
							</div>
							<div>
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									name="description"
									placeholder="Enter project description"
									rows={3}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="priority">Priority</Label>
									<Select id="priority" name="priority" defaultValue="medium">
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="urgent">Urgent</option>
									</Select>
								</div>
								<div>
									<Label htmlFor="color">Color</Label>
									<TextInput
										id="color"
										name="color"
										type="color"
										defaultValue="#3b82f6"
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="estimatedHours">Estimated Hours</Label>
								<TextInput
									id="estimatedHours"
									name="estimatedHours"
									type="number"
									placeholder="e.g. 40"
								/>
							</div>
							<div>
								<Label htmlFor="tags">Tags (comma-separated)</Label>
								<TextInput
									id="tags"
									name="tags"
									placeholder="e.g. web, frontend, design"
								/>
							</div>
						</div>
					</div>
					<div className="flex items-center space-x-2 rounded-b border-gray-200 border-t p-6 dark:border-gray-600">
						<Button type="submit">Create Project</Button>
						<Button color="gray" onClick={() => setCreateModalOpen(false)}>
							Cancel
						</Button>
					</div>
				</form>
			</Modal>

			{/* Edit Project Modal */}
			<Modal
				show={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				size="md"
			>
				<div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
					<h3 className="font-semibold text-gray-900 text-xl dark:text-white">
						Edit Project
					</h3>
				</div>
				{editingProject && (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmitEdit(new FormData(e.currentTarget));
						}}
					>
						<div className="space-y-6 p-6">
							<div className="space-y-4">
								<div>
									<Label htmlFor="edit-name">Project Name *</Label>
									<TextInput
										id="edit-name"
										name="name"
										required
										defaultValue={editingProject.name}
										placeholder="Enter project name"
									/>
								</div>
								<div>
									<Label htmlFor="edit-description">Description</Label>
									<Textarea
										id="edit-description"
										name="description"
										defaultValue={editingProject.description || ""}
										placeholder="Enter project description"
										rows={3}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="edit-status">Status</Label>
										<Select
											id="edit-status"
											name="status"
											defaultValue={editingProject.status}
										>
											<option value="active">Active</option>
											<option value="on_hold">On Hold</option>
											<option value="completed">Completed</option>
											<option value="archived">Archived</option>
										</Select>
									</div>
									<div>
										<Label htmlFor="edit-priority">Priority</Label>
										<Select
											id="edit-priority"
											name="priority"
											defaultValue={editingProject.priority || "medium"}
										>
											<option value="low">Low</option>
											<option value="medium">Medium</option>
											<option value="high">High</option>
											<option value="urgent">Urgent</option>
										</Select>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="edit-color">Color</Label>
										<TextInput
											id="edit-color"
											name="color"
											type="color"
											defaultValue={editingProject.color || "#3b82f6"}
										/>
									</div>
									<div>
										<Label htmlFor="edit-progress">Progress (%)</Label>
										<TextInput
											id="edit-progress"
											name="progress"
											type="number"
											min="0"
											max="100"
											defaultValue={editingProject.progress || 0}
										/>
									</div>
								</div>
								<div>
									<Label htmlFor="edit-estimatedHours">Estimated Hours</Label>
									<TextInput
										id="edit-estimatedHours"
										name="estimatedHours"
										type="number"
										defaultValue={editingProject.estimatedHours || ""}
										placeholder="e.g. 40"
									/>
								</div>
								<div>
									<Label htmlFor="edit-tags">Tags (comma-separated)</Label>
									<TextInput
										id="edit-tags"
										name="tags"
										defaultValue={editingProject.tags?.join(", ") || ""}
										placeholder="e.g. web, frontend, design"
									/>
								</div>
							</div>
						</div>
						<div className="flex items-center space-x-2 rounded-b border-gray-200 border-t p-6 dark:border-gray-600">
							<Button type="submit">Update Project</Button>
							<Button color="gray" onClick={() => setEditModalOpen(false)}>
								Cancel
							</Button>
						</div>
					</form>
				)}
			</Modal>
		</div>
	);
}
