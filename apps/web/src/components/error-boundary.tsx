import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<ErrorFallbackProps>;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error Fallback Props
 */
export interface ErrorFallbackProps {
	error: Error;
	resetError: () => void;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * Default Error Fallback Component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	resetError,
}) => {
	return (
		<Card className="mx-auto mt-8 w-full max-w-2xl">
			<CardHeader>
				<CardTitle className="text-red-600">Something went wrong</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-gray-600">
					We apologize for the inconvenience. An error occurred while rendering
					this component.
				</p>

				{process.env.NODE_ENV === "development" && (
					<details className="rounded border bg-gray-100 p-3">
						<summary className="cursor-pointer font-medium">
							Error Details (Development Only)
						</summary>
						<pre className="mt-2 whitespace-pre-wrap text-red-700 text-sm">
							{error.message}
							{error.stack && (
								<>
									{"\n\nStack trace:\n"}
									{error.stack}
								</>
							)}
						</pre>
					</details>
				)}

				<div className="flex gap-2">
					<button
						onClick={resetError}
						className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
					>
						Try Again
					</button>
					<button
						onClick={() => window.location.reload()}
						className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
					>
						Reload Page
					</button>
				</div>
			</CardContent>
		</Card>
	);
};

/**
 * React Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log the error to console in development
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);

		// In production, you might want to log to an error reporting service
		if (process.env.NODE_ENV === "production") {
			// Example: Send to error tracking service
			// errorTrackingService.captureException(error, { extra: errorInfo });
		}
	}

	resetError = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			const FallbackComponent = this.props.fallback || DefaultErrorFallback;

			return (
				<FallbackComponent
					error={this.state.error}
					resetError={this.resetError}
				/>
			);
		}

		return this.props.children;
	}
}

/**
 * Hook for functional components to handle errors
 */
export const useErrorHandler = () => {
	const [error, setError] = React.useState<Error | null>(null);

	const resetError = React.useCallback(() => {
		setError(null);
	}, []);

	const handleError = React.useCallback((error: Error) => {
		console.error("Error caught by useErrorHandler:", error);
		setError(error);
	}, []);

	// Throw error to be caught by ErrorBoundary
	if (error) {
		throw error;
	}

	return { handleError, resetError };
};

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
	Component: React.ComponentType<P>,
	fallback?: React.ComponentType<ErrorFallbackProps>,
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void,
) => {
	const WrappedComponent: React.FC<P> = (props) => (
		<ErrorBoundary fallback={fallback} onError={onError}>
			<Component {...props} />
		</ErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

	return WrappedComponent;
};
