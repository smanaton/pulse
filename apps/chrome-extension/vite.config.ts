import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

const target = process.env.TARGET || "chrome";

export default defineConfig({
	plugins: [
		react(),
		webExtension({
			browser: target,
			webExtConfig: {
				startUrl: ["https://google.com"],
			},
			disableAutoLaunch: true, // Disable auto-launch for CI/build environments
		}),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
