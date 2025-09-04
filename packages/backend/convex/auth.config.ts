export default {
	providers: [
		{
			domain: process.env.CONVEX_SITE_URL,
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
