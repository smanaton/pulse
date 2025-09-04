/**
 * Skeleton loading utilities
 *
 * Best practices for skeleton keys:
 * - Use stable, predictable keys for static skeleton content
 * - Don't use useId() for array keys (React documentation)
 * - Don't use Math.random() or crypto.randomUUID() (performance overhead)
 * - Simple string keys are fine for skeletons since they're temporary placeholders
 */

let skeletonCounter = 0;

/**
 * Generate a unique skeleton key
 * Resets counter periodically to prevent memory issues
 */
export function generateSkeletonKey(prefix = "skeleton"): string {
	skeletonCounter = (skeletonCounter + 1) % 10000;
	return `${prefix}-${skeletonCounter}`;
}

/**
 * Create an array of skeleton keys for consistent rendering
 */
export function createSkeletonKeys(
	count: number,
	prefix = "skeleton",
): string[] {
	return Array.from({ length: count }, () => generateSkeletonKey(prefix));
}
