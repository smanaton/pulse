/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
		coverage: {
			reporter: ["text", "json", "html"],
			include: ["src/**/*.{js,ts}"],
			exclude: [
				"src/**/*.{test,spec}.{js,ts}",
				"src/**/*.d.ts",
				"src/index.ts", // Re-export file
			],
		},
	},
	resolve: {
		alias: {
			"@pulse/core": "/src",
		},
	},
});
