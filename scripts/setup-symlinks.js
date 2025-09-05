#!/usr/bin/env node
/**
 * Setup script to create symbolic links for Convex package imports
 *
 * This script creates symbolic links in the Convex directory that point
 * to our modular packages, allowing Convex's bundler to resolve imports
 * while maintaining our clean modular architecture.
 */

const fs = require("node:fs");
const path = require("node:path");

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

			// Remove existing symlink if it exists; if it's a real dir, skip to avoid data loss
			if (fs.existsSync(target)) {
				const stats = fs.lstatSync(target);
				if (stats.isSymbolicLink()) {
					fs.unlinkSync(target);
					console.log(`🗑️  Removed existing symlink: ${name}`);
				} else if (stats.isDirectory()) {
					console.log(`ℹ️  Target directory already exists (not a symlink): ${target} — skipping`);
					continue;
				} else {
					console.error(`❌ Target exists and is not a symlink/dir: ${target}`);
					process.exit(1);
				}
			}

			// Create symlink
			const relativePath = path.relative(path.dirname(target), source);
			// On Windows, use 'junction' for directory links
			const type = process.platform === 'win32' ? 'junction' : 'dir';
			fs.symlinkSync(relativePath, target, type);
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
