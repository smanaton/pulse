/**
 * Dependency Injection Container
 * 
 * Centralized service creation and dependency management for Convex functions.
 * This follows the dependency injection pattern to make the code more testable
 * and maintainable.
 */

import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "@pulse/core";
import type { IBusinessContext } from "@pulse/core/ideas/interfaces";
import { createRepositories, type IRepositoryContainer } from "../adapters/repositories";
import { createServices, type IServiceContainer } from "@pulse/core/ideas/services";

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

export class ContainerFactory {
	/**
	 * Create a complete application container with all dependencies
	 */
	static async create(
		ctx: MutationCtx | QueryCtx,
		userId: Id<"users">,
		workspaceId?: Id<"workspaces">
	): Promise<IAppContainer> {
		// Create business context
		const businessContext = await ContainerFactory.createBusinessContext(
			ctx,
			userId,
			workspaceId
		);
		
		// Create repositories with Convex context
		const repositories = createRepositories(ctx);
		
		// Create services with repositories and business context
		const services = createServices(repositories, businessContext);
		
		return {
			repositories,
			services,
			context: businessContext,
		};
	}
	
	/**
	 * Create business context with user role lookup
	 */
	private static async createBusinessContext(
		ctx: MutationCtx | QueryCtx,
		userId: Id<"users">,
		workspaceId?: Id<"workspaces">
	): Promise<IBusinessContext> {
		let userRole: string | undefined;
		
		// Get user's role in the workspace if provided
		if (workspaceId) {
			const membership = await ctx.db
				.query("workspaceMembers")
				.withIndex("by_workspace_user", (q) => 
					q.eq("workspaceId", workspaceId).eq("userId", userId)
				)
				.first();
			userRole = membership?.role;
		}
		
		return {
			userId,
			workspaceId,
			userRole,
		};
	}
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
export class ServiceLocator {
	private static containers = new Map<string, IAppContainer>();
	
	/**
	 * Get or create a container for the current request context
	 */
	static async getContainer(
		ctx: MutationCtx | QueryCtx,
		userId: Id<"users">,
		workspaceId?: Id<"workspaces">
	): Promise<IAppContainer> {
		const key = this.createKey(userId, workspaceId);
		
		if (!this.containers.has(key)) {
			const container = await ContainerFactory.create(ctx, userId, workspaceId);
			this.containers.set(key, container);
		}
		
		return this.containers.get(key)!;
	}
	
	/**
	 * Clear container cache (call at end of request)
	 */
	static clearCache(): void {
		this.containers.clear();
	}
	
	private static createKey(userId: Id<"users">, workspaceId?: Id<"workspaces">): string {
		return `${userId}-${workspaceId || 'no-workspace'}`;
	}
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
	ctx: MutationCtx | QueryCtx,
	workspaceId?: Id<"workspaces">
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
export function withContainer<T extends any[], R>(
	handler: (container: IAppContainer, ...args: T) => Promise<R>
) {
	return async (ctx: MutationCtx | QueryCtx, ...args: T): Promise<R> => {
		// Extract userId from context (implementation depends on auth setup)
		const userId = await extractUserId(ctx);
		const workspaceId = extractWorkspaceId(args);
		
		const container = await ContainerFactory.create(ctx, userId, workspaceId);
		
		try {
			return await handler(container, ...args);
		} finally {
			// Cleanup if needed
			ServiceLocator.clearCache();
		}
	};
}

// ============================================================================
// Helper Functions (would need proper implementation)
// ============================================================================

async function extractUserId(ctx: MutationCtx | QueryCtx): Promise<Id<"users">> {
	// This would use your actual auth implementation
	throw new Error("Implement userId extraction from context");
}

function extractWorkspaceId(args: any[]): Id<"workspaces"> | undefined {
	// Extract workspaceId from function arguments
	const firstArg = args[0];
	return firstArg?.workspaceId;
}