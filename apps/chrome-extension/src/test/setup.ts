import "@testing-library/jest-dom";

// Mock chrome extension APIs
global.chrome = {
	runtime: {
		sendMessage: vitest.fn(),
		onMessage: {
			addListener: vitest.fn(),
			removeListener: vitest.fn(),
		},
		getURL: vitest.fn((path: string) => `chrome-extension://test-id/${path}`),
	},
	storage: {
		local: {
			get: vitest.fn(),
			set: vitest.fn(),
			remove: vitest.fn(),
		},
		sync: {
			get: vitest.fn(),
			set: vitest.fn(),
			remove: vitest.fn(),
		},
	},
	tabs: {
		query: vitest.fn(),
		sendMessage: vitest.fn(),
		create: vitest.fn(),
	},
	action: {
		setBadgeText: vitest.fn(),
		setBadgeBackgroundColor: vitest.fn(),
	},
} as any;

// Mock browser APIs for Firefox compatibility
global.browser = global.chrome;

// Mock webextension-polyfill
vitest.mock("webextension-polyfill", () => global.chrome);