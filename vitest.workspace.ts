// vitest.workspace.ts

import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineWorkspace } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkspace([
	// --- WEB ---
	{
		plugins: [react()],
		resolve: {
			alias: { "@": path.resolve(__dirname, "./apps/web/src") },
		},
		test: {
			name: "web",
			root: "./apps/web",
			environment: "jsdom",
			setupFiles: ["./src/test/setup.ts"],
			globals: true,
			css: true,
			clearMocks: true,
			restoreMocks: true,
			deps: {
				inline: [
					"@testing-library/react",
					"@testing-library/jest-dom",
					"flowbite-react",
					"@tanstack/react-router",
					"convex/react",
				],
			},
			coverage: {
				provider: "v8",
				reporter: ["text", "html"],
				exclude: ["node_modules/", "src/test/", "**/*.{test,spec}.{ts,tsx}"],
			},
		},
	},
	// --- BACKEND ---
	{
		resolve: {
			alias: { "@": path.resolve(__dirname, "./packages/backend/convex") },
		},
		test: {
			name: "backend",
			root: "./packages/backend",
			environment: "edge-runtime",
			setupFiles: ["./convex/test.setup.ts"],
			globals: true,
			passWithNoTests: true,
			maxConcurrency: 5,
			slowTestThreshold: 300,
			deps: {
				inline: ["convex-test", "convex"],
			},
			coverage: {
				provider: "v8",
				reporter: ["text", "json", "html"],
				include: ["convex/**/*.{js,ts}"],
				exclude: [
					"convex/_generated/**",
					"convex/**/*.test.{js,ts}",
					"convex/**/*.d.ts",
				],
			},
		},
	},
]);
