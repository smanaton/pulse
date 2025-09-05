export default {
	providers: [
		{
			// Prefer the frontend origin for cookie domain; fallback to Convex local URL
			domain:
				process.env.SITE_URL?.replace("localhost", "127.0.0.1") ??
				process.env.CONVEX_SITE_URL,
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
