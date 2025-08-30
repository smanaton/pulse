import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider as FlowbiteThemeProvider } from "flowbite-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeInit } from "../.flowbite-react/init";
import Loader from "./components/loader";
import { WorkspaceProvider } from "./contexts/workspace-context";
import { queryClient } from "./lib/query-client";
import { applyTheme, customTheme } from "./lib/theme";
import { routeTree } from "./routeTree.gen";

const convex = new ConvexReactClient(
	import.meta.env.VITE_CONVEX_URL as string,
	{
		verbose: true, // Enable verbose logging
	},
);

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: () => (
		<div className="flex h-full items-center justify-center">
			<Loader />
		</div>
	),
	context: {},
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<ConvexAuthProvider client={convex}>
					<FlowbiteThemeProvider theme={customTheme} applyTheme={applyTheme}>
						<ThemeInit />
						<WorkspaceProvider>{children}</WorkspaceProvider>
					</FlowbiteThemeProvider>
				</ConvexAuthProvider>
			</QueryClientProvider>
		);
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>,
	);
}
