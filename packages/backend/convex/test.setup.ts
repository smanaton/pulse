/**
 * Convex Test Setup for Edge Runtime Testing
 *
 * Modern test setup for convex-test framework using Vitest 3.x patterns.
 * Provides custom module resolution for non-standard project structures.
 *
 * Key Features:
 * - Custom module resolution for convex-test
 * - Edge runtime environment compatibility
 * - Automatic inclusion of generated API files
 * - Exclusion of test files to prevent circular imports
 */

// Import all Convex function files and _generated files needed by convex-test
export const modules = import.meta.glob(
	[
		"./*.ts",
		"./orchestration/*.ts", // Include orchestration subdirectory
		"./_generated/*.js", // Include generated API files that convex-test needs
		"!./*.test.ts",
		"!./*.spec.ts",
		"!./*.d.ts",
		"!./test.setup.ts",
		"!./orchestration/*.test.ts",
		"!./orchestration/*.spec.ts",
	],
	{ eager: false },
); // Lazy loading for better performance

// Export test utilities for use in test files
export const getTestUtilities = () => {
	return {
		modules,
		environment: "edge-runtime",
	};
};
