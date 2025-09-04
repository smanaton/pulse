import { describe, expect, it } from "vitest";

describe("Chrome Extension", () => {
	it("should have chrome APIs available", () => {
		expect(chrome.runtime).toBeDefined();
		expect(chrome.storage).toBeDefined();
		expect(chrome.tabs).toBeDefined();
		expect(chrome.action).toBeDefined();
	});

	it("should have browser APIs available for Firefox compatibility", () => {
		expect(browser).toBeDefined();
		expect(browser).toBe(chrome);
	});
});