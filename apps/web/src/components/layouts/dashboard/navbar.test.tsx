import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAuthState, render, testData } from "@/test/utils";
import { DashboardNavbar } from "./navbar";

// Mock the theme toggle component that uses useTheme
vi.mock("./theme-toggle", () => ({
	ThemeToggle: vi.fn(() => <div data-testid="theme-toggle">Theme Toggle</div>),
}));

describe("DashboardNavbar", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Mock authenticated state
		mockAuthState(testData.user);

		// Mock auth actions
		const mockUseAuthActions = (
			global as typeof global & {
				__mockUseAuthActions?: {
					mockReturnValue: (value: { signOut: () => void }) => void;
				};
			}
		).__mockUseAuthActions;
		if (mockUseAuthActions) {
			mockUseAuthActions.mockReturnValue({
				signOut: vi.fn(),
			});
		}
	});

	describe("Basic Rendering", () => {
		it("renders the navbar", () => {
			render(<DashboardNavbar />);

			// Just verify the navbar renders without crashing
			const navbar = screen.getByRole("navigation");
			expect(navbar).toBeInTheDocument();
		});

		it("renders without crashing when user data is missing", () => {
			mockAuthState(undefined);

			expect(() => render(<DashboardNavbar />)).not.toThrow();
		});
	});
});
