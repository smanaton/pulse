import { execSync, spawn } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";

const isWin = process.platform === "win32";
const cmd = isWin ? "pnpm.cmd" : "pnpm";

// ANSI color codes for better output
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
};

// Check if stop command is requested
if (process.argv[2] === "stop") {
	if (existsSync(".dev.pid")) {
		try {
			const pid = Number.parseInt(readFileSync(".dev.pid", "utf8").trim(), 10);
			console.log(
				`${colors.yellow}🛑 Stopping development environment (PID: ${pid})...${colors.reset}`,
			);

			if (isWin) {
				// Check if process exists before trying to kill it
				try {
					execSync(`tasklist /FI "PID eq ${pid}" /NH`, { stdio: "pipe" });
					// If we get here, process exists, so kill it
					execSync(`taskkill /pid ${pid} /T /F`, { stdio: "inherit" });
				} catch (checkError) {
					// Process doesn't exist or tasklist failed, which is fine
					if (checkError.message.includes("No tasks are running")) {
						console.log(
							`${colors.yellow}⚠️  Process ${pid} already stopped${colors.reset}`,
						);
					} else {
						// Try the original taskkill anyway
						try {
							execSync(`taskkill /pid ${pid} /T /F`, { stdio: "inherit" });
						} catch (killError) {
							if (killError.message.includes("not found")) {
								console.log(
									`${colors.yellow}⚠️  Process ${pid} already stopped${colors.reset}`,
								);
							} else {
								throw killError;
							}
						}
					}
				}
			} else {
				try {
					process.kill(-pid, "SIGTERM");
				} catch {}
				try {
					process.kill(pid, "SIGTERM");
				} catch {}
			}

			rmSync(".dev.pid");
			console.log(
				`${colors.green}✅ Development environment stopped successfully${colors.reset}`,
			);
		} catch (error) {
			console.log(
				`${colors.red}❌ Failed to stop development environment: ${error.message}${colors.reset}`,
			);
		}
	} else {
		console.log(
			`${colors.yellow}⚠️  No development environment appears to be running${colors.reset}`,
		);
	}
	process.exit(0);
}

console.log(
	`${colors.cyan}🚀 Starting Pulse Development Environment${colors.reset}\n`,
);

// We run Convex in local mode (`npx convex dev --local`) so no project reconfiguration is needed here.

// Start backend and frontend concurrently
const args = [
	"concurrently",
	'"pnpm -F @pulse/backend dev"',
	'"pnpm -F web dev"',
	"--names",
	"backend,frontend",
	"--prefix",
	"name",
	"--prefix-colors",
	"magenta,cyan",
];

// Detach on POSIX so we can kill the whole group via -PID
const child = spawn(cmd, args, {
	stdio: "inherit",
	detached: !isWin,
	shell: isWin,
});

// Only write PID once we have a pid value
if (child.pid) {
	writeFileSync(".dev.pid", String(child.pid), "utf8");
}

// Display service URLs after a short delay
setTimeout(() => {
	console.log(`\n${colors.green}📡 Service URLs:${colors.reset}`);
	console.log(
		`${colors.magenta}  Backend (Convex):${colors.reset} http://localhost:3210`,
	);
	console.log(
		`${colors.magenta}  Convex Dashboard:${colors.reset} https://dashboard.convex.dev`,
	);
	console.log(
		`${colors.cyan}  Web UI:${colors.reset} http://localhost:3003${colors.reset}\n`,
	);

	console.log(
		`${colors.yellow}💡 Press Ctrl+C to stop all services${colors.reset}\n`,
	);

	// Helpful tip if auth fails at runtime
	console.log(
		`${colors.yellow}If sign-in fails (e.g., "Invalid verifier" or missing JWT key), ensure Convex env vars are set:${colors.reset}\n  - SITE_URL -> http://localhost:3003\n  - CONVEX_SITE_URL -> http://127.0.0.1:3210\n  - AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET -> your OAuth credentials\n  - JWT_PRIVATE_KEY -> a PKCS#8 RSA private key (use scripts/generate-jwt-key.mjs)\n  Set them via: npx convex env set <NAME> <VALUE> in packages/backend`,
	);
}, 3000);

const cleanup = () => {
	try {
		console.log(`\n${colors.red}🛑 Stopping all services...${colors.reset}`);
		stopTree();
	try { rmSync(".dev.pid"); } catch {}
	} catch {}
};

const stopTree = () => {
	try {
		if (isWin) {
			// Check if process exists before trying to kill it
			try {
				execSync(`tasklist /FI "PID eq ${child.pid}" /NH`, { stdio: "pipe" });
				// If we get here, process exists, so kill it
				execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "pipe" });
			} catch (checkError) {
				// Process doesn't exist or tasklist failed, which is fine
				if (checkError.message.includes("No tasks are running")) {
					// Process already exited, which is fine
					return;
				}
				// Try the original taskkill anyway in case tasklist failed for other reasons
				try {
					execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "pipe" });
				} catch (killError) {
					// If both fail, the process is likely already gone
					if (!killError.message.includes("not found")) {
						console.log(
							`${colors.yellow}Warning: Could not kill process ${child.pid}: ${killError.message}${colors.reset}`,
						);
					}
				}
			}
		} else {
			// Try to kill process group first, then individual process
			try {
				process.kill(-child.pid, "SIGTERM");
				// Give it a moment to terminate gracefully
				setTimeout(() => {
					try {
						process.kill(-child.pid, "SIGKILL");
					} catch {}
				}, 1000);
			} catch {}
			try {
				process.kill(child.pid, "SIGTERM");
				setTimeout(() => {
					try {
						process.kill(child.pid, "SIGKILL");
					} catch {}
				}, 1000);
			} catch {}
		}
	} catch (error) {
		// Only log actual errors, not "process not found" which is expected
		if (
			!error.message.includes("not found") &&
			!error.message.includes("No such process")
		) {
			console.log(
				`${colors.yellow}Warning: Could not kill process ${child.pid}: ${error.message}${colors.reset}`,
			);
		}
	}
};

process.on("SIGINT", () => {
	stopTree();
	cleanup();
	process.exit(0);
});

process.on("SIGTERM", () => {
	stopTree();
	cleanup();
	process.exit(0);
});

child.on("exit", (code) => {
	cleanup();
	console.log(`${colors.red}Development environment stopped.${colors.reset}`);
	process.exit(code ?? 0);
});
