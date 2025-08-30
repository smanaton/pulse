import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAuthState, render, testData } from "@/test/utils";
import { Dashboard } from "../dashboard";

describe("Dashboard", () => {
	let mockSignOut: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();

		mockSignOut = vi.fn();

		// Mock authenticated state
		mockAuthState(testData.user);

		// Mock auth actions using the global mock
		const mockUseAuthActions = (global as any).__mockUseAuthActions;
		if (mockUseAuthActions) {
			mockUseAuthActions.mockReturnValue({
				signOut: mockSignOut,
			});
		}
	});

	describe("Rendering", () => {
		it("renders the dashboard with user information", () => {
			render(<Dashboard />);

			expect(
				screen.getByText("Welcome to Pulse Dashboard"),
			).toBeInTheDocument();
			expect(
				screen.getByText("Your authenticated application dashboard"),
			).toBeInTheDocument();
			expect(screen.getByText("User Information")).toBeInTheDocument();
		});

		it("displays user details", () => {
			render(<Dashboard />);

			expect(screen.getByText(testData.user.name)).toBeInTheDocument();
			expect(screen.getByText(testData.user.email)).toBeInTheDocument();
			expect(screen.getByAltText(testData.user.name)).toHaveAttribute(
				"src",
				testData.user.image,
			);
		});

		it("shows member since date", () => {
			render(<Dashboard />);

			const memberSince = new Date(
				testData.user.createdAt,
			).toLocaleDateString();
			expect(
				screen.getByText(memberSince, { exact: false }),
			).toBeInTheDocument();
		});

		it("renders quick action buttons", () => {
			render(<Dashboard />);

			expect(
				screen.getByRole("button", { name: /create new project/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /view analytics/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /settings/i }),
			).toBeInTheDocument();
		});
	});

	describe("Content Sections", () => {
		it("shows ready to build section", () => {
			render(<Dashboard />);

			expect(screen.getByText("🚀 Ready to Build")).toBeInTheDocument();
			expect(
				screen.getByText(/Your authentication system is fully set up/),
			).toBeInTheDocument();
		});

		it("shows documentation section", () => {
			render(<Dashboard />);

			expect(screen.getByText("📚 Documentation")).toBeInTheDocument();
			expect(screen.getAllByText("Authentication")).toHaveLength(2); // Appears in both sections
			expect(screen.getByText("Development")).toBeInTheDocument();
		});

		it("shows system status section", () => {
			render(<Dashboard />);

			expect(screen.getByText("🔧 System Status")).toBeInTheDocument();
			expect(screen.getByText("Password Auth: Active")).toBeInTheDocument();
			expect(screen.getByText("Google OAuth: Configured")).toBeInTheDocument();
			expect(screen.getByText("GitHub OAuth: Configured")).toBeInTheDocument();
			expect(screen.getByText("Convex: Connected")).toBeInTheDocument();
			expect(screen.getByText("User Schema: Active")).toBeInTheDocument();
			expect(screen.getByText("Real-time Sync: Active")).toBeInTheDocument();
		});
	});

	describe("User without full data", () => {
		it("handles user without name", () => {
			const userWithoutName = { ...testData.user, name: null };
			mockAuthState(userWithoutName);

			render(<Dashboard />);

			expect(screen.getByText("User")).toBeInTheDocument();
			expect(screen.getByText(userWithoutName.email)).toBeInTheDocument();
		});

		it("handles user without image", () => {
			const userWithoutImage = { ...testData.user, image: null };
			mockAuthState(userWithoutImage);

			render(<Dashboard />);

			expect(screen.queryByRole("img")).not.toBeInTheDocument();
		});

		it("handles user without createdAt", () => {
			const userWithoutCreatedAt = { ...testData.user, createdAt: null };
			mockAuthState(userWithoutCreatedAt);

			render(<Dashboard />);

			expect(screen.getByText(/Member since.*Unknown/)).toBeInTheDocument();
		});
	});
});
