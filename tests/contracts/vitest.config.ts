export default {
	test: {
		environment: "node",
		globals: true,
		// Contract tests should be very fast
		slowTestThreshold: 100,
		testTimeout: 2000,
		// Contract test patterns
		include: [
			"**/*.contract.spec.ts",
		],
		// Performance optimizations for contract tests
		maxConcurrency: 10, // High concurrency for fast contract tests
	},
};