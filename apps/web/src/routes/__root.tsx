import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Spinner } from "flowbite-react";
import { Toaster } from "sonner";
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
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			<div className="h-svh">
				{isFetching ? (
					<div className="flex h-full items-center justify-center">
						<Spinner size="lg" />
					</div>
				) : (
					<Outlet />
				)}
			</div>
			<Toaster richColors />
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
