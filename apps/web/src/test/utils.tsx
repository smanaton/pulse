// tests/utils.ts
import { render, type RenderOptions } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock user fixture
export const mockUser = {
	_id: "user123",
	_creationTime: Date.now(),
	email: "test@example.com",
	name: "Test User",
	image: "https://example.com/avatar.jpg",
	emailVerified: Date.now(),
	createdAt: Date.now(),
	updatedAt: Date.now(),
};

// Mock error for testing error states
export const mockError = new Error("Test error message");

// Common test data
export const testData = {
	user: mockUser,
	error: mockError,
	loading: undefined as unknown, // Convex uses undefined for loading
};

// Create a fresh QueryClient per render to avoid state leakage across tests
export const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
			mutations: { retry: false },
		},
	});

const TestWrapper = ({ children }: PropsWithChildren) => {
	const queryClient = createTestQueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<div data-testid="test-wrapper">{children}</div>
		</QueryClientProvider>
	);
};

// Custom render function with providers
const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Wait for async operations
export const waitForAsync = () =>
	new Promise((resolve) => setTimeout(resolve, 0));

// Mock auth state helper
export const mockAuthState = (user: Partial<typeof mockUser> | undefined) => {
	// This function can be used to mock authentication state in tests
	// The actual implementation would depend on your auth system
	console.log("Mocking auth state for user:", user);
};
