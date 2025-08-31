#!/usr/bin/env node

/**
 * Check Convex Guard Patterns
 *
 * Validates that all Convex mutations and actions properly check workspace membership
 * and authentication before performing operations on workspace-scoped data.
 */

const fs = require("node:fs");
const path = require("node:path");

const CONVEX_DIR = path.join(__dirname, "..", "packages", "backend", "convex");
const IGNORE_FILES = [
	"_generated",
	"test.setup.ts",
	"auth.config.ts",
	"auth.ts",
	"http.ts",
];
const GUARD_PATTERNS = [
	/requireUserId/,
	/assertWriteEnabled/,
	/assertIsOwnerOrAdmin/,
	/assertMembership/,
	/checkRateLimit/,
];

function checkFile(filePath) {
	const content = fs.readFileSync(filePath, "utf-8");
	const fileName = path.basename(filePath);

	// Skip auth files and generated files
	if (IGNORE_FILES.some((ignore) => fileName.includes(ignore))) {
		return { passed: true };
	}

	// Check if file has mutations or actions
	const hasMutation = /\.mutation\(/g.test(content);
	const hasAction = /\.action\(/g.test(content);

	if (!hasMutation && !hasAction) {
		return { passed: true };
	}

	// Check if proper guards are in place
	const hasGuard = GUARD_PATTERNS.some((pattern) => pattern.test(content));

	if (!hasGuard) {
		return {
			passed: false,
			message: `${fileName}: Contains mutations/actions but no auth guards found`,
		};
	}

	// Check workspace-scoped operations have workspace checks
	const hasWorkspaceOp = /workspaceId/i.test(content);
	const hasWorkspaceCheck = /assert.*workspace|checkMembership/i.test(content);

	if (hasWorkspaceOp && !hasWorkspaceCheck) {
		return {
			passed: false,
			message: `${fileName}: Has workspace operations but no membership checks`,
		};
	}

	return { passed: true };
}

function scanConvexFiles() {
	const errors = [];

	function scanDir(dir) {
		const files = fs.readdirSync(dir);

		for (const file of files) {
			const filePath = path.join(dir, file);
			const stat = fs.statSync(filePath);

			if (
				stat.isDirectory() &&
				!file.startsWith("_") &&
				file !== "node_modules"
			) {
				scanDir(filePath);
			} else if (file.endsWith(".ts") && !file.endsWith(".test.ts")) {
				const result = checkFile(filePath);
				if (!result.passed) {
					errors.push(result.message);
				}
			}
		}
	}

	if (!fs.existsSync(CONVEX_DIR)) {
		console.log("✓ Convex directory not found, skipping guards check");
		process.exit(0);
	}

	scanDir(CONVEX_DIR);

	if (errors.length > 0) {
		console.error("✗ Convex guard check failed:");
		errors.forEach((err) => {
			console.error(`  - ${err}`);
		});
		process.exit(1);
	} else {
		console.log("✓ All Convex functions have proper auth guards");
	}
}

scanConvexFiles();
