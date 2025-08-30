<<<<<<< Updated upstream
=======
import { api } from "@pulse/backend";
>>>>>>> Stashed changes
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
<<<<<<< Updated upstream
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Spinner } from "flowbite-react";
import { Toaster } from "sonner";
=======
	useLocation,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
>>>>>>> Stashed changes
import "../index.css";

export type RouterAppContext = Record<string, never>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "pulse",
			},
			{
				name: "description",
				content: "pulse is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
		scripts: [
			{
				src: "https://unpkg.com/flowbite@2.3.0/dist/flowbite.min.js",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});
	const navigate = useNavigate();
	const location = useLocation();
	const user = useQuery(api.users.getCurrentUser);

	// Handle authentication redirects
	useEffect(() => {
		console.log(
			"🌍 RootComponent useEffect - user:",
			!!user,
			"path:",
			location.pathname,
		);

		// Skip if user query is still loading
		if (user === undefined) return;

		const isAuthPage = location.pathname.startsWith("/auth");

		// If user is authenticated and on auth pages, redirect to root
		if (user && isAuthPage) {
			console.log(
				"🌍 RootComponent - authenticated user on auth page, redirecting to /",
			);
			navigate({ to: "/", replace: true });
		}
	}, [user, location.pathname, navigate]);

	// Show loading while checking auth status
	if (user === undefined) {
		return (
			<>
				<HeadContent />
				<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
					<div className="h-32 w-32 animate-spin rounded-full border-gray-900 border-b-2 dark:border-white" />
				</div>
			</>
		);
	}

	// Show main layout for all pages - auth routing handled by individual routes
	return (
		<>
			<HeadContent />
<<<<<<< Updated upstream
			<div className="h-svh">
				{isFetching ? (
					<div className="flex h-full items-center justify-center">
						<Spinner size="lg" />
					</div>
				) : (
					<Outlet />
				)}
			</div>
=======
			{isFetching ? (
				<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
					<div className="h-32 w-32 animate-spin rounded-full border-blue-600 border-b-2" />
				</div>
			) : (
				<Outlet />
			)}
>>>>>>> Stashed changes
			<Toaster richColors />
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
