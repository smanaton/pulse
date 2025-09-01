import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		globals: true,
		css: true,
		clearMocks: true,
		restoreMocks: true,
		// Integration tests may be slower
		slowTestThreshold: 2000,
		testTimeout: 10000,
		// Integration test patterns
		include: [
			"tests/integration/**/*.spec.ts",
			"tests/integration/**/*.spec.tsx",
		],
		// Coverage for integration tests
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: [
				"src/**/*.{ts,tsx}",
				"!src/**/*.test.{ts,tsx}",
				"!src/**/*.spec.{ts,tsx}",
				"!src/**/*.d.ts",
				"!src/test/**",
			],
			exclude: [
				"src/test/**",
				"**/*.config.*",
				"**/node_modules/**",
			],
		},
		deps: {
			inline: ["@convex-dev/auth", "convex", "msw"],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});