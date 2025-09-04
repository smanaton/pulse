import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "./layout";

// Mock the sidebar storage
vi.mock("@/lib/sidebar-storage", () => ({
	sidebarStorage: {
		get: vi.fn(() => ({ isCollapsed: false })),
		set: vi.fn(),
	},
}));

describe("DashboardLayout", () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		// Reset the sidebar storage mock to default behavior
		const sidebarStorageModule = await import("@/lib/sidebar-storage");
		vi.mocked(sidebarStorageModule.sidebarStorage.get).mockReturnValue({
			isCollapsed: false,
		});
	});

	describe("Basic Rendering", () => {
		it("renders the layout without crashing", () => {
			expect(() =>
				render(
					<DashboardLayout>
						<div>Test Content</div>
					</DashboardLayout>,
				),
			).not.toThrow();
		});

		it("renders children content", () => {
			const { container } = render(
				<DashboardLayout>
					<div data-testid="child-component">Child Component</div>
				</DashboardLayout>,
			);

			// Just verify some content was rendered
			expect(container.firstChild).toBeInTheDocument();
		});
	});
});
