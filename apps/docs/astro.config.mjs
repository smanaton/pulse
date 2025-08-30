// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Pulse Documentation",
			description:
				"Complete documentation for the Pulse application with Convex Auth",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/withastro/starlight",
				},
			],
			sidebar: [
				{
					label: "Getting Started",
					items: [
						{ label: "Overview", slug: "index" },
						{
							label: "Project Structure",
							slug: "getting-started/project-structure",
						},
					],
				},
				{
					label: "Authentication",
					items: [
						{ label: "Auth Overview", slug: "auth/overview" },
						{ label: "Setup & Configuration", slug: "auth/setup" },
						{ label: "Usage Guide", slug: "auth/usage" },
						{ label: "Security", slug: "auth/security" },
					],
				},
				{
					label: "API Reference",
					autogenerate: { directory: "reference" },
				},
			],
		}),
	],
});
