import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * API Key authentication helper
 * Note: This function creates the hash but validation must happen in httpAction context
 */
function _extractAndHashApiKey(request: Request): string {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new Error("Missing or invalid Authorization header");
	}

	const token = authHeader.substring(7);

	// For API key validation, we'll extract the prefix and key
	// The actual validation happens in the httpAction with database access
	return token;
}

async function sha256Hex(input: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hashBuffer), (b) =>
		b.toString(16).padStart(2, "0"),
	).join("");
}

/**
 * Authentication endpoint for extension
 */
http.route({
	path: "/api/clipper/auth",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		try {
			const authHeader = request.headers.get("Authorization");
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return new Response("Unauthorized", { status: 401 });
			}

			const token = authHeader.substring(7);

			// Hash the token for validation
			const keyHash = await sha256Hex(token);

			// Validate the API key
			const authInfo = await ctx.runQuery(api.apiKeys.validate, { keyHash });

			if (!authInfo) {
				return new Response("Invalid API key", { status: 401 });
			}

			// Update last used timestamp
			await ctx.runMutation(api.apiKeys.updateLastUsed, {
				apiKeyId: authInfo.id,
			});

			// Return auth info
			return new Response(
				JSON.stringify({
					user: authInfo.user,
					workspace: authInfo.workspace,
					scopes: authInfo.scopes,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			console.error("Auth failed:", error);
			return new Response("Authentication failed", { status: 401 });
		}
	}),
});

/**
 * Capture endpoint for web content
 */
http.route({
	path: "/api/clipper/capture",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		try {
			// Authenticate request
			const authHeader = request.headers.get("Authorization");
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return new Response("Unauthorized", { status: 401 });
			}

			const token = authHeader.substring(7);

			// Hash the token for validation
			const keyHash = await sha256Hex(token);

			// Validate the API key
			const authInfo = await ctx.runQuery(api.apiKeys.validate, { keyHash });

			if (!authInfo) {
				return new Response("Invalid API key", { status: 401 });
			}

			// Check scopes
			if (!authInfo.scopes.includes("clipper:write")) {
				return new Response("Insufficient permissions", { status: 403 });
			}

			// Parse request body
			const body = await request.json();

			// Validate required fields
			if (!body.url) {
				return new Response("URL is required", { status: 400 });
			}

			// Create clipper task
			const result = await ctx.runAction(api.clipper.createTask, {
				workspaceId: body.workspaceId || authInfo.workspaceId,
				url: body.url,
				title: body.title,
				selection: body.selection,
				screenshot: body.screenshot,
				captureType: body.type || "quick",
				destination: body.destination || "new",
				targetIdeaId: body.targetIdeaId,
				tags: body.tags || [],
			});

			// Update API key usage
			await ctx.runMutation(api.apiKeys.updateLastUsed, {
				apiKeyId: authInfo.id,
			});

			return new Response(JSON.stringify(result), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Capture failed:", error);
			return new Response(
				"Capture failed: " +
					(error instanceof Error ? error.message : "Unknown error"),
				{
					status: 500,
				},
			);
		}
	}),
});

/**
 * Task status endpoint
 */
http.route({
	path: "/api/clipper/task/:taskId",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		try {
			// Authenticate request
			const authHeader = request.headers.get("Authorization");
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return new Response("Unauthorized", { status: 401 });
			}

			const token = authHeader.substring(7);

			// Hash the token for validation
			const keyHash = await sha256Hex(token);

			// Validate the API key
			const authInfo = await ctx.runQuery(api.apiKeys.validate, { keyHash });

			if (!authInfo) {
				return new Response("Invalid API key", { status: 401 });
			}

			// Get task ID from URL
			const url = new URL(request.url);
			const taskId = url.pathname.split("/").pop();

			if (!taskId) {
				return new Response("Task ID required", { status: 400 });
			}

			// Get task status
			const status = await ctx.runQuery(api.clipper.getTaskStatus, {
				taskId: taskId as Id<"clipperTasks">,
			});

			return new Response(JSON.stringify(status), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Failed to get task status:", error);
			return new Response("Failed to get task status", { status: 500 });
		}
	}),
});

export default http;

// Export individual routes for debugging
export { http };
