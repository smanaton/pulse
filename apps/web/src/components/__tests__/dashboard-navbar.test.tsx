import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAuthState, render, testData } from "@/test/utils";
import { DashboardNavbar } from "../layouts/dashboard/navbar";

// Mock the theme toggle component that uses useTheme
vi.mock("../layouts/dashboard/theme-toggle", () => ({
	ThemeToggle: vi.fn(() => <div data-testid="theme-toggle">Theme Toggle</div>),
}));

describe("DashboardNavbar", () => {
	let mockSignOut: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();

		mockSignOut = vi.fn();

		// Mock authenticated state
		mockAuthState(testData.user);

		// Mock auth actions
		const mockUseAuthActions = (global as any).__mockUseAuthActions;
		if (mockUseAuthActions) {
			mockUseAuthActions.mockReturnValue({
				signOut: mockSignOut,
			});
		}
	});

	describe("Basic Rendering", () => {
		it("renders the navbar with brand", () => {
			render(<DashboardNavbar />);

			expect(screen.getByText("Pulse")).toBeInTheDocument();
		});

		it("renders user information", () => {
			render(<DashboardNavbar />);

			// User info should be present somewhere in the component
			expect(screen.getByText(testData.user.name)).toBeInTheDocument();
			expect(screen.getByText(testData.user.email)).toBeInTheDocument();
		});

		it("renders sidebar toggle button", () => {
			render(<DashboardNavbar />);

			const toggleButton = screen.getByRole("button", {
				name: /toggle sidebar/i,
			});
			expect(toggleButton).toBeInTheDocument();
		});

		it("renders search functionality", () => {
			render(<DashboardNavbar />);

			// Should have search-related elements
			const searchElements = screen.getAllByText(/search/i);
			expect(searchElements.length).toBeGreaterThan(0);
		});
	});

	describe("User Dropdown", () => {
		it("displays user name and email in dropdown", () => {
			render(<DashboardNavbar />);

			expect(screen.getByText(testData.user.name)).toBeInTheDocument();
			expect(screen.getByText(testData.user.email)).toBeInTheDocument();
		});

		it("handles user without name gracefully", () => {
			const userWithoutName = { ...testData.user, name: null };
			mockAuthState(userWithoutName);

			render(<DashboardNavbar />);

			expect(screen.getByText("User")).toBeInTheDocument();
			expect(screen.getByText(userWithoutName.email)).toBeInTheDocument();
		});

		it("handles user without email gracefully", () => {
			const userWithoutEmail = { ...testData.user, email: null };
			mockAuthState(userWithoutEmail);

			render(<DashboardNavbar />);

			expect(screen.getByText(userWithoutEmail.name)).toBeInTheDocument();
			expect(screen.getByText("user@example.com")).toBeInTheDocument(); // Fallback
		});
	});

	describe("Navigation Links", () => {
		it("shows navigation options", () => {
			render(<DashboardNavbar />);

			// Should have dashboard and settings links
			expect(screen.getAllByText("Dashboard")).toHaveLength(2); // Brand link + dropdown link
			expect(screen.getAllByText("Settings")).toHaveLength(2); // Quick actions + dropdown link
		});

		it("has sign out functionality", () => {
			render(<DashboardNavbar />);

			expect(screen.getByText("Sign out")).toBeInTheDocument();
		});
	});

	describe("Sign Out Functionality", () => {
		it("calls signOut when clicked", () => {
			render(<DashboardNavbar />);

			const signOutButton = screen.getByText("Sign out");
			fireEvent.click(signOutButton);

			expect(mockSignOut).toHaveBeenCalledTimes(1);
		});

		it("handles sign out errors gracefully", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mockSignOut.mockRejectedValue(new Error("Sign out failed"));

			render(<DashboardNavbar />);

			const signOutButton = screen.getByText("Sign out");
			fireEvent.click(signOutButton);

			// Wait a bit for async error handling
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Sign out error:",
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Interactive Elements", () => {
		it("has clickable sidebar toggle", () => {
			render(<DashboardNavbar />);

			const toggleButton = screen.getByRole("button", {
				name: /toggle sidebar/i,
			});

			// Should be clickable without throwing errors
			expect(() => fireEvent.click(toggleButton)).not.toThrow();
		});

		it("has notifications dropdown", () => {
			render(<DashboardNavbar />);

			// There are multiple "Notifications" texts (sr-only + visible), so check for both
			expect(screen.getAllByText("Notifications")).toHaveLength(2);
			expect(screen.getByText("No new notifications")).toBeInTheDocument();
		});

		it("has apps dropdown", () => {
			render(<DashboardNavbar />);

			expect(screen.getByText("Quick Actions")).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("has proper screen reader labels", () => {
			render(<DashboardNavbar />);

			expect(screen.getByText("Toggle sidebar")).toBeInTheDocument();
			expect(screen.getAllByText("Search")).toHaveLength(2); // Multiple search elements
			expect(screen.getAllByText("Notifications")).toHaveLength(2); // sr-only + visible
			expect(screen.getByText("Apps")).toBeInTheDocument();
			expect(screen.getByText("User menu")).toBeInTheDocument();
		});

		it("has searchable input field", () => {
			render(<DashboardNavbar />);

			const searchInput = screen.getByLabelText("Search");
			expect(searchInput).toBeInTheDocument();
			expect(searchInput).toHaveAttribute("type", "search");
		});

		it("has proper button accessibility", () => {
			render(<DashboardNavbar />);

			const toggleButton = screen.getByRole("button", {
				name: /toggle sidebar/i,
			});
			expect(toggleButton).toHaveAttribute(
				"class",
				expect.stringContaining("cursor-pointer"),
			);
		});
	});

	describe("User Avatar", () => {
		it("renders user avatar when user has image", () => {
			render(<DashboardNavbar />);

			// Check for avatar image or fallback
			const avatarImage = screen.getByAltText("");
			expect(avatarImage).toBeInTheDocument();
		});

		it("renders fallback icon when user has no image", () => {
			const userWithoutImage = { ...testData.user, image: null };
			mockAuthState(userWithoutImage);

			render(<DashboardNavbar />);

			// Should still render user info
			expect(screen.getByText(userWithoutImage.name)).toBeInTheDocument();
		});
	});

	describe("Error Boundaries", () => {
		it("renders without crashing when user data is missing", () => {
			mockAuthState(null);

			expect(() => render(<DashboardNavbar />)).not.toThrow();
		});

		it("handles partial user data gracefully", () => {
			const partialUser = {
				_id: testData.user._id,
				email: testData.user.email,
				// Missing name and image
			};
			mockAuthState(partialUser);

			render(<DashboardNavbar />);

			expect(screen.getByText("User")).toBeInTheDocument(); // Fallback name
			expect(screen.getByText(partialUser.email)).toBeInTheDocument();
		});
	});
});
