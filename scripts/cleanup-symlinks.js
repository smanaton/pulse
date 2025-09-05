#!/usr/bin/env node
/**
 * Remove Convex lib symlinks created by scripts/setup-symlinks.js
 */
const fs = require('node:fs');
const path = require('node:path');

const CONVEX_LIB_DIR = path.join(__dirname, '../packages/backend/convex/lib');

function main() {
  if (!fs.existsSync(CONVEX_LIB_DIR)) {
    console.log('Nothing to clean.');
    return;
  }

  const entries = fs.readdirSync(CONVEX_LIB_DIR);
  let removed = 0;
  for (const name of entries) {
    const target = path.join(CONVEX_LIB_DIR, name);
    try {
      const stat = fs.lstatSync(target);
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(target);
        console.log(`🧹 removed symlink: ${target}`);
        removed++;
      }
    } catch (e) {
      // ignore
    }
  }
  if (removed === 0) {
    console.log('No symlinks found to remove.');
  }
}

main();
