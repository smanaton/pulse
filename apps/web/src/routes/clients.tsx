import { api } from "@pulse/backend";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { SidebarLayout } from "@/components/layouts/dashboard/layout";
import { ClientsTable } from "../components/clients/ClientsTable";
import { useWorkspaceContext } from "../contexts/workspace-context";

export const Route = createFileRoute("/clients")({
	component: ClientsPage,
});

function ClientsPage() {
	const user = useQuery(api.users.getCurrentUser);
	const { currentWorkspace } = useWorkspaceContext();

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

	const handleCreateClient = () => {
		console.log("Create client clicked");
		// TODO: Open create client modal
	};

	const handleEditClient = (client: any) => {
		console.log("Edit client:", client);
		// TODO: Open edit client modal
	};

	const handleViewClient = (client: any) => {
		console.log("View client:", client);
		// TODO: Navigate to client detail page or open modal
	};

	return (
		<SidebarLayout>
			<div className="space-y-6">
				<div>
					<h1 className="mb-2 font-bold text-3xl text-gray-900 dark:text-white">
						Clients
					</h1>
					<p className="text-gray-600 text-lg dark:text-gray-400">
						Manage your client relationships and contacts
					</p>
				</div>

				{!currentWorkspace ? (
					<div className="flex h-64 items-center justify-center">
						<div className="text-center">
							<h2 className="mb-2 font-semibold text-gray-900 text-xl dark:text-white">
								No Workspace Selected
							</h2>
							<p className="text-gray-500 dark:text-gray-400">
								Please select a workspace to view clients.
							</p>
						</div>
					</div>
				) : (
					<ClientsTable
						onCreateClient={handleCreateClient}
						onEditClient={handleEditClient}
						onViewClient={handleViewClient}
					/>
				)}
			</div>
		</SidebarLayout>
	);
}
