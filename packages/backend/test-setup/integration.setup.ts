/**
 * Integration Test Setup
 *
 * This file runs before integration tests and verifies that required
 * environment variables are set. Integration tests require a real
 * Convex deployment and auth configuration.
 */

import { beforeAll } from "vitest";

beforeAll(() => {
	const requiredEnvVars = {
		CONVEX_TEST_URL: process.env.CONVEX_TEST_URL,
		// Add other required vars as needed
		// TEST_AUTH_TOKEN: process.env.TEST_AUTH_TOKEN,
	};

	const missing = Object.entries(requiredEnvVars)
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missing.length > 0) {
		console.log(`
⚠️  Integration tests require environment variables:

Missing variables: ${missing.join(", ")}

To run integration tests:
1. Set up a test deployment: npx convex dev --name pulse-test  
2. Set environment variables in .env.test:
   CONVEX_TEST_URL=https://your-test-deployment.convex.cloud
   
3. Run integration tests: npm run test:integration

Skipping integration tests...
`);
	}
});
