/**
 * API Keys Management Functions
 *
 * Handles creation, validation, and management of device-scoped API keys
 * for extensions and integrations.
 */

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertMember, logEvent } from "./helpers";
import { requireUserId } from "./server/lib/authz";

// Crypto functions for key generation
const generateApiKey = async (): Promise<{
	key: string;
	hash: string;
	prefix: string;
}> => {
	// Generate a random API key
	const randomBytes = new Uint8Array(32);
	crypto.getRandomValues(randomBytes);

	// Convert to base64 and create key
	const keyData = Array.from(randomBytes, (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");

	const key = `pk_live_${keyData}`;
	const prefix = key.substring(0, 12); // pk_live_abc...

	// Create SHA-256 hash for storage
	const encoder = new TextEncoder();
	const data = encoder.encode(key);

	// Use Web Crypto API for hashing
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hash = Array.from(new Uint8Array(hashBuffer), (b) =>
		b.toString(16).padStart(2, "0"),
	).join("");

	return { key, hash, prefix };
};

/**
 * Generate a new API key for a user in a workspace
 */
export const generate = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
		device: v.string(),
		scopes: v.array(v.string()),
		expiresAt: v.optional(v.number()),
	},
	handler: async (ctx, { workspaceId, name, device, scopes, expiresAt }) => {
		const userId = await requireUserId(ctx);

		// Check permissions (admin or owner required for API key generation)
		await assertMember(ctx, workspaceId, "admin");

		// Validate inputs
		const sanitizedName = name.trim().substring(0, 100);
		if (!sanitizedName) {
			throw new ConvexError({
				code: "INVALID_ARGUMENT",
				message: "API key name is required",
			});
		}

		// Validate scopes
		const validScopes = [
			"clipper:write",
			"workspace:read",
			"ideas:read",
			"ideas:write",
			"tags:read",
		];

		for (const scope of scopes) {
			if (!validScopes.includes(scope)) {
				throw new ConvexError({
					code: "INVALID_ARGUMENT",
					message: `Invalid scope: ${scope}`,
				});
			}
		}

		// Generate the API key
		const { key, hash, prefix } = await generateApiKey();

		const now = Date.now();

		// Store the key
		const apiKeyId = await ctx.db.insert("apiKeys", {
			userId,
			workspaceId,
			name: sanitizedName,
			keyHash: hash,
			keyPrefix: prefix,
			device,
			scopes,
			expiresAt,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Log key creation
		await logEvent(ctx, workspaceId, "api_key_created", "apiKey", apiKeyId, {
			device,
			scopes,
			expiresAt,
		});

		// Return the key (only time it will be visible)
		return {
			id: apiKeyId,
			key, // Full key returned only on creation
			name: sanitizedName,
			prefix,
			scopes,
			device,
			createdAt: now,
		};
	},
});

/**
 * List API keys for a workspace
 */
export const list = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }) => {
		await assertMember(ctx, workspaceId, "admin");

		const apiKeys = await ctx.db
			.query("apiKeys")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.order("desc")
			.collect();

		// Return keys without the hash or full key
		return apiKeys.map((key) => ({
			id: key._id,
			name: key.name,
			prefix: key.keyPrefix,
			device: key.device,
			scopes: key.scopes,
			lastUsed: key.lastUsed,
			expiresAt: key.expiresAt,
			createdAt: key.createdAt,
		}));
	},
});

/**
 * Revoke an API key
 */
export const revoke = mutation({
	args: {
		apiKeyId: v.id("apiKeys"),
	},
	handler: async (ctx, { apiKeyId }) => {
		const userId = await requireUserId(ctx);

		const apiKey = await ctx.db.get(apiKeyId);
		if (!apiKey) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "API key not found",
			});
		}

		// Check permissions (admin/owner or key creator)
		if (apiKey.createdBy !== userId) {
			await assertMember(ctx, apiKey.workspaceId, "admin");
		}

		// Delete the key
		await ctx.db.delete(apiKeyId);

		// Log key revocation
		await logEvent(
			ctx,
			apiKey.workspaceId,
			"api_key_revoked",
			"apiKey",
			apiKeyId,
			{
				device: apiKey.device,
			},
		);
	},
});

/**
 * Validate an API key (for internal use)
 */
export const validate = query({
	args: {
		keyHash: v.string(),
	},
	handler: async (ctx, { keyHash }) => {
		const apiKey = await ctx.db
			.query("apiKeys")
			.withIndex("by_hash", (q) => q.eq("keyHash", keyHash))
			.unique();

		if (!apiKey) {
			return null;
		}

		// Check if expired
		if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
			return null;
		}

		// Get workspace and user info
		const workspace = await ctx.db.get(apiKey.workspaceId);
		const user = await ctx.db.get(apiKey.userId);

		if (!workspace || !user) {
			return null;
		}

		return {
			id: apiKey._id,
			userId: apiKey.userId,
			workspaceId: apiKey.workspaceId,
			scopes: apiKey.scopes,
			device: apiKey.device,
			workspace: {
				id: workspace._id,
				name: workspace.name,
				type: workspace.type,
			},
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		};
	},
});

/**
 * Update last used timestamp for an API key
 */
export const updateLastUsed = mutation({
	args: {
		apiKeyId: v.id("apiKeys"),
	},
	handler: async (ctx, { apiKeyId }) => {
		const now = Date.now();

		await ctx.db.patch(apiKeyId, {
			lastUsed: now,
			updatedAt: now,
		});
	},
});
