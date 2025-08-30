import { api } from "@pulse/backend";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AppLayout } from "@/components/layouts/dashboard/layout";

export const Route = createFileRoute("/analytics")({
	component: AnalyticsPage,
});

function AnalyticsPage() {
	const user = useQuery(api.users.getCurrentUser);

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

	return (
		<AppLayout>
			<div className="space-y-6 p-6">
				<div>
					<h1 className="mb-2 font-bold text-3xl text-gray-900 dark:text-white">
						Analytics
					</h1>
					<p className="text-gray-600 text-lg dark:text-gray-400">
						View your application analytics and insights
					</p>
				</div>
				<div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<p className="text-gray-600 dark:text-gray-400">
						Analytics dashboard coming soon...
					</p>
				</div>
			</div>
		</AppLayout>
	);
}
