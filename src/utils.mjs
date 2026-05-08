// Shared filesystem + crypto helpers.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

/**
 * Recursively walk a directory and return absolute file paths.
 * Skips: node_modules, .git, common .DS_Store noise.
 */
export async function walkFiles(root) {
  const SKIP = new Set(['node_modules', '.git', '.DS_Store']);
  const out = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }

  if (!(await pathExists(root))) return [];
  const stat = await fs.stat(root);
  if (stat.isFile()) return [root];
  await walk(root);
  return out;
}

/**
 * Compute sha256 fingerprints of files written to disk.
 * Used in .arthus-harness.json so `arthus-harness sync` knows what's user-modified.
 */
export async function fingerprintFiles(targetDir, relPaths) {
  const fp = {};
  for (const rel of relPaths) {
    const abs = path.join(targetDir, rel);
    if (!(await pathExists(abs))) continue;
    const content = await fs.readFile(abs);
    fp[rel] = 'sha256:' + crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  }
  return fp;
}

/**
 * Read JSON safely.
 */
export async function readJson(p) {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}
