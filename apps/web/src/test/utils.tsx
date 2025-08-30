import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";

// Mock user data for testing
export const mockUser = {
	_id: "user123" as any,
	_creationTime: Date.now(),
	email: "test@example.com",
	name: "Test User",
	image: "https://example.com/avatar.jpg",
	emailVerified: Date.now(),
	createdAt: Date.now(),
	updatedAt: Date.now(),
};

// Mock auth actions
export const mockAuthActions = {
	signIn: vi.fn(),
	signOut: vi.fn(),
};

// Mock navigate function - Note: Router is mocked globally in setup.ts
export const mockNavigate = vi.fn();

// Mock auth state helper
export const mockAuthState = (user: any) => {
	// Access the global mock functions
	const mockUseQuery = (global as any).__mockUseQuery;
	if (mockUseQuery) {
		mockUseQuery.mockReturnValue(user);
	}
};

// Note: Auth hooks are mocked globally in setup.ts

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
	return <div data-testid="test-wrapper">{children}</div>;
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

// Mock error for testing error states
export const mockError = new Error("Test error message");

// Common test data
export const testData = {
	user: mockUser,
	error: mockError,
	loading: undefined, // Convex uses undefined for loading state
};
