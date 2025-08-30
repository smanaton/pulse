import { api } from "@pulse/backend";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Dashboard } from "@/components/dashboard";
import { DashboardLayout } from "@/components/layouts/dashboard/layout";

export const Route = createFileRoute("/")({
	component: IndexPage,
});

function IndexPage() {
	const user = useQuery(api.users.getCurrentUser);

	// Show loading while checking auth status
	if (user === undefined) {
		console.log("🏠 IndexPage - showing loading spinner (user undefined)");
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-32 w-32 animate-spin rounded-full border-blue-600 border-b-2" />
			</div>
		);
	}

	// If not authenticated, redirect to sign-in
	if (!user) {
		console.log("🏠 IndexPage - user is null, redirecting to sign-in");
		return <Navigate to="/auth/sign-in" replace />;
	}

	return (
		<DashboardLayout>
			<Dashboard />
		</DashboardLayout>
	);
}
