#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(scriptDir, '../../');
const target = path.join(root, 'packages', 'backend', 'convex');

function replaceInFile(file) {
  let src = fs.readFileSync(file, 'utf8');

  // Skip files that already import idOf from test-utils
  const hasImport = /from ['\"]\.\.\/\.\.\/test-utils['\"]/m.test(src)
    || /from ['\"]\.\.\/test-utils['\"]/m.test(src);

  // Replace patterns like `workspace?._id` or `file?._id` -> `idOf(workspace, 'workspace')`
  const replaced = src.replace(/\b([A-Za-z_$][A-Za-z0-9_$]*)\?\._id/g, (m, p1) => {
    return `idOf(${p1}, '${p1}')`;
  });

  if (replaced === src) return false;

  let out = replaced;
  if (!hasImport) {
    // find first non-comment import position
    const importInsert = `import { assertExists, idOf } from '../../test-utils';\n`;
    // put import after the last import block
    const importMatches = out.match(/(?:^|\n)import [\s\S]*? from [^;]+;/g);
    if (importMatches && importMatches.length > 0) {
      const last = importMatches[importMatches.length - 1];
      out = out.replace(last, last + '\n' + importInsert);
    } else {
      out = importInsert + out;
    }
  }

  fs.writeFileSync(file, out, 'utf8');
  return true;
}

function walk(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) res.push(...walk(full));
    else if (stat.isFile() && full.endsWith('.test.ts')) res.push(full);
  }
  return res;
}

const files = walk(target);
let changed = 0;
for (const f of files) {
  try {
    if (replaceInFile(f)) {
      console.log('patched', path.relative(root, f));
      changed++;
    }
  } catch (err) {
    console.error('error processing', f, err?.message ?? err);
  }
}

console.log(`done: ${changed} files changed`);
