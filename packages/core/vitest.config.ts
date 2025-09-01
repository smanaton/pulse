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
	},
});
