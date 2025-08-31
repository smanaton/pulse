#!/usr/bin/env node
/**
 * Cleanup script to remove symbolic links created for Convex package imports
 *
 * This script removes all symbolic links from the Convex lib directory.
 * Useful for cleaning up before switching branches or troubleshooting.
 */

const fs = require("node:fs");
const path = require("node:path");

const CONVEX_LIB_DIR = path.join(__dirname, "../packages/backend/convex/lib");

async function cleanupSymlinks() {
	console.log("🧹 Cleaning up symbolic links...\n");

	if (!fs.existsSync(CONVEX_LIB_DIR)) {
		console.log("ℹ️  No lib directory found, nothing to clean up.");
		return;
	}

	const entries = fs.readdirSync(CONVEX_LIB_DIR);
	let removedCount = 0;

	for (const entry of entries) {
		const entryPath = path.join(CONVEX_LIB_DIR, entry);

		try {
			const stats = fs.lstatSync(entryPath);

			if (stats.isSymbolicLink()) {
				fs.unlinkSync(entryPath);
				console.log(`🗑️  Removed symlink: ${entry}`);
				removedCount++;
			} else {
				console.log(`⚠️  Skipped non-symlink: ${entry}`);
			}
		} catch (error) {
			console.error(`❌ Failed to process ${entry}:`, error.message);
		}
	}

	// Remove lib directory if it's empty
	const remainingEntries = fs.readdirSync(CONVEX_LIB_DIR);
	if (remainingEntries.length === 0) {
		fs.rmdirSync(CONVEX_LIB_DIR);
		console.log("🗑️  Removed empty lib directory");
	}

	console.log(
		`\n✅ Cleanup complete! Removed ${removedCount} symbolic link(s).`,
	);
}

// Run the script
cleanupSymlinks().catch((error) => {
	console.error("❌ Script failed:", error);
	process.exit(1);
});
