import path from "path";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for integration tests
 *
 * These tests require a real Convex deployment and actual auth tokens.
 * They are slower but test the complete auth flow.
 *
 * Run with: npm run test:integration
 */
export default defineConfig({
	test: {
		environment: "node", // Integration tests can run in Node environment
		globals: true,
		passWithNoTests: true,
		// Integration tests can be slower
		testTimeout: 30000, // 30 seconds
		hookTimeout: 30000,
		// Only run integration tests
		include: ["convex/**/*.integration.test.ts"],
		// Skip if required env vars not present
		setupFiles: ["./test-setup/integration.setup.ts"],
		// Integration tests run sequentially to avoid conflicts
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./convex"),
		},
	},
});
