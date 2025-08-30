import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Spinner } from "flowbite-react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: () => (
		<div className="flex h-full items-center justify-center">
			<Spinner size="lg" />
		</div>
	),
	context: {},
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return <ConvexProvider client={convex}>{children}</ConvexProvider>;
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
	root.render(<RouterProvider router={router} />);
}
