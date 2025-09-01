/**
 * Router Test Utilities
 * Helpers for testing TanStack Router with real routing
 * Provides context and realistic navigation testing
 */

import { render, screen } from "@testing-library/react";
import {
  createMemoryRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode, Suspense } from "react";

// Mock pages for testing
const HomePage = () => <div>Home Page</div>;
const DashboardPage = () => <div>Dashboard</div>;
const IdeasPage = () => <div>Ideas Page</div>;
const IdeaDetailPage = ({ id }: { id: string }) => <div>Idea Detail: {id}</div>;
const NotFoundPage = () => <div>404 - Not Found</div>;
const LoadingPage = () => <div>Loading...</div>;

// Create route tree for testing
const rootRoute = createRootRoute({
  component: ({ children }) => (
    <div>
      <nav>
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/ideas">Ideas</a>
      </nav>
      <main>{children}</main>
    </div>
  ),
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const ideasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ideas",
  component: IdeasPage,
});

const ideaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ideas/$id",
  component: ({ params }) => <IdeaDetailPage id={params.id} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  ideasRoute,
  ideaDetailRoute,
]);

/**
 * Test Provider Component
 * Wraps components with necessary providers
 */
interface TestProviderProps {
  children: ReactNode;
  initialEntries?: string[];
  queryClient?: QueryClient;
}

const TestProvider: React.FC<TestProviderProps> = ({
  children,
  initialEntries = ["/"],
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  }),
}) => {
  const router = createMemoryRouter({
    routeTree,
    initialEntries,
    defaultPendingComponent: LoadingPage,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingPage />}>
        <RouterProvider router={router} />
      </Suspense>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Renders a component at a specific route
 */
export const renderRoute = (
  path: string,
  options: {
    initialEntries?: string[];
    queryClient?: QueryClient;
    wrapper?: React.ComponentType<{ children: ReactNode }>;
  } = {}
) => {
  const { initialEntries = [path], queryClient, wrapper } = options;

  const Wrapper = wrapper || (({ children }) => <>{children}</>);

  const utils = render(
    <Wrapper>
      <TestProvider
        initialEntries={initialEntries}
        queryClient={queryClient}
      />
    </Wrapper>
  );

  return {
    ...utils,
    screen,
    // Helper to navigate to a new path
    navigateTo: async (newPath: string) => {
      // This would trigger navigation in your actual router
      // Implementation depends on your router setup
      window.history.pushState({}, "", newPath);
    },
    // Helper to go back
    goBack: () => {
      window.history.back();
    },
    // Helper to wait for route change
    waitForRoute: async (expectedPath: string, timeout = 1000) => {
      await new Promise((resolve) => {
        const checkPath = () => {
          if (window.location.pathname === expectedPath) {
            resolve(void 0);
          } else if (timeout > 0) {
            timeout -= 100;
            setTimeout(checkPath, 100);
          } else {
            throw new Error(
              `Timeout waiting for route ${expectedPath}, current: ${window.location.pathname}`
            );
          }
        };
        checkPath();
      });
    },
  };
};

/**
 * Renders a component with router context but without navigation
 */
export const renderWithRouter = (
  component: ReactNode,
  options: {
    initialPath?: string;
    queryClient?: QueryClient;
  } = {}
) => {
  const { initialPath = "/", queryClient } = options;

  return render(
    <TestProvider
      initialEntries={[initialPath]}
      queryClient={queryClient}
    >
      {component}
    </TestProvider>
  );
};

/**
 * Creates a mock router for component testing
 */
export const createMockRouter = (currentPath = "/") => {
  return {
    // Mock router methods
    navigate: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    
    // Mock location
    location: {
      pathname: currentPath,
      search: "",
      hash: "",
      state: {},
    },
    
    // Mock params
    params: {},
    
    // Mock search
    search: {},
    
    // Mock state
    isLoading: false,
    isTransitioning: false,
  };
};

/**
 * Router test utilities
 */
export const RouterTestUtils = {
  /**
   * Helper to test route parameters
   */
  withParams: (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    return `?${searchParams.toString()}`;
  },

  /**
   * Helper to wait for navigation to complete
   */
  waitForNavigation: async (timeout = 1000) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // In real implementation, this would wait for router state
  },

  /**
   * Helper to simulate browser navigation
   */
  simulateNavigation: (path: string) => {
    window.history.pushState({}, "", path);
    // Trigger navigation event if needed
    window.dispatchEvent(new PopStateEvent("popstate"));
  },

  /**
   * Helper to check if route is active
   */
  isRouteActive: (path: string) => {
    return window.location.pathname === path;
  },

  /**
   * Helper to extract route parameters
   */
  extractParams: (template: string, actual: string) => {
    const templateParts = template.split("/");
    const actualParts = actual.split("/");
    const params: Record<string, string> = {};

    for (let i = 0; i < templateParts.length; i++) {
      const template = templateParts[i];
      const actual = actualParts[i];

      if (template?.startsWith("$")) {
        const paramName = template.slice(1);
        params[paramName] = actual || "";
      }
    }

    return params;
  },
};

/**
 * Mock implementations for router hooks
 */
export const mockRouterHooks = {
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/", search: "", hash: "" }),
  useParams: () => ({}),
  useSearch: () => ({}),
  useRouterState: () => ({ isLoading: false, isTransitioning: false }),
};

// Export types
export type MockRouter = ReturnType<typeof createMockRouter>;
export type RenderRouteResult = ReturnType<typeof renderRoute>;