import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "edge-runtime",
		globals: true,
		// Vitest 3.0+ best practices
		passWithNoTests: true,
		// Required for convex-test to work properly
		server: {
			deps: {
				inline: ["convex-test"],
			},
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["convex/**/*.{js,ts}"],
			exclude: [
				"convex/_generated/**",
				"convex/**/*.test.{js,ts}",
				"convex/**/*.integration.test.{js,ts}",
				"convex/**/*.d.ts",
				"convex/__mocks__/**",
			],
		},
		// Performance optimizations
		maxConcurrency: 5,
		slowTestThreshold: 300,
		// Improved error handling
		dangerouslyIgnoreUnhandledErrors: false,
		// Test file patterns
		include: [
			"convex/**/*.test.ts",
		],
		// Separate integration tests (slower, require real deployment)
		exclude: ["convex/**/*.integration.test.ts"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./convex"),
		},
	},
});
