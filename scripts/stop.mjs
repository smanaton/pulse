import { execSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { promisify } from "node:util";
import kill from "tree-kill";

// The original script used platform-specific commands to kill the process tree.
// This refactoring uses the `tree-kill` library to provide a robust,
// cross-platform solution, making the script simpler and more reliable.

// `tree-kill` is callback-based, so we promisify it for use with async/await.
const killAsync = promisify(kill);
const pidFile = ".dev.pid";
const isWin = process.platform === "win32";
const PORTS = [3003, 3210];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getPidsOnPort(port) {
	try {
		if (isWin) {
			const out = execSync(`netstat -ano -p tcp | findstr :${port}`, {
				stdio: "pipe",
			}).toString();
			const pids = new Set();
			out
				.split(/\r?\n/)
				.filter((l) => l?.includes(`:${port}`) && /LISTENING/i.test(l))
				.forEach((line) => {
					const parts = line.trim().split(/\s+/);
					const pidStr = parts[parts.length - 1];
					if (/^\d+$/.test(pidStr)) pids.add(Number(pidStr));
				});
			return Array.from(pids);
		}
		// POSIX
		try {
			const out = execSync(`lsof -ti tcp:${port}`, {
				stdio: "pipe",
			}).toString();
			return out
				.split(/\r?\n/)
				.map((s) => s.trim())
				.filter(Boolean)
				.map((n) => Number(n))
				.filter((n) => !Number.isNaN(n));
		} catch {
			try {
				const out = execSync(`fuser -n tcp ${port} 2>/dev/null`, {
					stdio: "pipe",
				}).toString();
				return out
					.split(/\s+/)
					.map((s) => s.trim())
					.filter((s) => /^\d+$/.test(s))
					.map((s) => Number(s));
			} catch {
				return [];
			}
		}
	} catch {
		return [];
	}
}

function killPort(port) {
	const pids = getPidsOnPort(port);
	if (pids.length === 0) return false;
	for (const pid of pids) {
		try {
			if (isWin) {
				execSync(`taskkill /PID ${pid} /F /T`, { stdio: "pipe" });
			} else {
				try {
					process.kill(pid, "SIGTERM");
				} catch {}
				try {
					process.kill(pid, "SIGKILL");
				} catch {}
			}
		} catch {}
	}
	return true;
}

function _killLingeringPorts() {
	for (const port of PORTS) {
		try {
			const killed = killPort(port);
			if (killed) {
				console.log(`Freed port ${port}.`);
			}
		} catch {}
	}
}

async function ensurePortsFreed() {
	console.log(`Ports check — known dev ports: ${PORTS.join(", ")}`);
	let anyBusyBefore = false;
	let anyBusyAfter = false;
	const busyAfterPorts = [];
	for (const port of PORTS) {
		const before = getPidsOnPort(port);
		if (before.length === 0) {
			console.log(`• Port ${port} is already free.`);
			continue;
		}
		anyBusyBefore = true;
		console.log(
			`• Port ${port} is in use by PID(s): ${before.join(", ")} — attempting to kill...`,
		);
		killPort(port);
		await sleep(400);
		const after = getPidsOnPort(port);
		if (after.length === 0) {
			console.log(`  Port ${port} is now free.`);
		} else {
			anyBusyAfter = true;
			busyAfterPorts.push(port);
			console.log(
				`  Port ${port} is still in use by PID(s): ${after.join(", ")}.`,
			);
		}
	}
	if (!anyBusyBefore) {
		console.log("All known dev ports were already free.");
	} else if (!anyBusyAfter) {
		console.log("All known dev ports are now free.");
	} else {
		console.log("Some dev ports are still busy.");
	}
	return { ok: !anyBusyAfter, busyAfterPorts };
}

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
		const result = await ensurePortsFreed();
		if (result.ok) {
			console.log(
				"✅ Dev environment cleanup complete. All known ports are free.",
			);
		} else {
			console.log(
				"⚠️ Dev environment cleanup finished with lingering ports. See above for details.",
			);
		}
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
		// Ensure ports are freed after the main PID is stopped with detailed reporting
		await ensurePortsFreed();
	}
}

stopDevServer();
