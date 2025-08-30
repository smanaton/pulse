import { readFileSync, rmSync } from "node:fs";
import { promisify } from "node:util";
import kill from "tree-kill";

// The original script used platform-specific commands to kill the process tree.
// This refactoring uses the `tree-kill` library to provide a robust,
// cross-platform solution, making the script simpler and more reliable.

// `tree-kill` is callback-based, so we promisify it for use with async/await.
const killAsync = promisify(kill);
const pidFile = ".dev.pid";

async function stopDevServer() {
	let pid;
	try {
		const pidContent = readFileSync(pidFile, "utf8").trim();
		pid = Number(pidContent);
		if (Number.isNaN(pid)) {
			throw new Error(`Invalid PID found in ${pidFile}: "${pidContent}"`);
		}
	} catch (err) {
		if (err.code === "ENOENT") {
			console.log("PID file not found. Server is probably not running.");
		} else {
			console.error("Error reading PID file:", err);
		}
		// Attempt to clean up a potentially stale PID file and exit.
		try {
			rmSync(pidFile);
		} catch {}
		process.exit(0);
	}

	console.log(`Attempting to stop process tree with PID: ${pid}...`);

	try {
		await killAsync(pid);
		console.log("Successfully stopped the development server process tree.");
	} catch (err) {
		// It's common for the process to be already gone. We can ignore that error.
		if (!err.message.includes("No such process")) {
			console.error(
				`An error occurred while trying to stop process ${pid}:`,
				err,
			);
		} else {
			console.log(
				`Process with PID ${pid} was not found (it may have already been stopped).`,
			);
		}
	} finally {
		// Always attempt to remove the PID file.
		try {
			rmSync(pidFile);
		} catch {
			// If it's already gone, that's fine.
		}
	}
}

stopDevServer();
