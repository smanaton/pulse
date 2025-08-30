#!/usr/bin/env node
/**
 * Setup script to create symbolic links for Convex package imports
 *
 * This script creates symbolic links in the Convex directory that point
 * to our modular packages, allowing Convex's bundler to resolve imports
 * while maintaining our clean modular architecture.
 */

const fs = require("fs");
const path = require("path");

const CONVEX_LIB_DIR = path.join(__dirname, "../packages/backend/convex/lib");
const PACKAGES_DIR = path.join(__dirname, "../packages");

const SYMLINK_CONFIG = [
	{
		name: "core",
		source: path.join(PACKAGES_DIR, "core/src"),
		target: path.join(CONVEX_LIB_DIR, "core"),
	},
	{
		name: "ideas-logic",
		source: path.join(PACKAGES_DIR, "ideas-logic/src"),
		target: path.join(CONVEX_LIB_DIR, "ideas-logic"),
	},
];

async function createSymlinks() {
	console.log("🔗 Setting up symbolic links for Convex packages...\n");

	// Ensure lib directory exists
	if (!fs.existsSync(CONVEX_LIB_DIR)) {
		fs.mkdirSync(CONVEX_LIB_DIR, { recursive: true });
		console.log(`✅ Created directory: ${CONVEX_LIB_DIR}`);
	}

	for (const config of SYMLINK_CONFIG) {
		const { name, source, target } = config;

		try {
			// Check if source exists
			if (!fs.existsSync(source)) {
				console.error(`❌ Source directory not found: ${source}`);
				process.exit(1);
			}

			// Remove existing symlink if it exists
			if (fs.existsSync(target)) {
				const stats = fs.lstatSync(target);
				if (stats.isSymbolicLink()) {
					fs.unlinkSync(target);
					console.log(`🗑️  Removed existing symlink: ${name}`);
				} else {
					console.error(`❌ Target exists but is not a symlink: ${target}`);
					process.exit(1);
				}
			}

			// Create symlink
			const relativePath = path.relative(path.dirname(target), source);
			fs.symlinkSync(relativePath, target, "dir");
			console.log(`✅ Created symlink: ${name} -> ${relativePath}`);
		} catch (error) {
			console.error(`❌ Failed to create symlink for ${name}:`, error.message);
			process.exit(1);
		}
	}

	console.log("\n🎉 All symbolic links created successfully!");
	console.log("\nYou can now import packages in Convex functions like:");
	console.log('  import { ... } from "./lib/core/..."');
	console.log('  import { ... } from "./lib/ideas-logic/..."');
}

// Run the script
createSymlinks().catch((error) => {
	console.error("❌ Script failed:", error);
	process.exit(1);
});
