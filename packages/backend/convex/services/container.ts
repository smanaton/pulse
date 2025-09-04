/**
 * Dependency Injection Container
 *
 * Centralized service creation and dependency management for Convex functions.
 * This follows the dependency injection pattern to make the code more testable
 * and maintainable.
 */

import type { Id } from "@pulse/core";
import type { IBusinessContext } from "@pulse/core/ideas/interfaces";
import {
	createServices,
	type IServiceContainer,
} from "@pulse/core/ideas/services";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
	createRepositories,
	type IRepositoryContainer,
} from "../adapters/repositories";

// ============================================================================
// Application Container Interface
// ============================================================================

export interface IAppContainer {
	repositories: IRepositoryContainer;
	services: IServiceContainer;
	context: IBusinessContext;
}

// ============================================================================
// Container Factory
// ============================================================================

/**
 * Create a complete application container with all dependencies
 */
export async function createAppContainer(
	ctx: MutationCtx | QueryCtx,
	userId: Id<"users">,
	workspaceId?: Id<"workspaces">,
): Promise<IAppContainer> {
	const businessContext = await createBusinessContext(ctx, userId, workspaceId);
	const repositories = createRepositories(ctx);
	const services = createServices(repositories, businessContext);
	return { repositories, services, context: businessContext };
}

/**
 * Create business context with user role lookup
 */
async function createBusinessContext(
	ctx: MutationCtx | QueryCtx,
	userId: Id<"users">,
	workspaceId?: Id<"workspaces">,
): Promise<IBusinessContext> {
	let userRole: string | undefined;
	if (workspaceId) {
		const membership = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_user", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.first();
		userRole = membership?.role;
	}
	return { userId, workspaceId, userRole };
}

// ============================================================================
// Service Locator Pattern (Alternative approach)
// ============================================================================

/**
 * Service locator for simple dependency access
 *
 * This provides a simpler alternative to full DI for cases where
 * you just need quick access to services.
 */
const containers = new Map<string, IAppContainer>();

/** Get or create a container for the current request context */
export async function getContainer(
	ctx: MutationCtx | QueryCtx,
	userId: Id<"users">,
	workspaceId?: Id<"workspaces">,
): Promise<IAppContainer> {
	const key = `${userId}-${workspaceId || "no-workspace"}`;
	if (!containers.has(key)) {
		const container = await createAppContainer(ctx, userId, workspaceId);
		containers.set(key, container);
	}
	const c = containers.get(key);
	if (!c) throw new Error("Container not initialized");
	return c;
}

/** Clear container cache (call at end of request) */
export function clearContainerCache(): void {
	containers.clear();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Helper function for creating containers in Convex functions
 *
 * Usage:
 * ```typescript
 * export const myFunction = mutation({
 *   handler: async (ctx, args) => {
 *     const container = await createContainer(ctx, args.workspaceId);
 *     return await container.services.ideaService.create(args);
 *   }
 * });
 * ```
 */
export async function createContainer(
	_ctx: MutationCtx | QueryCtx,
	_workspaceId?: Id<"workspaces">,
): Promise<IAppContainer> {
	// Note: This would need to extract userId from context
	// For now, assuming it's available in the calling function
	throw new Error("Use ContainerFactory.create() with explicit userId");
}

/**
 * Decorator pattern for automatic container injection
 *
 * This could be used to automatically inject dependencies into
 * Convex function handlers.
 */
export function withContainer<T extends unknown[], R>(
	handler: (container: IAppContainer, ...args: T) => Promise<R>,
) {
	return async (ctx: MutationCtx | QueryCtx, ...args: T): Promise<R> => {
		// Extract userId from context (implementation depends on auth setup)
		const userId = await extractUserId(ctx);
		const workspaceId = extractWorkspaceId(args);

		const container = await createAppContainer(ctx, userId, workspaceId);

		try {
			return await handler(container, ...args);
		} finally {
			// Cleanup if needed
			clearContainerCache();
		}
	};
}

// ============================================================================
// Helper Functions (would need proper implementation)
// ============================================================================

async function extractUserId(
	_ctx: MutationCtx | QueryCtx,
): Promise<Id<"users">> {
	// This would use your actual auth implementation
	throw new Error("Implement userId extraction from context");
}

function extractWorkspaceId(args: unknown[]): Id<"workspaces"> | undefined {
	// Extract workspaceId from function arguments
	const firstArg = args[0];
	if (firstArg && typeof firstArg === "object" && "workspaceId" in firstArg) {
		const ws = (firstArg as { workspaceId?: Id<"workspaces"> }).workspaceId;
		return ws;
	}
	return undefined;
}
