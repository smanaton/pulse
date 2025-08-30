#!/usr/bin/env node

/**
 * Check Internal API Calls
 *
 * Validates that internal Convex API calls use proper imports and patterns,
 * not string literals which can break during refactoring.
 */

const fs = require("fs");
const path = require("path");

const CONVEX_DIR = path.join(__dirname, "..", "packages", "backend", "convex");
const BAD_PATTERNS = [
	// String literal internal calls
	/ctx\.run(?:Query|Mutation|Action)\(['"`]internal\./,
	// Old style API calls
	/ctx\.run(?:Query|Mutation|Action)\(['"`]api\./,
];

const GOOD_PATTERN =
	/import\s+\{[^}]*internal[^}]*\}\s+from\s+['"]\.\/_generated\/api['"]/;

function checkFile(filePath) {
	const content = fs.readFileSync(filePath, "utf-8");
	const fileName = path.basename(filePath);
	const errors = [];

	// Check for bad patterns
	BAD_PATTERNS.forEach((pattern, index) => {
		const matches = content.match(pattern);
		if (matches) {
			const lines = content.split("\n");
			matches.forEach((match) => {
				const lineNum = lines.findIndex((line) => line.includes(match)) + 1;
				errors.push({
					file: fileName,
					line: lineNum,
					issue: `String literal API call found: "${match.substring(0, 50)}..."`,
				});
			});
		}
	});

	// If file has internal calls, ensure proper import
	const hasInternalCall = /internal\.\w+\.\w+/.test(content);
	if (hasInternalCall && !GOOD_PATTERN.test(content)) {
		errors.push({
			file: fileName,
			issue:
				'Uses internal API but missing proper import from "./_generated/api"',
		});
	}

	return errors;
}

function scanConvexFiles() {
	const allErrors = [];

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
			} else if (
				file.endsWith(".ts") &&
				!file.endsWith(".test.ts") &&
				!file.endsWith(".d.ts")
			) {
				const errors = checkFile(filePath);
				allErrors.push(...errors);
			}
		}
	}

	if (!fs.existsSync(CONVEX_DIR)) {
		console.log("✓ Convex directory not found, skipping internal calls check");
		process.exit(0);
	}

	scanDir(CONVEX_DIR);

	if (allErrors.length > 0) {
		console.error("✗ Internal API call check failed:");
		allErrors.forEach((err) => {
			if (err.line) {
				console.error(`  - ${err.file}:${err.line} - ${err.issue}`);
			} else {
				console.error(`  - ${err.file} - ${err.issue}`);
			}
		});
		console.error(
			'\nFix: Use "import { internal } from "./_generated/api"" and call with internal.namespace.function',
		);
		process.exit(1);
	} else {
		console.log("✓ All internal API calls use proper imports");
	}
}

scanConvexFiles();
