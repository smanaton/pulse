// Convex client for Chrome extension using HTTP endpoints for API key auth
export function createConvexClient(apiKey: string) {
	// Use Vite's import.meta.env which works in the browser
	// Falls back to local dev server if not configured
	const convexUrl = import.meta.env?.VITE_CONVEX_URL || "http://127.0.0.1:3210";

	const baseHeaders = {
		Authorization: `Bearer ${apiKey}`,
		"Content-Type": "application/json",
	};


	return {
		// Helper methods for common operations using HTTP endpoints
		async saveWebClip(data: {
			workspaceId: string;
			url: string;
			title: string;
			content: string;
			metadata?: any;
			tags?: string[];
		}) {
			try {

				const response = await fetch(`${convexUrl}/api/clipper/capture`, {
					method: "POST",
					headers: baseHeaders,
					body: JSON.stringify({
						workspaceId: data.workspaceId,
						url: data.url,
						title: data.title,
						content: data.content,
						tags: data.tags,
						type: "bookmark", // Default capture type
						destination: "new",
					}),
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`HTTP ${response.status}: ${errorText}`);
				}

				const result = await response.json();
				return result.taskId || result.ideaId; // Return task ID or idea ID
			} catch (error) {
				console.error("saveWebClip failed:", error);
				throw error;
			}
		},

		async appendToIdea(data: {
			ideaId: string;
			content: string;
			metadata?: any;
		}) {
			try {

				const response = await fetch(`${convexUrl}/api/clipper/capture`, {
					method: "POST",
					headers: baseHeaders,
					body: JSON.stringify({
						url: "https://extension.append",
						title: "Appended Content",
						content: data.content,
						type: "append",
						destination: "existing",
						targetIdeaId: data.ideaId,
					}),
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`HTTP ${response.status}: ${errorText}`);
				}

				const result = await response.json();
				return result.taskId || data.ideaId;
			} catch (error) {
				console.error("appendToIdea failed:", error);
				throw error;
			}
		},

		async getUserWorkspaces() {
			try {

				const response = await fetch(`${convexUrl}/api/clipper/auth`, {
					method: "POST",
					headers: baseHeaders,
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`HTTP ${response.status}: ${errorText}`);
				}

				const authInfo = await response.json();

				// Return workspaces array with the authenticated workspace
				return [
					{
						_id: authInfo.workspace.id,
						name: authInfo.workspace.name,
						type: authInfo.workspace.type,
						isDefault: true,
					},
				];
			} catch (error) {
				console.error("getUserWorkspaces failed:", error);
				throw error;
			}
		},

		async getRecentIdeas(workspaceId: string, limit = 10) {
			// For now, return empty array as this would need a separate HTTP endpoint
			// This is used for the "existing note" dropdown
			try {
				console.log(
					"getRecentIdeas called, returning empty array (not implemented via HTTP)",
				);
				return [];
			} catch (error) {
				console.error("getRecentIdeas failed:", error);
				return [];
			}
		},

		async validateApiKey() {
			try {

				const response = await fetch(`${convexUrl}/api/clipper/auth`, {
					method: "POST",
					headers: baseHeaders,
				});

				const isValid = response.ok;
				return isValid;
			} catch (error) {
				console.error("API key validation failed:", error);
				return false;
			}
		},
	};
}

// Content extraction utilities
export function extractPageContent() {
	// Get page title
	const title =
		document.title || document.querySelector("h1")?.textContent || "Untitled";

	// Get selected text if any
	const selection = window.getSelection()?.toString().trim() || "";

	// Get meta description
	const metaDescription =
		document
			.querySelector('meta[name="description"]')
			?.getAttribute("content") || "";

	// Get basic page content (we'll enhance this later)
	const content = selection || metaDescription || "";

	return {
		url: window.location.href,
		title: title.trim(),
		content: content.trim(),
		selection: selection,
		metadata: {
			description: metaDescription,
			domain: window.location.hostname,
			timestamp: new Date().toISOString(),
		},
	};
}

export function formatContentAsMarkdown(data: {
	url: string;
	title: string;
	content: string;
	selection?: string;
	metadata?: any;
}): string {
	let markdown = `# ${data.title}\n\n`;

	// Add source URL
	markdown += `**Source:** [${data.metadata?.domain || new URL(data.url).hostname}](${data.url})\n\n`;

	// Add content
	if (data.selection) {
		markdown += `## Selected Text\n\n> ${data.selection}\n\n`;
	} else if (data.content) {
		markdown += `${data.content}\n\n`;
	}

	// Add metadata
	if (data.metadata?.description) {
		markdown += `**Description:** ${data.metadata.description}\n\n`;
	}

	markdown += `---\n*Clipped on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`;

	return markdown;
}
