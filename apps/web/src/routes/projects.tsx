import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Badge, Button } from "flowbite-react";
import { Grid, List, Plus } from "lucide-react";
import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/dashboard/layout";
import { ProjectListView } from "@/components/projects/ProjectListView";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import type { Project } from "@/hooks/use-projects";
import { useProjects } from "@/hooks/use-projects";
import { useKanbanTasks } from "@/hooks/use-tasks";

export const Route = createFileRoute("/projects")({
	component: ProjectsPage,
});

function ProjectsPage() {
	const navigate = useNavigate();
	const user = useQuery(api.users.getCurrentUser);
	const { currentWorkspace } = useWorkspaceContext();
	const { projects } = useProjects(currentWorkspace?._id);

	const [viewMode, setViewMode] = useState<"table" | "grid">("table");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	// Navigate to individual project page when clicked
	const handleProjectClick = (project: Project) => {
		navigate({
			to: "/projects/$projectId",
			params: { projectId: project._id },
		});
	};

	// Show loading while checking auth status
	if (user === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-32 w-32 animate-spin rounded-full border-blue-600 border-b-2" />
			</div>
		);
	}

	// If not authenticated, redirect to sign-in
	if (!user) {
		return <Navigate to="/auth/sign-in" replace />;
	}

	const activeProjects =
		projects?.filter((p) => p.status === "active").length || 0;
	const completedProjects =
		projects?.filter((p) => p.status === "completed").length || 0;

	return (
		<SidebarLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h1 className="mb-2 font-bold text-3xl text-gray-900 dark:text-white">
							Projects
						</h1>
						<div className="flex items-center space-x-4">
							<p className="text-gray-600 dark:text-gray-400">
								Manage your projects and collaborations
							</p>
							{projects && (
								<div className="flex items-center space-x-2">
									<Badge color="green" size="sm">
										{activeProjects} Active
									</Badge>
									<Badge color="blue" size="sm">
										{completedProjects} Completed
									</Badge>
								</div>
							)}
						</div>
					</div>
					<div className="flex items-center space-x-3">
						<div className="flex items-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
							<Button
								size="sm"
								color={viewMode === "table" ? "blue" : "light"}
								onClick={() => setViewMode("table")}
								className="rounded-r-none border-r-0"
							>
								<List className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								color={viewMode === "grid" ? "blue" : "light"}
								onClick={() => setViewMode("grid")}
								className="rounded-l-none border-l-0"
							>
								<Grid className="h-4 w-4" />
							</Button>
						</div>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Project
						</Button>
					</div>
				</div>

				{/* Main Project View */}
				<ProjectListView
					onProjectClick={handleProjectClick}
					selectedProject={selectedProject}
					viewMode={viewMode}
				/>
			</div>
		</SidebarLayout>
	);
}
