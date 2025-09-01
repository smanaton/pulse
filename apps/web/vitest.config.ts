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
		// Include only unit tests in this config
		include: [
			"tests/unit/**/*.spec.ts",
			"tests/unit/**/*.spec.tsx",
			"src/**/*.test.ts",
			"src/**/*.test.tsx",
		],
		exclude: [
			"tests/integration/**/*",
			"tests/e2e/**/*",
		],
		deps: {
			inline: ["@convex-dev/auth", "convex"],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
