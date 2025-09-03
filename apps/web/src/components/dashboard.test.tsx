import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAuthState, render, testData } from "@/test/utils";
import { Dashboard } from "./dashboard";

describe("Dashboard", () => {
	let mockSignOut: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();

		mockSignOut = vi.fn();

		// Mock authenticated state
		mockAuthState(testData.user);

		// Mock auth actions using the global mock
		const mockUseAuthActions = (
			global as typeof global & {
				__mockUseAuthActions?: {
					mockReturnValue: (value: { signOut: () => void }) => void;
				};
			}
		).__mockUseAuthActions;
		if (mockUseAuthActions) {
			mockUseAuthActions.mockReturnValue({
				signOut: mockSignOut,
			});
		}
	});

	describe("Rendering", () => {
		it("renders the dashboard container", () => {
			render(<Dashboard />);

			// Test that dashboard container exists and has content
			const dashboard = screen.getByTestId("test-wrapper");
			expect(dashboard).toBeInTheDocument();
			expect(dashboard).not.toBeEmptyDOMElement();
		});
	});

	describe("User without full data", () => {
		it("handles user without image", () => {
			const { image: _image, ...userWithoutImage } = testData.user;
			mockAuthState(userWithoutImage);

			render(<Dashboard />);

			expect(screen.queryByRole("img")).not.toBeInTheDocument();
		});
	});
});
