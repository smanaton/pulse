import { execSync } from "node:child_process";

// Allow a manual bypass when absolutely necessary
if (process.env.BYPASS_VERIFY === "1") {
	console.log("⚠ Bypassing toolchain verification (BYPASS_VERIFY=1).");
	process.exit(0);
}

const nodeV = process.version; // e.g., v22.12.0
let pnpmV = "unknown";
try {
	pnpmV = execSync("pnpm -v").toString().trim();
} catch (e) {
	console.error("✖ pnpm not found in PATH. Please install pnpm 10.15.0.");
	process.exit(1);
}

// Accept Node >=22 <23 to match package.json engines
const okNode = /^v22\.\d+\.\d+$/.test(nodeV);
// Accept pnpm 10.15.x to match packageManager field
const okPnpm = /^10\.15\./.test(pnpmV);

if (!okNode) {
	console.error(`✖ Node ${nodeV} detected. Require >=22 <23 (see package.json engines)`);
	process.exit(1);
}
if (!okPnpm) {
	console.error(`✖ pnpm ${pnpmV} detected. Require 10.15.x (see packageManager)`);
	process.exit(1);
}
console.log(`✔ Toolchain OK (Node ${nodeV}, pnpm ${pnpmV})`);
