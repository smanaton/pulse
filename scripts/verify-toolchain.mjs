import { execSync } from "node:child_process";

// Allow a manual bypass when absolutely necessary
if (process.env.BYPASS_VERIFY === "1") {
	console.log("⚠ Bypassing toolchain verification (BYPASS_VERIFY=1).");
	process.exit(0);
}

const nodeV = process.version; // e.g., v22.12.0
const pnpmV = execSync("pnpm -v").toString().trim();

// Accept Node 20.11.x OR any 22.x (block 21/23+)
const okNode = /^v20\.11\.\d+$/.test(nodeV) || /^v22\.\d+\.\d+$/.test(nodeV);
const okPnpm = /^10\.(14|15)\./.test(pnpmV);

if (!okNode) {
	console.error(`✖ Node ${nodeV} detected. Require 20.11.x or 22.x`);
	process.exit(1);
}
if (!okPnpm) {
	console.error(`✖ pnpm ${pnpmV} detected. Require 9.10.x`);
	process.exit(1);
}
console.log(`✔ Toolchain OK (Node ${nodeV}, pnpm ${pnpmV})`);
