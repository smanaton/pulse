import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: [
			"src/**/*.{test,spec}.{ts,tsx}",
			"tests/**/*.{test,spec}.{ts,tsx}"
		],
		exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.{js,ts}"],
			exclude: [
				"src/**/*.{test,spec}.{js,ts}",
				"src/**/*.d.ts",
				"src/index.ts", // Re-export file
			],
		},
	},
});
