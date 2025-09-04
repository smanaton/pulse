/**
 * Unit Test - React Component
 * Tests behavior, not implementation details
 * Fast, isolated, no network calls
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

// Mock component that would typically be in your codebase
const AddIdeaButton = ({
	onAdd,
	disabled = false,
}: {
	onAdd: () => void;
	disabled?: boolean;
}) => (
	<button
		type="button"
		onClick={onAdd}
		disabled={disabled}
		aria-label="Add idea"
	>
		Add New Idea
	</button>
);

describe("AddIdeaButton", () => {
	test("Given_UserOnIdeasPage_When_ClicksAdd_Then_CallsOnAdd", async () => {
		// Arrange
		const onAdd = vi.fn();
		render(<AddIdeaButton onAdd={onAdd} />);

		// Act
		await userEvent.click(screen.getByRole("button", { name: /add idea/i }));

		// Assert
		expect(onAdd).toHaveBeenCalledTimes(1);
	});

	test("Given_DisabledButton_When_ClickAttempted_Then_DoesNotCallOnAdd", async () => {
		// Arrange
		const onAdd = vi.fn();
		render(<AddIdeaButton onAdd={onAdd} disabled={true} />);

		// Act
		await userEvent.click(screen.getByRole("button", { name: /add idea/i }));

		// Assert
		expect(onAdd).not.toHaveBeenCalled();
	});

	test("Given_Button_When_Rendered_Then_HasAccessibleName", () => {
		// Arrange
		const onAdd = vi.fn();
		render(<AddIdeaButton onAdd={onAdd} />);

		// Assert
		expect(
			screen.getByRole("button", { name: /add idea/i }),
		).toBeInTheDocument();
	});
});
