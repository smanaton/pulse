import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AlertCircle } from "lucide-react";
import { IdeaBlockEditor } from "@/components/ideas/idea-block-editor";
import { useCurrentWorkspaceId } from "@/hooks/useWorkspace";

export const Route = createFileRoute("/ideas/$ideaId/edit")({
	component: IdeaEditorPage,
});

function IdeaEditorPage() {
	const { ideaId } = Route.useParams();
	const navigate = useNavigate();
	const workspaceId = useCurrentWorkspaceId();

	// Get current user to check permissions
	const user = useQuery(api.users.getCurrentUser);

	// Get idea to verify access
	const idea = useQuery(
		api.ideas.get,
		ideaId ? { ideaId: ideaId as Id<"ideas"> } : "skip",
	);

	// Loading state
	if (!user || !workspaceId || !idea) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-600 border-b-2" />
					<p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
				</div>
			</div>
		);
	}

	// Error state - idea not found or no access
	if (!ideaId) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
				<div className="mx-auto max-w-md p-6 text-center">
					<AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
					<h2 className="mb-2 font-semibold text-gray-900 text-xl dark:text-white">
						Invalid Idea
					</h2>
					<p className="mb-4 text-gray-600 dark:text-gray-400">
						The idea you're trying to edit doesn't exist or you don't have
						access to it.
					</p>
					<button
						onClick={() => navigate({ to: "/ideas" })}
						className="text-blue-600 hover:text-blue-500"
					>
						← Back to Ideas
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<IdeaBlockEditor
				ideaId={ideaId as Id<"ideas">}
				workspaceId={workspaceId}
				fullScreen={true}
				onBack={() => navigate({ to: "/ideas" })}
			/>
		</div>
	);
}
