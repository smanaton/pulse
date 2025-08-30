import type { Id } from "@pulse/backend/dataModel";
import {
	createContext,
	type FC,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Workspace {
	_id: Id<"workspaces">;
	name: string;
	slug?: string;
	type: "personal" | "shared";
	isPersonal: boolean;
	plan: "free" | "team";
	image?: string;
	ownerUserId?: Id<"users">;
	memberRole?: string;
	disabled?: boolean;
	_creationTime: number;
}

interface WorkspaceContextType {
	currentWorkspace: Workspace | null;
	workspaces: Workspace[];
	switchWorkspace: (workspaceId: Id<"workspaces">) => void;
	isLoading: boolean;
	error: Error | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
	undefined,
);

const WORKSPACE_STORAGE_KEY = "pulse-current-workspace";

interface WorkspaceProviderProps {
	children: ReactNode;
}

export const WorkspaceProvider: FC<WorkspaceProviderProps> = ({ children }) => {
	const { currentWorkspace, workspaces, isLoading } = useWorkspace();
	const [selectedWorkspaceId, setSelectedWorkspaceId] =
		useState<Id<"workspaces"> | null>(null);
	const [error, setError] = useState<Error | null>(null);

	// Initialize from localStorage on mount
	useEffect(() => {
		try {
			const storedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
			if (storedWorkspaceId) {
				setSelectedWorkspaceId(storedWorkspaceId as Id<"workspaces">);
			}
		} catch (err) {
			console.warn("Failed to read workspace from localStorage:", err);
		}
	}, []);

	// When workspaces are loaded, set the current workspace
	useEffect(() => {
		if (!isLoading && workspaces.length > 0) {
			let targetWorkspace: Workspace | null = null;

			// If we have a selected workspace ID, try to find it
			if (selectedWorkspaceId) {
				targetWorkspace =
					workspaces.find((w) => w._id === selectedWorkspaceId) || null;
			}

			// Fall back to the first personal workspace, or first workspace
			if (!targetWorkspace) {
				targetWorkspace = workspaces.find((w) => w.isPersonal) || workspaces[0];
			}

			// If we found a different workspace than what's stored, update localStorage
			if (targetWorkspace && targetWorkspace._id !== selectedWorkspaceId) {
				setSelectedWorkspaceId(targetWorkspace._id);
				try {
					localStorage.setItem(WORKSPACE_STORAGE_KEY, targetWorkspace._id);
				} catch (err) {
					console.warn("Failed to save workspace to localStorage:", err);
				}
			}
		}
	}, [workspaces, selectedWorkspaceId, isLoading]);

	const switchWorkspace = (workspaceId: Id<"workspaces">) => {
		const workspace = workspaces.find((w) => w._id === workspaceId);
		if (!workspace) {
			setError(new Error("Workspace not found"));
			return;
		}

		setSelectedWorkspaceId(workspaceId);
		setError(null);

		try {
			localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
		} catch (err) {
			console.warn("Failed to save workspace to localStorage:", err);
		}
	};

	// Determine the actual current workspace
	const actualCurrentWorkspace = selectedWorkspaceId
		? workspaces.find((w) => w._id === selectedWorkspaceId) ||
			currentWorkspace ||
			null
		: currentWorkspace || null;

	const value: WorkspaceContextType = {
		currentWorkspace: actualCurrentWorkspace,
		workspaces,
		switchWorkspace,
		isLoading,
		error,
	};

	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	);
};

export const useWorkspaceContext = (): WorkspaceContextType => {
	const context = useContext(WorkspaceContext);
	if (context === undefined) {
		throw new Error(
			"useWorkspaceContext must be used within a WorkspaceProvider",
		);
	}
	return context;
};
