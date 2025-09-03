import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for E2E Testing
 * Focused on smoke tests and critical user journeys
 * Optimized for speed and reliability
 */
export default defineConfig({
	// Test directory
	testDir: "./apps/web/tests/e2e",

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only, not locally
	retries: process.env.CI ? 1 : 0,

	// Opt out of parallel tests on CI for better stability
	workers: process.env.CI ? 1 : undefined,

	// Reporter configuration
	reporter: [
		["list"], // Console output
		[
			"html",
			{
				open: "never",
				outputFolder: "playwright-report",
			},
		],
		// Add JUnit reporter for CI
		...(process.env.CI
			? [["junit", { outputFile: "test-results/e2e-results.xml" }]]
			: []),
	],

	// Shared settings for all projects
	use: {
		// Base URL for tests
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",

		// Browser context options
		viewport: { width: 1280, height: 720 },

		// Collect trace when retrying the failed test
		trace: "on-first-retry",

		// Take screenshot only on failures
		screenshot: "only-on-failure",

		// Record video only on failure
		video: "retain-on-failure",

		// Global timeout for actions (clicks, fills, etc.)
		actionTimeout: 10 * 1000, // 10 seconds

		// Global timeout for navigation
		navigationTimeout: 30 * 1000, // 30 seconds

		// Ignore HTTPS errors for local development
		ignoreHTTPSErrors: true,
	},

	// Test timeout
	timeout: 60 * 1000, // 1 minute per test

	// Global setup timeout
	globalTimeout: 10 * 60 * 1000, // 10 minutes for all tests

	// Expect assertions timeout
	expect: {
		timeout: 10 * 1000, // 10 seconds
	},

	// Configure projects for major browsers
	projects: [
		{
			name: "smoke-chromium",
			testMatch: /.*\.spec\.ts/,
			grep: /@smoke/,
			use: {
				...devices["Desktop Chrome"],
				// Additional Chrome-specific settings
				launchOptions: {
					args: [
						"--disable-web-security",
						"--disable-dev-shm-usage",
						"--no-sandbox",
						"--disable-setuid-sandbox",
						"--disable-background-timer-throttling",
						"--disable-backgrounding-occluded-windows",
						"--disable-renderer-backgrounding",
					],
				},
			},
		},

		// Only run Firefox and Safari on full test runs (not smoke)
		{
			name: "firefox",
			testMatch: /.*\.spec\.ts/,
			testIgnore: /@smoke/,
			use: { ...devices["Desktop Firefox"] },
			// Only run Firefox in full CI, not on every PR
			metadata: { skip: process.env.CI && !process.env.FULL_TEST_SUITE },
		},

		{
			name: "webkit",
			testMatch: /.*\.spec\.ts/,
			testIgnore: /@smoke/,
			use: { ...devices["Desktop Safari"] },
			// Only run Safari in full CI, not on every PR
			metadata: { skip: process.env.CI && !process.env.FULL_TEST_SUITE },
		},

		// Mobile testing (optional, for specific mobile testing)
		{
			name: "mobile-chrome",
			testMatch: /.*\.mobile\.spec\.ts/,
			use: { ...devices["Pixel 5"] },
		},

		{
			name: "mobile-safari",
			testMatch: /.*\.mobile\.spec\.ts/,
			use: { ...devices["iPhone 12"] },
		},
	],

	// Web server configuration
	webServer: {
		command: "pnpm dev:web",
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000, // 2 minutes to start
		// stdout: 'pipe', // Uncomment to see server logs
		// stderr: 'pipe',
	},

	// Global setup/teardown
	globalSetup: require.resolve("./tests/harness/global-setup.ts"),
	globalTeardown: require.resolve("./tests/harness/global-teardown.ts"),

	// Output directories
	outputDir: "test-results/",

	// Test file patterns
	testMatch: ["**/*.spec.ts", "**/*.e2e.spec.ts"],

	// Ignore patterns
	testIgnore: [
		"**/*.unit.spec.ts",
		"**/*.integration.spec.ts",
		"**/*.contract.spec.ts",
	],
});
