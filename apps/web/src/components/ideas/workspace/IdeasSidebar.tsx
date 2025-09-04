import { api } from "@pulse/backend";
import type { Doc, Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Button } from "flowbite-react";
import {
	FileText,
	Folder,
	FolderOpen,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface IdeasSidebarProps {
	workspaceId: Id<"workspaces">;
	selectedIdeaId: Id<"ideas"> | null;
	onSelectIdea: (ideaId: Id<"ideas">) => void;
}

export function IdeasSidebar({
	workspaceId,
	selectedIdeaId,
	onSelectIdea,
}: IdeasSidebarProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");

	// Get folders and ideas
	const folders = [] as Doc<"folders">[]; // TODO: Implement folders.list query
	const ideas =
		useQuery(api.ideas.list, { workspaceId, limit: 100 }) ??
		([] as Doc<"ideas">[]);

	// TODO: Implement createFolder mutation when folders API is ready
	const createIdea = useMutation(api.ideas.create);

	// Filter ideas based on search
	const filteredIdeas = ideas.filter((idea) =>
		idea.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Group ideas by folder
	const ideasByFolder = filteredIdeas.reduce(
		(acc, idea) => {
			const folderId = idea.folderId || "root";
			if (!acc[folderId]) acc[folderId] = [];
			acc[folderId].push(idea);
			return acc;
		},
		{} as Record<string, Doc<"ideas">[]>,
	);

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

	// Create new folder
	const handleCreateFolder = async () => {
		if (!newFolderName.trim()) return;

		try {
			// TODO: Implement when folders API is ready
			setNewFolderName("");
			setIsCreatingFolder(false);
		} catch (error) {
			console.error("Failed to create folder:", error);
		}
	};

	// Create new idea
	const handleCreateIdea = async (folderId?: Id<"folders">) => {
		try {
			const newIdea = await createIdea({
				workspaceId,
				folderId,
				title: "Untitled",
				contentMD: "",
			});
			onSelectIdea(newIdea);
		} catch (error) {
			console.error("Failed to create idea:", error);
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-gray-200 border-b p-4 dark:border-gray-700">
				<h2 className="mb-3 font-semibold text-gray-900 dark:text-white">
					Ideas
				</h2>

				{/* Search */}
				<div className="relative mb-3">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
					<Input
						placeholder="Search ideas..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="h-8 pl-10 text-sm"
					/>
				</div>

				{/* New Page Button */}
				<Button
					color="gray"
					size="sm"
					onClick={() => handleCreateIdea()}
					className="w-full justify-start text-left"
				>
					<Plus className="mr-2 h-4 w-4" />
					New page
				</Button>
			</div>

			{/* Document Tree */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-2">
					{/* Root level ideas */}
					{ideasByFolder.root?.map((idea: Doc<"ideas">) => (
						<IdeaItem
							key={idea._id}
							idea={idea}
							isSelected={selectedIdeaId === idea._id}
							onSelect={onSelectIdea}
							depth={0}
						/>
					))}

					{/* Folders */}
					{folders.map((folder) => (
						<FolderItem
							key={folder._id}
							folder={folder}
							isExpanded={expandedFolders.has(folder._id)}
							onToggle={() => toggleFolder(folder._id)}
							ideas={ideasByFolder[folder._id] || []}
							selectedIdeaId={selectedIdeaId}
							onSelectIdea={onSelectIdea}
							onCreateIdea={() => handleCreateIdea(folder._id)}
							depth={0}
						/>
					))}

					{/* Add Folder */}
					{isCreatingFolder ? (
						<div className="ml-2 flex items-center px-2 py-1">
							<Folder className="mr-2 h-4 w-4 text-gray-400" />
							<Input
								value={newFolderName}
								onChange={(e) => setNewFolderName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleCreateFolder();
									if (e.key === "Escape") setIsCreatingFolder(false);
								}}
								onBlur={handleCreateFolder}
								autoFocus
								className="h-6 flex-1 text-sm"
							/>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setIsCreatingFolder(true)}
							className="ml-2 flex items-center px-2 py-1 text-gray-500 text-sm hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							<Plus className="mr-2 h-4 w-4" />
							Add folder
						</button>
					)}
				</div>
			</div>

			{/* Footer - Trash */}
			<div className="border-gray-200 border-t p-4 dark:border-gray-700">
				<button
					type="button"
					className="flex items-center text-gray-500 text-sm hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Trash
				</button>
			</div>
		</div>
	);
}

interface IdeaItemProps {
	idea: Doc<"ideas">;
	isSelected: boolean;
	onSelect: (ideaId: Id<"ideas">) => void;
	depth: number;
}

function IdeaItem({ idea, isSelected, onSelect, depth }: IdeaItemProps) {
	return (
		<button
			type="button"
			onClick={() => onSelect(idea._id)}
			className={`flex w-full items-center rounded px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
				isSelected
					? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
					: "text-gray-700 dark:text-gray-300"
			}`}
			style={{ paddingLeft: `${8 + depth * 16}px` }}
		>
			<FileText className="mr-2 h-4 w-4 flex-shrink-0" />
			<span className="truncate">{idea.title}</span>
		</button>
	);
}

interface FolderItemProps {
	folder: Doc<"folders">;
	isExpanded: boolean;
	onToggle: () => void;
	ideas: Doc<"ideas">[];
	selectedIdeaId: Id<"ideas"> | null;
	onSelectIdea: (ideaId: Id<"ideas">) => void;
	onCreateIdea: () => void;
	depth: number;
}

function FolderItem({
	folder,
	isExpanded,
	onToggle,
	ideas,
	selectedIdeaId,
	onSelectIdea,
	onCreateIdea,
	depth,
}: FolderItemProps) {
	const [showActions, setShowActions] = useState(false);

	return (
		<div>
			{/* Folder Header */}
			<fieldset
				className="group flex items-center rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
				style={{ paddingLeft: `${8 + depth * 16}px` }}
				onMouseEnter={() => setShowActions(true)}
				onMouseLeave={() => setShowActions(false)}
			>
				<button
					type="button"
					onClick={onToggle}
					className="flex flex-1 items-center text-left"
				>
					{isExpanded ? (
						<FolderOpen className="mr-2 h-4 w-4 text-blue-600" />
					) : (
						<Folder className="mr-2 h-4 w-4 text-gray-600" />
					)}
					<span className="truncate text-gray-700 dark:text-gray-300">
						{folder.name}
					</span>
				</button>

				{showActions && (
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={onCreateIdea}
							className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
							title="New page"
						>
							<Plus className="h-3 w-3 text-gray-500" />
						</button>
						<button
							type="button"
							className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
							title="More options"
						>
							<MoreHorizontal className="h-3 w-3 text-gray-500" />
						</button>
					</div>
				)}
			</fieldset>

			{/* Folder Contents */}
			{isExpanded && (
				<div>
					{ideas.map((idea) => (
						<IdeaItem
							key={idea._id}
							idea={idea}
							isSelected={selectedIdeaId === idea._id}
							onSelect={onSelectIdea}
							depth={depth + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
}
