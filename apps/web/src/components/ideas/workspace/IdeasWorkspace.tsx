import type { Id } from "@pulse/backend/dataModel";
import { IdeasEditor } from "./IdeasEditor";
import { NotesActionsPanel } from "./NotesActionsPanel";

interface IdeasWorkspaceProps {
	workspaceId: Id<"workspaces">;
	selectedIdeaId: Id<"ideas"> | null;
	onSelectIdea: (ideaId: Id<"ideas"> | null) => void;
}

export function IdeasWorkspace({
	workspaceId,
	selectedIdeaId,
	onSelectIdea,
}: IdeasWorkspaceProps) {
	return (
		<div className="flex h-full bg-white dark:bg-gray-900">
			{/* Center Panel - Editor */}
			<div className="min-w-0 flex-1">
				{selectedIdeaId ? (
					<IdeasEditor
						ideaId={selectedIdeaId}
						workspaceId={workspaceId}
						onClose={() => onSelectIdea(null)}
					/>
				) : (
					<EmptyState onCreateNew={() => {}} />
				)}
			</div>

			{/* Right Panel - Toolbar & Actions */}
			{selectedIdeaId && (
				<NotesActionsPanel ideaId={selectedIdeaId} workspaceId={workspaceId} />
			)}
		</div>
	);
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="max-w-md text-center">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
					<svg
						className="h-6 w-6 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h3 className="mb-2 font-medium text-gray-900 text-lg dark:text-white">
					Select a note to start writing
				</h3>
				<p className="mb-4 text-gray-600 dark:text-gray-400">
					Choose a note from the sidebar or create a new one to get started.
				</p>
				<button
					onClick={onCreateNew}
					className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					<svg
						className="mr-2 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Note
				</button>
			</div>
		</div>
	);
}
