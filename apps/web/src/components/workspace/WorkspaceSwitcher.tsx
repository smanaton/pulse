import type { Id } from "@pulse/backend/dataModel";
import {
	Dropdown,
	DropdownDivider,
	DropdownItem,
	TextInput,
} from "flowbite-react";
import type { FC } from "react";
import { useState } from "react";
import {
	HiCheck,
	HiChevronDown,
	HiOfficeBuilding,
	HiPlus,
	HiSearch,
	HiSparkles,
	HiUser,
} from "react-icons/hi";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { WorkspaceAvatar } from "./WorkspaceAvatar";

interface Workspace {
	_id: Id<"workspaces">;
	name: string;
	slug?: string;
	type: "personal" | "shared";
	isPersonal: boolean;
	plan: "free" | "team";
	image?: string;
	memberRole?: string;
	disabled?: boolean;
	_creationTime: number;
}

interface WorkspaceSwitcherProps {
	isCollapsed?: boolean;
}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({
	isCollapsed = false,
}) => {
	const { currentWorkspace, workspaces, switchWorkspace, isLoading, error } =
		useWorkspaceContext();
	const [searchTerm, setSearchTerm] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);

	// Filter workspaces based on search
	const filteredWorkspaces = workspaces.filter(
		(workspace) =>
			workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			workspace.slug?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// Separate personal and team workspaces
	const personalWorkspaces = filteredWorkspaces.filter((w) => w.isPersonal);
	const teamWorkspaces = filteredWorkspaces.filter((w) => !w.isPersonal);

	if (error) {
		return (
			<div className="flex items-center space-x-2 py-2 text-red-600 dark:text-red-400">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
					<span className="font-medium text-xs">!</span>
				</div>
				{!isCollapsed && (
					<div className="flex-1">
						<p className="text-xs">Error loading workspace</p>
					</div>
				)}
			</div>
		);
	}

	if (isLoading || !currentWorkspace) {
		return (
			<div className="flex items-center space-x-2 px-3 py-2">
				<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
				{!isCollapsed && (
					<div className="flex-1">
						<div className="mb-1 h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
						<div className="h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
					</div>
				)}
			</div>
		);
	}

	const dropdownTrigger = (
		<span className="group flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
			<WorkspaceAvatar
				name={currentWorkspace.name}
				type={currentWorkspace.isPersonal ? "personal" : "team"}
				image={currentWorkspace.image}
				size="sm"
			/>
			{!isCollapsed && (
				<>
					<div className="ml-3 min-w-0 flex-1">
						<p
							className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-900 text-sm dark:text-white"
							title={currentWorkspace.name}
						>
							{currentWorkspace.name}
						</p>
						<p className="text-gray-500 text-xs capitalize dark:text-gray-400">
							{currentWorkspace.plan}{" "}
							{currentWorkspace.isPersonal ? "Personal" : "Team"}
						</p>
					</div>
					<HiChevronDown className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
				</>
			)}
		</span>
	);

	if (isCollapsed) {
		return (
			<>
				<div className="px-3 py-2">
					<Dropdown
						arrowIcon={false}
						inline
						label={dropdownTrigger}
						className="w-80"
						theme={{
							floating: {
								base: "z-50 w-fit rounded divide-y divide-gray-100 shadow focus:outline-none",
								content: "py-1 text-sm text-gray-700 dark:text-gray-200",
								style: {
									auto: "border border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
								},
							},
							content: "py-1",
						}}
					>
						<WorkspaceDropdownContent
							personalWorkspaces={personalWorkspaces}
							teamWorkspaces={teamWorkspaces}
							currentWorkspace={currentWorkspace}
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							switchWorkspace={switchWorkspace}
							onCreateWorkspace={() => setShowCreateModal(true)}
						/>
					</Dropdown>
				</div>

				<CreateWorkspaceModal
					isOpen={showCreateModal}
					onClose={() => setShowCreateModal(false)}
				/>
			</>
		);
	}

	return (
		<>
			<div className="border-gray-200 border-b pb-3 dark:border-gray-700">
				<Dropdown
					arrowIcon={false}
					inline
					label={dropdownTrigger}
					theme={{
						floating: {
							base: "z-50 w-fit rounded divide-y divide-gray-100 shadow focus:outline-none",
							content: "py-1 text-sm text-gray-700 dark:text-gray-200",
							style: {
								auto: "border border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
							},
						},
						content: "py-1",
					}}
				>
					<WorkspaceDropdownContent
						personalWorkspaces={personalWorkspaces}
						teamWorkspaces={teamWorkspaces}
						currentWorkspace={currentWorkspace}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
						switchWorkspace={switchWorkspace}
						onCreateWorkspace={() => setShowCreateModal(true)}
					/>
				</Dropdown>
			</div>

			<CreateWorkspaceModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
			/>
		</>
	);
};

interface WorkspaceDropdownContentProps {
	personalWorkspaces: Workspace[];
	teamWorkspaces: Workspace[];
	currentWorkspace: Workspace;
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	switchWorkspace: (workspaceId: Id<"workspaces">) => void;
	onCreateWorkspace: () => void;
}

const WorkspaceDropdownContent: FC<WorkspaceDropdownContentProps> = ({
	personalWorkspaces,
	teamWorkspaces,
	currentWorkspace,
	searchTerm,
	setSearchTerm,
	switchWorkspace,
	onCreateWorkspace,
}) => {
	const hasResults = personalWorkspaces.length > 0 || teamWorkspaces.length > 0;

	return (
		<div className="min-w-[280px]">
			{/* Search */}
			<div className="px-3 pt-1 pb-2">
				<div className="relative">
					<HiSearch className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
					<TextInput
						type="text"
						placeholder="Search workspaces..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setSearchTerm("");
							}
						}}
						className="pl-8"
						sizing="sm"
					/>
				</div>
			</div>

			{/* No results */}
			{searchTerm && !hasResults && (
				<div className="px-3 py-4 text-center text-gray-500 text-sm dark:text-gray-400">
					No workspaces found for "{searchTerm}"
				</div>
			)}

			{/* Personal Workspaces */}
			{personalWorkspaces.length > 0 && (
				<>
					<div className="px-3 py-1">
						<div className="flex items-center font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
							<HiUser className="mr-1 h-3 w-3" />
							Personal
						</div>
					</div>
					{personalWorkspaces.map((workspace) => (
						<DropdownItem
							key={workspace._id}
							onClick={() => switchWorkspace(workspace._id)}
							className={`${
								workspace._id === currentWorkspace._id
									? "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100"
									: ""
							}`}
						>
							<div className="flex w-full items-center">
								<WorkspaceAvatar
									name={workspace.name}
									type={workspace.isPersonal ? "personal" : "team"}
									image={workspace.image}
									size="xs"
								/>
								<div className="ml-3 min-w-0 flex-1 text-left">
									<p className="truncate font-medium text-sm">
										{workspace.name}
									</p>
									<p
										className={`text-xs capitalize ${
											workspace._id === currentWorkspace._id
												? "text-blue-600 dark:text-blue-400"
												: "text-gray-500 dark:text-gray-400"
										}`}
									>
										{workspace.plan}{" "}
										{workspace.isPersonal ? "Personal" : "Team"}
									</p>
								</div>
								{workspace._id === currentWorkspace._id && (
									<HiCheck className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
								)}
							</div>
						</DropdownItem>
					))}
				</>
			)}

			{/* Team Workspaces */}
			{teamWorkspaces.length > 0 && (
				<>
					{personalWorkspaces.length > 0 && <div className="my-1" />}
					<div className="px-3 py-1">
						<div className="flex items-center font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
							<HiOfficeBuilding className="mr-1 h-3 w-3" />
							Teams
						</div>
					</div>
					{teamWorkspaces.map((workspace) => (
						<DropdownItem
							key={workspace._id}
							onClick={() => switchWorkspace(workspace._id)}
							className={`${
								workspace._id === currentWorkspace._id
									? "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100"
									: ""
							}`}
						>
							<div className="flex w-full items-center">
								<WorkspaceAvatar
									name={workspace.name}
									type={workspace.isPersonal ? "personal" : "team"}
									image={workspace.image}
									size="xs"
								/>
								<div className="ml-3 min-w-0 flex-1 text-left">
									<p className="truncate font-medium text-sm">
										{workspace.name}
									</p>
									<p
										className={`text-xs capitalize ${
											workspace._id === currentWorkspace._id
												? "text-blue-600 dark:text-blue-400"
												: "text-gray-500 dark:text-gray-400"
										}`}
									>
										{workspace.plan}{" "}
										{workspace.isPersonal ? "Personal" : "Team"}
									</p>
								</div>
								{workspace._id === currentWorkspace._id && (
									<HiCheck className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
								)}
							</div>
						</DropdownItem>
					))}
				</>
			)}

			{/* Actions */}
			<DropdownDivider />
			<DropdownItem onClick={onCreateWorkspace}>
				<HiPlus className="mr-2 h-4 w-4" />
				Create workspace
			</DropdownItem>
			<DropdownItem
				onClick={onCreateWorkspace}
				className="text-blue-600 dark:text-blue-400"
			>
				<HiSparkles className="mr-2 h-4 w-4" />
				Upgrade to Team
			</DropdownItem>
		</div>
	);
};
