import type { Preview } from "@storybook/react-vite";
import React from "react";

import "./style.css";
import "../../web/src/index.css"; // Import web app styles for Tailwind

const preview: Preview = {
	parameters: {
		actions: {
			argTypesRegex: "^on[A-Z].*",
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: "light",
			values: [
				{
					name: "light",
					value: "#ffffff",
				},
				{
					name: "dark",
					value: "#1f2937",
				},
			],
		},
	},
	decorators: [
		(Story) => (
			<div className="min-h-screen p-4">
				<Story />
			</div>
		),
	],
};

export default preview;
