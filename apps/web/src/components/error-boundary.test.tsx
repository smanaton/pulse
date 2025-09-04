import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ErrorBoundary,
	type ErrorFallbackProps,
	useErrorHandler,
	withErrorBoundary,
} from "./error-boundary";

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
	console.error = vi.fn();
});

afterEach(() => {
	console.error = originalConsoleError;
});

// Test components
const ThrowingComponent: React.FC<{
	shouldThrow?: boolean;
	errorMessage?: string;
}> = ({ shouldThrow = true, errorMessage = "Test error message" }) => {
	if (shouldThrow) {
		throw new Error(errorMessage);
	}
	return <div>No error occurred</div>;
};

const WorkingComponent: React.FC = () => (
	<div>Component rendered successfully</div>
);

const CustomErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	resetError,
}) => (
	<div>
		<h2>Custom Error Fallback</h2>
		<p>Error: {error.message}</p>
		<button type="button" onClick={resetError}>
			Reset
		</button>
	</div>
);

const ComponentWithErrorHandler: React.FC<{ triggerError?: boolean }> = ({
	triggerError,
}) => {
	const { handleError } = useErrorHandler();

	React.useEffect(() => {
		if (triggerError) {
			handleError(new Error("Handled error"));
		}
	}, [triggerError, handleError]);

	return <div>Component with error handler</div>;
};

describe("ErrorBoundary", () => {
	describe("Error Catching", () => {
		it("renders children when no error occurs", () => {
			render(
				<ErrorBoundary>
					<WorkingComponent />
				</ErrorBoundary>,
			);

			expect(
				screen.getByText("Component rendered successfully"),
			).toBeInTheDocument();
		});

		it("catches and displays error with default fallback", () => {
			render(
				<ErrorBoundary>
					<ThrowingComponent />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Something went wrong")).toBeInTheDocument();
			expect(
				screen.getByText(/We apologize for the inconvenience/),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Try Again" }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Reload Page" }),
			).toBeInTheDocument();
		});

		it("displays error details in development mode", () => {
			// Mock NODE_ENV for this test
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "development";

			render(
				<ErrorBoundary>
					<ThrowingComponent errorMessage="Detailed error message" />
				</ErrorBoundary>,
			);

			expect(
				screen.getByText("Error Details (Development Only)"),
			).toBeInTheDocument();

			// Cleanup
			process.env.NODE_ENV = originalEnv;
		});

		it("hides error details in production mode", () => {
			// Mock NODE_ENV for this test
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			render(
				<ErrorBoundary>
					<ThrowingComponent />
				</ErrorBoundary>,
			);

			expect(
				screen.queryByText("Error Details (Development Only)"),
			).not.toBeInTheDocument();

			// Cleanup
			process.env.NODE_ENV = originalEnv;
		});

		it("uses custom fallback component when provided", () => {
			render(
				<ErrorBoundary fallback={CustomErrorFallback}>
					<ThrowingComponent errorMessage="Custom error test" />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Custom Error Fallback")).toBeInTheDocument();
			expect(screen.getByText("Error: Custom error test")).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
		});

		it("calls onError callback when error occurs", () => {
			const onErrorMock = vi.fn();

			render(
				<ErrorBoundary onError={onErrorMock}>
					<ThrowingComponent errorMessage="Callback test error" />
				</ErrorBoundary>,
			);

			expect(onErrorMock).toHaveBeenCalledTimes(1);
			expect(onErrorMock).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Callback test error",
				}),
				expect.any(Object),
			);
		});
	});

	describe("Error Recovery", () => {
		it("allows error recovery through Try Again button", () => {
			let shouldThrow = true;
			const TestComponent = () => (
				<ThrowingComponent shouldThrow={shouldThrow} />
			);

			const { rerender } = render(
				<ErrorBoundary>
					<TestComponent />
				</ErrorBoundary>,
			);

			// Error should be displayed
			expect(screen.getByText("Something went wrong")).toBeInTheDocument();

			// Fix the error condition
			shouldThrow = false;

			// Click Try Again
			fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

			// Component should recover
			rerender(
				<ErrorBoundary>
					<ThrowingComponent shouldThrow={false} />
				</ErrorBoundary>,
			);

			expect(screen.getByText("No error occurred")).toBeInTheDocument();
		});

		it("handles page reload through Reload Page button", () => {
			// Mock window.location.reload using Object.defineProperty
			const mockReload = vi.fn();
			Object.defineProperty(window, "location", {
				value: {
					reload: mockReload,
				},
				writable: true,
			});

			render(
				<ErrorBoundary>
					<ThrowingComponent />
				</ErrorBoundary>,
			);

			fireEvent.click(screen.getByRole("button", { name: "Reload Page" }));

			expect(mockReload).toHaveBeenCalledTimes(1);
		});
	});

	describe("Error Boundaries with Different Error Types", () => {
		it("handles syntax errors", () => {
			const SyntaxErrorComponent = () => {
				throw new SyntaxError("Syntax error occurred");
			};

			render(
				<ErrorBoundary>
					<SyntaxErrorComponent />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		});

		it("handles reference errors", () => {
			const ReferenceErrorComponent = () => {
				throw new ReferenceError("Reference error occurred");
			};

			render(
				<ErrorBoundary>
					<ReferenceErrorComponent />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		});

		it("handles type errors", () => {
			const TypeErrorComponent = () => {
				throw new TypeError("Type error occurred");
			};

			render(
				<ErrorBoundary>
					<TypeErrorComponent />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		});
	});
});

describe("withErrorBoundary HOC", () => {
	it("wraps component with error boundary", () => {
		const WrappedComponent = withErrorBoundary(WorkingComponent);

		render(<WrappedComponent />);

		expect(
			screen.getByText("Component rendered successfully"),
		).toBeInTheDocument();
	});

	it("catches errors in wrapped component", () => {
		const WrappedThrowingComponent = withErrorBoundary(ThrowingComponent);

		render(<WrappedThrowingComponent />);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("uses custom fallback in HOC", () => {
		const WrappedComponent = withErrorBoundary(
			ThrowingComponent,
			CustomErrorFallback,
		);

		render(<WrappedComponent />);

		expect(screen.getByText("Custom Error Fallback")).toBeInTheDocument();
	});

	it("calls custom onError in HOC", () => {
		const onErrorMock = vi.fn();
		const WrappedComponent = withErrorBoundary(
			ThrowingComponent,
			undefined,
			onErrorMock,
		);

		render(<WrappedComponent />);

		expect(onErrorMock).toHaveBeenCalledTimes(1);
	});

	it("sets correct display name", () => {
		const TestComponent = () => <div>Test</div>;
		TestComponent.displayName = "TestComponent";

		const WrappedComponent = withErrorBoundary(TestComponent);

		expect(WrappedComponent.displayName).toBe(
			"withErrorBoundary(TestComponent)",
		);
	});
});

describe("useErrorHandler Hook", () => {
	it("throws error when handleError is called", () => {
		expect(() => {
			render(
				<ErrorBoundary>
					<ComponentWithErrorHandler triggerError={true} />
				</ErrorBoundary>,
			);
		}).not.toThrow(); // Error should be caught by boundary

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("does not throw when no error is triggered", () => {
		render(
			<ErrorBoundary>
				<ComponentWithErrorHandler triggerError={false} />
			</ErrorBoundary>,
		);

		expect(
			screen.getByText("Component with error handler"),
		).toBeInTheDocument();
	});
});

describe("Edge Cases", () => {
	it("handles errors during initial render", () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("handles errors in event handlers", () => {
		const EventHandlerComponent = () => {
			const { handleError } = useErrorHandler();

			return (
				<button
					type="button"
					onClick={() => handleError(new Error("Event handler error"))}
				>
					Trigger Error
				</button>
			);
		};

		render(
			<ErrorBoundary>
				<EventHandlerComponent />
			</ErrorBoundary>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Trigger Error" }));

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("handles nested error boundaries", () => {
		render(
			<ErrorBoundary fallback={() => <div>Outer Error Boundary</div>}>
				<ErrorBoundary fallback={() => <div>Inner Error Boundary</div>}>
					<ThrowingComponent />
				</ErrorBoundary>
			</ErrorBoundary>,
		);

		expect(screen.getByText("Inner Error Boundary")).toBeInTheDocument();
		expect(screen.queryByText("Outer Error Boundary")).not.toBeInTheDocument();
	});

	it("continues to work after error recovery", () => {
		let shouldThrow = true;

		const DynamicComponent = () => (
			<ThrowingComponent shouldThrow={shouldThrow} />
		);

		const { rerender } = render(
			<ErrorBoundary>
				<DynamicComponent />
			</ErrorBoundary>,
		);

		// Initial error state
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();

		// Fix the error
		shouldThrow = false;
		fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

		// Re-render with fixed component
		rerender(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={false} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("No error occurred")).toBeInTheDocument();

		// Can handle errors again
		shouldThrow = true;
		rerender(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});
});
