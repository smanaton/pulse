export default {
	providers: [
		{
			// Prefer the frontend origin for cookie domain; fallback to Convex local URL
			domain: process.env.SITE_URL ?? process.env.CONVEX_SITE_URL,
			applicationID: "convex",
		},
		{
			domain: "https://accounts.google.com",
			applicationID: "google",
		},
		{
			domain: "https://github.com",
			applicationID: "github",
		},
	],
};
