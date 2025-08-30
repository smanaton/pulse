import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Button,
	Dropdown,
	DropdownItem,
	Sidebar,
	SidebarItem,
	SidebarItemGroup,
	SidebarItems,
	TextInput,
} from "flowbite-react";
import { useState } from "react";
import {
	HiDocument,
	HiDotsHorizontal,
	HiDotsVertical,
	HiFolder,
	HiFolderOpen,
	HiPencil,
	HiPlus,
	HiSearch,
	HiTrash,
	HiX,
} from "react-icons/hi";
import { toast } from "sonner";

interface IdeasSecondarySidebarProps {
	workspaceId: Id<"workspaces">;
	selectedIdeaId: Id<"ideas"> | null;
	onSelectIdea: (ideaId: Id<"ideas"> | null) => void;
}

export function IdeasSecondarySidebar({
	workspaceId,
	selectedIdeaId,
	onSelectIdea,
}: IdeasSecondarySidebarProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
	const [renameFolderValue, setRenameFolderValue] = useState("");

	// Get ideas and folders
	const ideas = useQuery(api.ideas.list, { workspaceId, limit: 100 }) || [];
	const folders = useQuery(api.folders.list, { workspaceId }) || [];

	// Mutations
	const createIdea = useMutation(api.ideas.create);
	const createFolder = useMutation(api.folders.create);
	const updateFolder = useMutation(api.folders.update);
	const deleteFolder = useMutation(api.folders.remove);

	// Filter ideas based on search
	const filteredIdeas = ideas.filter((idea) =>
		idea.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Group ideas by folder (placeholder until folders are implemented)
	const rootIdeas = filteredIdeas.filter((idea) => !idea.folderId);
	const archivedIdeas = filteredIdeas.filter(
		(idea) => idea.status === "archived",
	);

	// Create new idea
	const handleCreateIdea = async (folderId?: Id<"folders">) => {
		try {
			const newIdea = await createIdea({
				workspaceId,
				folderId,
				title: "Untitled Idea",
				contentMD: "",
			});
			onSelectIdea(newIdea);
			toast.success("New idea created!");
		} catch (error) {
			console.error("Failed to create idea:", error);
			toast.error("Failed to create idea");
		}
	};

	// Create new folder
	const handleCreateFolder = async () => {
		const folderName = newFolderName.trim() || "New Folder";

		try {
			await createFolder({
				workspaceId,
				name: folderName,
			});
			setNewFolderName("");
			setIsCreatingFolder(false);
			toast.success("Folder created!");
		} catch (error) {
			console.error("Failed to create folder:", error);
			toast.error("Failed to create folder");
		}
	};

	// Toggle folder expansion
	const toggleFolder = (folderId: string) => {
		const newExpanded = new Set(expandedFolders);
		if (newExpanded.has(folderId)) {
			newExpanded.delete(folderId);
		} else {
			newExpanded.add(folderId);
		}
		setExpandedFolders(newExpanded);
	};

	// Handle folder rename
	const handleRenameFolder = async (folderId: string) => {
		if (!renameFolderValue.trim()) {
			setRenamingFolder(null);
			setRenameFolderValue("");
			return;
		}

		try {
			await updateFolder({
				folderId: folderId as Id<"folders">,
				name: renameFolderValue.trim(),
			});
			setRenamingFolder(null);
			setRenameFolderValue("");
			toast.success("Folder renamed!");
		} catch (error) {
			console.error("Failed to rename folder:", error);
			toast.error("Failed to rename folder");
		}
	};

	// Handle folder delete
	const handleDeleteFolder = async (folderId: string) => {
		if (
			confirm(
				"Are you sure you want to delete this folder? All notes inside will be moved to the root.",
			)
		) {
			try {
				await deleteFolder({
					folderId: folderId as Id<"folders">,
				});
				toast.success("Folder deleted!");
			} catch (error) {
				console.error("Failed to delete folder:", error);
				toast.error("Failed to delete folder");
			}
		}
	};

	// Start renaming a folder
	const startRenameFolder = (folder: any) => {
		setRenamingFolder(folder._id);
		setRenameFolderValue(folder.name);
	};

	return (
		<Sidebar className="h-full overflow-hidden border-r-0">
			<div className="flex h-full flex-col overflow-hidden">
				{/* Header with Toolbar */}
				<div className="border-gray-200 border-b p-4 dark:border-gray-700">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
							Notes
						</h2>

						{/* Toolbar */}
						<div className="flex items-center gap-2">
							<Dropdown
								label=""
								dismissOnClick={false}
								renderTrigger={() => (
									<Button size="xs" color="gray" outline>
										<HiPlus className="h-4 w-4" />
									</Button>
								)}
							>
								<DropdownItem onClick={() => handleCreateIdea()}>
									<HiDocument className="mr-2 h-4 w-4" />
									New Note
								</DropdownItem>
								<DropdownItem onClick={() => setIsCreatingFolder(true)}>
									<HiFolder className="mr-2 h-4 w-4" />
									New Folder
								</DropdownItem>
							</Dropdown>

							<Button size="xs" color="gray" outline>
								<HiDotsVertical className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Search */}
					<div className="mb-4">
						<TextInput
							icon={HiSearch}
							placeholder="Search notes..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							sizing="sm"
						/>
					</div>
				</div>

				{/* Navigation */}
				<div className="flex-1 overflow-y-auto">
					<SidebarItems>
						{/* New Folder Creation */}
						{isCreatingFolder && (
							<SidebarItemGroup>
								<div className="mx-2 mb-2 flex items-center rounded-md border border-blue-300 bg-blue-50 px-3 py-2 dark:border-blue-700 dark:bg-blue-900/20">
									<HiFolder className="mr-2 h-4 w-4 text-blue-500" />
									<TextInput
										value={newFolderName}
										onChange={(e) => setNewFolderName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleCreateFolder();
											if (e.key === "Escape") {
												setIsCreatingFolder(false);
												setNewFolderName("");
											}
										}}
										onBlur={handleCreateFolder}
										placeholder="Folder name (default: New Folder)"
										sizing="sm"
										className="flex-1"
										autoFocus
									/>
								</div>
							</SidebarItemGroup>
						)}

						{/* Folders */}
						{folders.map((folder) => (
							<SidebarItemGroup key={folder._id}>
								{/* Folder Header */}
								<div className="group">
									{renamingFolder === folder._id ? (
										/* Folder Rename Input */
										<div className="mx-2 mb-1 flex items-center px-3 py-2">
											<HiFolder className="mr-2 h-4 w-4 text-gray-500" />
											<TextInput
												value={renameFolderValue}
												onChange={(e) => setRenameFolderValue(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleRenameFolder(folder._id);
													if (e.key === "Escape") {
														setRenamingFolder(null);
														setRenameFolderValue("");
													}
												}}
												onBlur={() => handleRenameFolder(folder._id)}
												sizing="sm"
												className="flex-1"
												autoFocus
											/>
										</div>
									) : (
										<div className="flex items-center">
											<SidebarItem
												icon={
													expandedFolders.has(folder._id)
														? HiFolderOpen
														: HiFolder
												}
												className="flex-1 cursor-pointer font-medium"
												onClick={() => toggleFolder(folder._id)}
											>
												<span className="flex-1 text-left">{folder.name}</span>
											</SidebarItem>
											<div className="mr-2 opacity-0 group-hover:opacity-100">
												<Dropdown
													label=""
													dismissOnClick={false}
													renderTrigger={() => (
														<Button size="xs" color="gray" outline>
															<HiDotsVertical className="h-3 w-3" />
														</Button>
													)}
												>
													<DropdownItem
														onClick={() => handleCreateIdea(folder._id)}
													>
														<HiDocument className="mr-2 h-4 w-4" />
														Add Note
													</DropdownItem>
													<DropdownItem
														onClick={() => startRenameFolder(folder)}
													>
														<HiPencil className="mr-2 h-4 w-4" />
														Rename
													</DropdownItem>
													<DropdownItem
														onClick={() => handleDeleteFolder(folder._id)}
														className="text-red-600 hover:text-red-700"
													>
														<HiTrash className="mr-2 h-4 w-4" />
														Delete
													</DropdownItem>
												</Dropdown>
											</div>
										</div>
									)}
								</div>

								{/* Folder Contents (when expanded) */}
								{expandedFolders.has(folder._id) && (
									<>
										{/* Ideas in this folder */}
										{filteredIdeas
											.filter((idea) => idea.folderId === folder._id)
											.map((idea) => (
												<SidebarItem
													key={idea._id}
													icon={HiDocument}
													className={`ml-6 cursor-pointer ${
														selectedIdeaId === idea._id
															? "bg-gray-100 dark:bg-gray-700"
															: "hover:bg-gray-50 dark:hover:bg-gray-800"
													}`}
													onClick={() => onSelectIdea(idea._id)}
												>
													<span className="truncate">{idea.title}</span>
												</SidebarItem>
											))}

										{/* Add note to folder button */}
										<SidebarItem
											className="ml-6 cursor-pointer text-gray-500 hover:text-blue-500"
											onClick={() => handleCreateIdea(folder._id)}
										>
											<HiPlus className="mr-2 h-4 w-4" />
											<span className="text-sm">Add note</span>
										</SidebarItem>
									</>
								)}
							</SidebarItemGroup>
						))}

						{/* Root Ideas */}
						{rootIdeas.length > 0 && (
							<SidebarItemGroup>
								{rootIdeas.map((idea) => (
									<SidebarItem
										key={idea._id}
										icon={HiDocument}
										className={`cursor-pointer ${
											selectedIdeaId === idea._id
												? "bg-gray-100 dark:bg-gray-700"
												: "hover:bg-gray-50 dark:hover:bg-gray-800"
										}`}
										onClick={() => onSelectIdea(idea._id)}
									>
										<span className="truncate">{idea.title}</span>
									</SidebarItem>
								))}
							</SidebarItemGroup>
						)}

						{/* Archived Ideas */}
						{archivedIdeas.length > 0 && (
							<SidebarItemGroup className="mt-4">
								{/* Archived Header */}
								<SidebarItem
									icon={HiTrash}
									className="cursor-pointer font-medium"
									onClick={() => toggleFolder("archived")}
								>
									<span className="flex-1 text-left">{`Archived (${archivedIdeas.length})`}</span>
								</SidebarItem>

								{/* Archived Contents (when expanded) */}
								{expandedFolders.has("archived") && (
									<>
										{archivedIdeas.map((idea) => (
											<SidebarItem
												key={idea._id}
												icon={HiDocument}
												className={`ml-6 cursor-pointer ${
													selectedIdeaId === idea._id
														? "bg-gray-100 dark:bg-gray-700"
														: "hover:bg-gray-50 dark:hover:bg-gray-800"
												}`}
												onClick={() => onSelectIdea(idea._id)}
											>
												<span className="truncate text-gray-500 dark:text-gray-400">
													{idea.title}
												</span>
											</SidebarItem>
										))}
									</>
								)}
							</SidebarItemGroup>
						)}

						{/* Empty State */}
						{filteredIdeas.length === 0 && !searchQuery && (
							<div className="p-4 text-center text-gray-500 dark:text-gray-400">
								<HiDocument className="mx-auto mb-2 h-8 w-8" />
								<p className="text-sm">No notes yet</p>
								<p className="mt-1 text-xs">Click "New Note" to get started</p>
							</div>
						)}

						{/* No Search Results */}
						{filteredIdeas.length === 0 && searchQuery && (
							<div className="p-4 text-center text-gray-500 dark:text-gray-400">
								<HiSearch className="mx-auto mb-2 h-8 w-8" />
								<p className="text-sm">No notes found</p>
								<p className="mt-1 text-xs">Try a different search term</p>
							</div>
						)}
					</SidebarItems>
				</div>
			</div>
		</Sidebar>
	);
}
