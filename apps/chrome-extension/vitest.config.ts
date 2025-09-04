import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", "dist"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.{js,ts,tsx}"],
			exclude: [
				"src/**/*.{test,spec}.{js,ts,tsx}",
				"src/**/*.d.ts",
				"dist/**",
			],
		},
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});