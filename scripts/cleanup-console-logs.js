#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Removes development console.log statements while preserving console.error, console.warn, etc.
 * Also preserves console.log statements that appear to be intentional (not debug-style).
 */

const PRESERVED_CONSOLE_METHODS = ["error", "warn", "info"];
const EXTENSIONS = ["ts", "tsx", "js", "jsx"];

function shouldPreserveLine(line, context = {}) {
	const trimmed = line.trim();

	// Preserve non-console.log statements
	if (!trimmed.includes("console.log")) {
		return true;
	}

	// Preserve console.error, console.warn, etc.
	for (const method of PRESERVED_CONSOLE_METHODS) {
		if (trimmed.includes(`console.${method}`)) {
			return true;
		}
	}

	// Skip lines that are commented out
	if (trimmed.startsWith("//")) {
		return true;
	}

	// Preserve console.log in comments
	if (trimmed.includes("// console.log")) {
		return true;
	}

	// Remove typical debug patterns
	const debugPatterns = [
		/console\.log\(['"`][^'"`]*['"`]\s*,/, // console.log("debug:",
		/console\.log\(['"`].*debug.*['"`]/i, // console.log("debug something")
		/console\.log\(['"`].*log.*['"`]/i, // console.log("logging something")
		/console\.log\(.*\bctx\b.*\)/, // console.log(ctx, ...)
		/console\.log\(.*\bargs\b.*\)/, // console.log(args, ...)
		/console\.log\(.*\bresult\b.*\)/, // console.log(result, ...)
		/console\.log\(.*\bresponse\b.*\)/, // console.log(response, ...)
		/console\.log\(.*\berror\b.*\)/, // console.log(error, ...)
		/console\.log\(.*\bdata\b.*\)/, // console.log(data, ...)
		/console\.log\(['"`].*['"`]\s*\);?\s*$/, // Simple string-only logs
	];

	return !debugPatterns.some((pattern) => pattern.test(trimmed));
}

function cleanupFile(filePath) {
	try {
		const content = fs.readFileSync(filePath, "utf8");
		const lines = content.split("\n");

		let modified = false;
		const newLines = lines.filter((line, index) => {
			const shouldPreserve = shouldPreserveLine(line, {
				filePath,
				lineNumber: index + 1,
				previousLine: lines[index - 1],
				nextLine: lines[index + 1],
			});

			if (!shouldPreserve) {
				modified = true;
				console.log(`Removing from ${filePath}:${index + 1}: ${line.trim()}`);
			}

			return shouldPreserve;
		});

		if (modified) {
			fs.writeFileSync(filePath, newLines.join("\n"));
			console.log(`✓ Cleaned ${filePath}`);
			return true;
		}

		return false;
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error.message);
		return false;
	}
}

function findFiles(dir, extensions, excludes = []) {
	const files = [];

	function traverse(currentDir) {
		try {
			const items = fs.readdirSync(currentDir);

			for (const item of items) {
				const fullPath = path.join(currentDir, item);
				const relativePath = path.relative(process.cwd(), fullPath);

				// Skip excluded directories
				if (excludes.some((exclude) => relativePath.includes(exclude))) {
					continue;
				}

				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					traverse(fullPath);
				} else if (stat.isFile()) {
					const ext = path.extname(fullPath).slice(1);
					if (extensions.includes(ext)) {
						files.push(fullPath);
					}
				}
			}
		} catch (error) {
			// Skip inaccessible directories
		}
	}

	traverse(dir);
	return files;
}

function main() {
	const targetDirs = [
		"packages/backend/convex",
		"apps/web/src",
		"apps/chrome-extension/src",
	];

	const excludes = ["node_modules", "dist", "_generated", ".git"];

	let totalFiles = 0;
	let modifiedFiles = 0;

	targetDirs.forEach((dir) => {
		const fullDir = path.resolve(dir);
		if (fs.existsSync(fullDir)) {
			const files = findFiles(fullDir, EXTENSIONS, excludes);

			files.forEach((file) => {
				totalFiles++;
				if (cleanupFile(file)) {
					modifiedFiles++;
				}
			});
		}
	});

	console.log(
		`\n✅ Processed ${totalFiles} files, modified ${modifiedFiles} files`,
	);
}

if (require.main === module) {
	main();
}
