export default {
	providers: [
		{
			// The issuer must match the Convex server base URL (token iss/aud)
			domain: process.env.CONVEX_SITE_URL ?? "http://127.0.0.1:3210",
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
