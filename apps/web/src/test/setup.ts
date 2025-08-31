import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, vi } from "vitest";
import { TestDataFactory } from "./convex-test-setup";

// Mock function factories with realistic test data
const createMockUseQuery = () => vi.fn(() => TestDataFactory.user());
const createMockUseMutation = () => vi.fn(() => vi.fn());
const createMockUseAction = () =>
	vi.fn(() =>
		vi.fn(() =>
			Promise.resolve({ type: "success", message: "Action completed" }),
		),
	);
const createMockUseAuthActions = () =>
	vi.fn(() => ({
		signIn: vi.fn(),
		signOut: vi.fn(),
	}));

// Store mocks globally for each test
let mockUseQuery: ReturnType<typeof createMockUseQuery>;
let mockUseMutation: ReturnType<typeof createMockUseMutation>;
let mockUseAction: ReturnType<typeof createMockUseAction>;
let mockUseAuthActions: ReturnType<typeof createMockUseAuthActions>;

// Setup test environment
beforeEach(() => {
	// Create fresh mock instances for each test
	mockUseQuery = createMockUseQuery();
	mockUseMutation = createMockUseMutation();
	mockUseAction = createMockUseAction();
	mockUseAuthActions = createMockUseAuthActions();
});

// Cleanup after each test
afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

// Mock TanStack Router before any imports
vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(() => vi.fn()),
	useLocation: vi.fn(() => ({ pathname: "/" })),
	useRouterState: vi.fn(() => ({ isLoading: false })),
	Link: vi.fn(
		({
			children,
			to,
			...props
		}: {
			children: React.ReactNode;
			to: string;
			[key: string]: unknown;
		}) => React.createElement("a", { href: to, ...props }, children),
	),
	createFileRoute: vi.fn((_path: string) => ({
		component: vi.fn(),
		useSearch: () => ({}),
	})),
	createRootRouteWithContext: vi.fn(() => ({})),
	Outlet: vi.fn(
		({ children }: { children?: React.ReactNode }) =>
			children || React.createElement("div"),
	),
	HeadContent: vi.fn(() => null),
	TanStackRouterDevtools: vi.fn(() => null),
}));

// Mock Convex with smart defaults
vi.mock("convex/react", () => ({
	useQuery: vi.fn((query, _args) => {
		// Return appropriate test data based on query
		if (typeof query === "string") {
			if (query.includes("getCurrentUser") || query.includes("users")) {
				return TestDataFactory.user();
			}
			if (query.includes("ideas") || query.includes("list")) {
				return [TestDataFactory.idea()];
			}
			if (query.includes("workspaces")) {
				return [TestDataFactory.workspace()];
			}
		}
		return null;
	}),
	useMutation: vi.fn(() => vi.fn(() => Promise.resolve("test_id_123"))),
	useAction: vi.fn(() =>
		vi.fn(() =>
			Promise.resolve({ type: "success", message: "Action completed" }),
		),
	),
	Authenticated: vi.fn(
		({ children }: { children: React.ReactNode }) => children,
	),
	Unauthenticated: vi.fn(
		({ children }: { children: React.ReactNode }) => children,
	),
	ConvexReactClient: vi.fn(),
	ConvexProvider: vi.fn(
		({ children }: { children: React.ReactNode }) => children,
	),
}));

// Mock Convex Auth
vi.mock("@convex-dev/auth/react", () => ({
	useAuthActions: vi.fn(() => ({
		signIn: vi.fn(),
		signOut: vi.fn(),
	})),
	ConvexAuthProvider: vi.fn(
		({ children }: { children: React.ReactNode }) => children,
	),
}));

// Mock backend API with comprehensive coverage
vi.mock("@pulse/backend", () => ({
	api: {
		users: {
			getCurrentUser: "users:getCurrentUser",
			update: "users:update",
		},
		ideas: {
			list: "ideas:list",
			create: "ideas:create",
			update: "ideas:update",
			delete: "ideas:delete",
		},
		workspaces: {
			list: "workspaces:list",
			create: "workspaces:create",
			update: "workspaces:update",
		},
		projects: {
			list: "projects:list",
			create: "projects:create",
			update: "projects:update",
			delete: "projects:delete",
		},
		ai: {
			processCommand: "ai:processCommand",
		},
	},
}));

// Mock Flowbite React components
vi.mock("flowbite-react", () => ({
	Button: vi.fn(({ children, ...props }: any) =>
		React.createElement("button", props, children),
	),
	Card: vi.fn(({ children }: any) =>
		React.createElement("div", null, children),
	),
	CardContent: vi.fn(({ children }: any) =>
		React.createElement("div", null, children),
	),
	CardHeader: vi.fn(({ children }: any) =>
		React.createElement("div", null, children),
	),
	CardTitle: vi.fn(({ children }: any) =>
		React.createElement("h3", null, children),
	),

	// Navbar components
	Navbar: vi.fn(({ children, ...props }: any) =>
		React.createElement("nav", props, children),
	),
	NavbarBrand: vi.fn(({ children, ...props }: any) =>
		React.createElement("div", props, children),
	),

	// Form components
	Label: vi.fn(({ children, ...props }: any) =>
		React.createElement("label", props, children),
	),
	TextInput: vi.fn(({ ...props }: any) => React.createElement("input", props)),

	// Dropdown components
	Dropdown: vi.fn(({ children, label, ...props }: any) =>
		React.createElement("div", props, label, children),
	),
	DropdownHeader: vi.fn(({ children, ...props }: any) =>
		React.createElement("div", props, children),
	),
	DropdownItem: vi.fn(({ children, onClick, ...props }: any) =>
		React.createElement("button", { onClick, ...props }, children),
	),
	DropdownDivider: vi.fn(() => React.createElement("hr")),

	// Avatar component
	Avatar: vi.fn(({ children, img, alt, ...props }: any) => {
		if (img) {
			return React.createElement("img", { src: img, alt: alt || "", ...props });
		}
		return React.createElement("div", props, children);
	}),

	// Tooltip
	Tooltip: vi.fn(({ children, ...props }: any) =>
		React.createElement("div", props, children),
	),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
	Card: vi.fn(({ children }: any) =>
		React.createElement("div", null, children),
	),
	CardContent: vi.fn(({ children }: any) =>
		React.createElement("div", null, children),
	),
	CardHeader: vi.fn(({ children }: any) =>
		React.createElement("div", null, children),
	),
	CardTitle: vi.fn(({ children }: any) =>
		React.createElement("h3", null, children),
	),
}));

vi.mock("@/components/ui/sonner", () => ({
	Toaster: vi.fn(() => null),
}));

// Mock contexts
vi.mock("@/contexts/sidebar-context", () => ({
	useSidebarContext: vi.fn(() => ({
		mobile: { isOpen: false, toggle: vi.fn() },
		desktop: { isCollapsed: false, toggle: vi.fn() },
	})),
	SidebarProvider: vi.fn(({ children }: any) => children),
}));

// Mock hooks
vi.mock("@/hooks/use-media-query", () => ({
	useMediaQuery: vi.fn(() => true), // Default to desktop
}));

// Mock sidebar storage
vi.mock("@/lib/sidebar-storage", () => ({
	sidebarStorage: {
		get: vi.fn(() => ({ isCollapsed: false })),
		set: vi.fn(),
	},
}));

// Mock environment variables
Object.defineProperty(import.meta, "env", {
	value: {
		VITE_CONVEX_URL: "http://localhost:3210",
		DEV: true,
		PROD: false,
		SSR: false,
	},
	writable: true,
});

// Test utilities for accessing mocks
export const getTestMocks = () => ({
	mockUseQuery,
	mockUseMutation,
	mockUseAction,
	mockUseAuthActions,
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});
