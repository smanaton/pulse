#!/usr/bin/env node
/*
 Lightweight setup helper for local development.
 - Copies packages/backend/.env -> packages/backend/.env.local if not present
 - Copies apps/web/.env -> apps/web/.env.local if not present
 - Prints recommended Convex CLI commands to persist important envs
*/
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const repoRoot = process.cwd();
const mappings = [
  { from: join(repoRoot, 'packages/backend/.env'), to: join(repoRoot, 'packages/backend/.env.local') },
  { from: join(repoRoot, 'apps/web/.env'), to: join(repoRoot, 'apps/web/.env.local') },
];

console.log('\nPulse local setup helper\n');
for (const m of mappings) {
  try {
    if (!existsSync(m.from)) {
      console.warn(`  - Template not found: ${m.from} (skipping)`);
      continue;
    }
    if (existsSync(m.to)) {
      console.log(`  - Exists: ${m.to} (left unchanged)`);
    } else {
      copyFileSync(m.from, m.to);
      console.log(`  - Created: ${m.to}`);
    }
  } catch (err) {
    console.error(`  - Error processing ${m.from}: ${err.message}`);
  }
}

console.log('\nNext steps:');
console.log('  1) Inspect and fill secrets in the created .env.local files (do NOT commit them).');
console.log('  2) Start Convex dev server in packages/backend:');
console.log('     cd packages/backend && npx convex dev');
console.log('  3) Start the web app:');
console.log('     cd apps/web && pnpm dev');

console.log('\nOptional: Persist important Convex envs to your Convex deployment with the Convex CLI:');
console.log('  npx convex env set CONVEX_URL "http://127.0.0.1:3210"');
console.log('  npx convex env set CONVEX_SITE_URL "http://127.0.0.1:3210"');
console.log('  npx convex env set SITE_URL "http://localhost:3003"');
console.log('  npx convex env set AUTH_GOOGLE_ID "your-google-client-id"');
console.log('  npx convex env set AUTH_GOOGLE_SECRET "your-google-client-secret"');
console.log('  node scripts/generate-jwt-key.mjs | npx convex env set JWT_PRIVATE_KEY');
console.log('\nDone.');
