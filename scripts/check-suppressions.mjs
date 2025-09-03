#!/usr/bin/env node
// Fails the build if disallowed suppressions appear in src code.
// - Disallow `biome-ignore` and TypeScript ignore in application/library source
// - Allow `@ts-expect-error` only in tests (not enforced here)

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC_GLOBS = [join("apps"), join("packages")];

const SRC_SUBDIR = join("src");
const DISALLOWED = [/biome-ignore/i, /@ts-ignore/];

/** Recursively collect files under a directory */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function isSrcPath(file) {
  // Only flag suppressions under apps/**/src/** and packages/**/src/**
  // Explicitly ignore third-party and build outputs
  const rel = relative(process.cwd(), file).replace(/\\/g, "/");
  if (
    rel.includes("/node_modules/") ||
    rel.includes("/.pnpm/") ||
    rel.includes("/dist/") ||
    rel.includes("/coverage/") ||
    rel.includes("/.turbo/")
  ) {
    return false;
  }
  return (
    (rel.startsWith("apps/") && rel.includes("/src/")) ||
    (rel.startsWith("packages/") && rel.includes("/src/"))
  );
}

const offending = [];

for (const root of SRC_GLOBS) {
  let filesToScan = [];
  try {
    filesToScan = walk(root);
  } catch {
    continue;
  }

  for (const file of filesToScan) {
    if (!isSrcPath(file)) continue;
    if (!/[.](ts|tsx|js|jsx|cjs|mjs|json|jsonc)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const re of DISALLOWED) {
      const m = text.match(re);
      if (m) {
        offending.push({ file, match: m[0] });
      }
    }
  }
}

if (offending.length) {
  console.error("Disallowed suppressions found in src files:\n");
  for (const o of offending) {
    console.error(`- ${o.file}: ${o.match}`);
  }
  process.exit(1);
}

console.log("Suppression check passed: no disallowed suppressions in src.");
