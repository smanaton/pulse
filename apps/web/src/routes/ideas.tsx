import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { IdeasWorkspace } from "@/components/ideas/workspace";
import { IdeasLayout } from "@/components/layouts/ideas-layout";
import { useCurrentWorkspaceId } from "@/hooks/useWorkspace";

export const Route = createFileRoute("/ideas")({
	component: IdeasPage,
});

function IdeasPage() {
	const user = useQuery(api.users.getCurrentUser);
	const workspaceId = useCurrentWorkspaceId();
	const createWorkspace = useMutation(api.workspaces.getOrCreatePersonal);
	const [selectedIdeaId, setSelectedIdeaId] = useState<Id<"ideas"> | null>(
		null,
	);

	// Create personal workspace if user is authenticated but has no workspace
	if (user && !workspaceId) {
		createWorkspace();
	}

	// Show loading if we don't have a workspace yet
	if (!workspaceId) {
		return (
			<div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-600 border-b-2" />
					<p className="text-gray-600 dark:text-gray-400">
						Setting up your workspace...
					</p>
				</div>
			</div>
		);
	}

	return (
		<IdeasLayout
			workspaceId={workspaceId}
			selectedIdeaId={selectedIdeaId}
			onSelectIdea={setSelectedIdeaId}
		>
			<IdeasWorkspace
				workspaceId={workspaceId}
				selectedIdeaId={selectedIdeaId}
				onSelectIdea={setSelectedIdeaId}
			/>
		</IdeasLayout>
	);
}
