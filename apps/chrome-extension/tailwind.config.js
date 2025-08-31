/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./src/**/*.css"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#eff6ff",
					100: "#dbeafe",
					200: "#bfdbfe",
					300: "#93c5fd",
					400: "#60a5fa",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
					800: "#1e40af",
					900: "#1e3a8a",
				},
			},
			animation: {
				"pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
			keyframes: {
				"pulse-subtle": {
					"0%, 100%": {
						opacity: "1",
					},
					"50%": {
						opacity: "0.8",
					},
				},
			},
		},
	},
	plugins: [],
};
