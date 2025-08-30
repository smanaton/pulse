import browser from "webextension-polyfill";
import { createConvexClient, formatContentAsMarkdown } from "../lib/convex";

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
	console.log("Pulse Web Clipper installed");

	// Create context menu
	chrome.contextMenus.create({
		id: "pulse-clip",
		title: "Clip to Pulse",
		contexts: ["page", "selection", "link"],
	});
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.action) {
		case "capture":
			handleCapture(message.data)
				.then((result) => {
					sendResponse({ success: true, result });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Indicates we will send a response asynchronously
		case "auth":
			handleAuth(message.data)
				.then((result) => {
					sendResponse({ success: true, result });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Indicates we will send a response asynchronously
		case "captureVisibleTab":
			handleCaptureVisibleTab()
				.then((result) => {
					sendResponse(result);
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Indicates we will send a response asynchronously
		case "getWorkspaces":
			handleGetWorkspaces()
				.then((result) => {
					sendResponse({ success: true, workspaces: result });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Indicates we will send a response asynchronously
		case "getRecentIdeas":
			handleGetRecentIdeas(message.data)
				.then((result) => {
					sendResponse({ success: true, ideas: result });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Indicates we will send a response asynchronously
		default:
			console.warn("Unknown message action:", message.action);
	}
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "pulse-clip") {
		handleCapture({
			url: tab?.url,
			title: tab?.title,
			type: info.selectionText ? "selection" : "bookmark",
			selection: info.selectionText,
		});
	}
});

async function handleCapture(data: any) {
	try {
		console.log("Handling capture:", data);

		// Check authentication
		const authResult = await browser.storage.local.get(["pulseAuth"]);
		if (!authResult.pulseAuth?.token) {
			throw new Error("Not authenticated");
		}

		// Create Convex client with API key
		const convex = createConvexClient(authResult.pulseAuth.token);

		// Determine target workspace
		let targetWorkspace;

		if (data.selectedWorkspace) {
			// Use specifically selected workspace
			const workspaces = await convex.getUserWorkspaces();
			targetWorkspace = workspaces.find(
				(w: any) => w._id === data.selectedWorkspace,
			);

			if (!targetWorkspace) {
				throw new Error("Selected workspace not found");
			}
		} else {
			// Fallback to default workspace
			const workspaces = await convex.getUserWorkspaces();
			targetWorkspace =
				workspaces.find((w: any) => w.isDefault) || workspaces[0];

			if (!targetWorkspace) {
				throw new Error("No workspace found");
			}
		}

		// Get current tab for content extraction
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		const contentData = {
			url: data.url,
			title: data.title || "Untitled",
			content: "",
			selection: data.selection || "",
			metadata: {
				captureType: data.type,
				domain: new URL(data.url).hostname,
				timestamp: new Date().toISOString(),
			},
		};

		// Handle different capture types
		switch (data.type) {
			case "bookmark":
				contentData.content = `Bookmark saved from ${contentData.metadata.domain}`;
				break;

			case "selection":
				if (data.selection) {
					contentData.content = data.selection;
				} else {
					// Try to get current selection from content script
					try {
						const response = await chrome.tabs.sendMessage(tab?.id || 0, {
							action: "getSelection",
						});
						contentData.selection = response.selection || "";
						contentData.content =
							contentData.selection ||
							`Selection from ${contentData.metadata.domain}`;
					} catch (error) {
						contentData.content = `Selection from ${contentData.metadata.domain}`;
					}
				}
				break;

			case "article":
				// Extract full page content using content script
				try {
					const response = await chrome.tabs.sendMessage(tab?.id || 0, {
						action: "extractContent",
					});
					if (response.success) {
						contentData.content = response.content.content;
						contentData.selection = response.content.selection;
						contentData.metadata = {
							...contentData.metadata,
							...response.content.metadata,
						};
					} else {
						contentData.content = `Article content from ${contentData.metadata.domain}`;
					}
				} catch (error) {
					console.warn(
						"Content extraction failed, using basic content:",
						error,
					);
					contentData.content = `Article content from ${contentData.metadata.domain}`;
				}
				break;

			case "screenshot":
				// Handle screenshot capture
				try {
					const screenshotResponse = await handleCaptureVisibleTab();
					if (screenshotResponse.success) {
						contentData.content = `Screenshot captured from ${contentData.metadata.domain}`;
						contentData.metadata = {
							...contentData.metadata,
							screenshot: screenshotResponse.dataUrl,
						};
					} else {
						throw new Error(screenshotResponse.error);
					}
				} catch (error) {
					throw new Error(
						`Screenshot capture failed: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
				break;

			default:
				contentData.content = `Page saved from ${contentData.metadata.domain}`;
		}

		const markdownContent = formatContentAsMarkdown(contentData);

		let ideaId: string;

		if (data.destination === "existing" && data.selectedNote) {
			// Append to existing idea
			ideaId = await convex.appendToIdea({
				ideaId: data.selectedNote,
				content: markdownContent,
				metadata: contentData.metadata,
			});
		} else {
			// Create new idea
			ideaId = await convex.saveWebClip({
				workspaceId: targetWorkspace._id,
				url: data.url,
				title: data.title || "Untitled",
				content: markdownContent,
				metadata: contentData.metadata,
				tags: data.tags || [],
			});
		}

		// Show success notification
		chrome.notifications.create({
			type: "basic",
			iconUrl: "public/icons/icon-48.png",
			title: "Pulse Web Clipper",
			message: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} saved to Pulse: ${data.title || "Untitled"}`,
		});

		console.log("Capture successful, idea ID:", ideaId);
		return { success: true, ideaId };
	} catch (error) {
		console.error("Capture failed:", error);

		// Show error notification
		chrome.notifications.create({
			type: "basic",
			iconUrl: "public/icons/icon-48.png",
			title: "Pulse Web Clipper",
			message: `Capture failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		});

		throw error;
	}
}

async function handleAuth(data: any) {
	try {
		console.log("Handling auth:", data);

		if (data.type === "logout") {
			await browser.storage.local.remove(["pulseAuth"]);
			return { type: "logout", success: true };
		}

		// For web app authentication
		if (data.type === "pat") {
			// Open the web app for authentication instead of direct API call
			const webAppUrl = "http://localhost:3003";
			console.log("Redirecting to web app for authentication:", webAppUrl);

			// Open the web app in a new tab for user to authenticate
			chrome.tabs.create({
				url: `${webAppUrl}/auth/sign-in?extension=true`,
				active: true,
			});

			return {
				type: "redirect",
				success: true,
				message:
					"Please sign in to Pulse in the opened tab, then return to the extension.",
			};
		}

		// API key authentication
		if (data.type === "api_key" && data.token) {
			try {
				// Create Convex client and validate the API key
				const convex = createConvexClient(data.token);
				const isValid = await convex.validateApiKey();

				if (!isValid) {
					throw new Error("Invalid API key");
				}

				// Get user info and workspaces
				const [user, workspaces] = await Promise.all([
					convex.client.query("users:getCurrentUser" as any),
					convex.getUserWorkspaces(),
				]);

				const defaultWorkspace =
					workspaces.find((w: any) => w.isDefault) || workspaces[0];

				const authData = {
					token: data.token,
					user: {
						name: user?.name || "Pulse User",
						email: user?.email || "user@pulse.app",
					},
					workspace: {
						id: defaultWorkspace?._id || "default",
						name: defaultWorkspace?.name || "Default Workspace",
					},
					authenticatedAt: Date.now(),
				};

				await browser.storage.local.set({
					pulseAuth: authData,
				});

				console.log("API key validated and stored successfully");
				return { type: "api_key", success: true, authData };
			} catch (error) {
				console.error("API key validation failed:", error);
				throw new Error(
					`Authentication failed: ${error instanceof Error ? error.message : "Invalid API key"}`,
				);
			}
		}

		throw new Error("Invalid auth data");
	} catch (error) {
		console.error("Auth failed:", error);
		throw error;
	}
}

// Handle capture visible tab for screenshots
async function handleCaptureVisibleTab() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab || !tab.id) {
			throw new Error("No active tab found");
		}

		const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
			format: "png",
			quality: 90,
		});

		return { success: true, dataUrl };
	} catch (error) {
		console.error("Screenshot capture failed:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Screenshot capture failed",
		};
	}
}

// Handle getting workspaces
async function handleGetWorkspaces() {
	const authResult = await browser.storage.local.get(["pulseAuth"]);
	if (!authResult.pulseAuth?.token) {
		throw new Error("Not authenticated");
	}

	const convex = createConvexClient(authResult.pulseAuth.token);
	return await convex.getUserWorkspaces();
}

// Handle getting recent ideas
async function handleGetRecentIdeas(data: {
	workspaceId: string;
	limit?: number;
}) {
	const authResult = await browser.storage.local.get(["pulseAuth"]);
	if (!authResult.pulseAuth?.token) {
		throw new Error("Not authenticated");
	}

	const convex = createConvexClient(authResult.pulseAuth.token);
	return await convex.getRecentIdeas(data.workspaceId, data.limit || 10);
}

async function getPulseApiUrl(): Promise<string> {
	// Get saved API URL from storage
	const result = await browser.storage.local.get(["pulseApiUrl"]);
	return result.pulseApiUrl || "http://127.0.0.1:3210";
}
