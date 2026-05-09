// Snapshot test — generates a project with each preset and compares the
// resulting tree against tests/snapshots/<preset>/.
//
// Regenerate fixtures:
//   UPDATE_SNAPSHOTS=1 node --test tests/snapshot.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(__dirname, '..');
const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');
const UPDATE = process.env.UPDATE_SNAPSHOTS === '1';

const PRESETS = ['minimal', 'web-supabase', 'full-stack'];

for (const preset of PRESETS) {
  test(`snapshot: preset "${preset}"`, async (t) => {
    const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), `arthus-harness-${preset}-`));
    const targetDir = path.join(tmpRoot, 'app');

    try {
      await runScaffold({
        targetDir,
        name: `test-${preset}`,
        preset,
      });

      const tree = await collectTree(targetDir);
      const snapshotDir = path.join(SNAPSHOTS_DIR, preset);

      if (UPDATE) {
        await writeFixtures(snapshotDir, tree);
        t.diagnostic(`updated ${Object.keys(tree).length} files in ${snapshotDir}`);
        return;
      }

      const expected = await readFixtures(snapshotDir);
      if (!expected) {
        t.skip(`no fixtures for ${preset} — run with UPDATE_SNAPSHOTS=1`);
        return;
      }

      assertTreeMatches(tree, expected, preset);
    } finally {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });
}

async function runScaffold({ targetDir, name, preset }) {
  // Run scaffolder with cwd set to the parent of targetDir, so the positional
  // projectName arg (= last segment of targetDir) becomes the actual project slug.
  // Avoids passing absolute path as projectName (which would leak into <%= projectName %>).
  const parentDir = path.dirname(targetDir);
  const projectName = path.basename(targetDir);
  await fs.mkdir(parentDir, { recursive: true });

  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        path.join(HARNESS_ROOT, 'bin', 'create.mjs'),
        '--no-prompt',
        '--preset', preset,
        projectName,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'], cwd: parentDir }
    );
    let stderr = '';
    child.stderr.on('data', (c) => (stderr += c));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`scaffold exited ${code}: ${stderr}`));
    });
  });
}

async function collectTree(root) {
  const tree = {};
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).replace(/\\/g, '/');

      // Skip volatile / generated artifacts (lockfile, baseline, deps, git)
      if (rel === '.arthus-harness.json') continue;                  // legacy lockfile
      if (rel === '.arthus-harness' || rel.startsWith('.arthus-harness/')) continue; // new lockfile + baseline
      if (rel === 'node_modules' || rel.startsWith('node_modules/')) continue;
      if (rel === '.git' || rel.startsWith('.git/')) continue;

      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (entry.isFile()) {
        const content = await fs.readFile(abs, 'utf8');
        tree[rel] = stripVolatileLines(rel, content);
      }
    }
  }
  return tree;
}

/** Mask timestamps / harnessVersion so snapshots don't churn between runs. */
function stripVolatileLines(relPath, content) {
  return content
    .replace(/"timestamp":\s*"[^"]+"/g, '"timestamp": "<MASKED>"')
    .replace(/"date":\s*"\d{4}-\d{2}-\d{2}"/g, '"date": "<MASKED>"')
    .replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g, '<TS>');
}

async function writeFixtures(snapshotDir, tree) {
  await fs.mkdir(snapshotDir, { recursive: true });
  // Wipe existing fixture files (but keep .gitkeep)
  const existing = await fs.readdir(snapshotDir, { withFileTypes: true }).catch(() => []);
  for (const entry of existing) {
    if (entry.name === '.gitkeep') continue;
    await fs.rm(path.join(snapshotDir, entry.name), { recursive: true, force: true });
  }

  for (const [rel, content] of Object.entries(tree)) {
    const target = path.join(snapshotDir, rel);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }
}

async function readFixtures(snapshotDir) {
  const exists = await fs
    .stat(snapshotDir)
    .then(() => true)
    .catch(() => false);
  if (!exists) return null;
  const tree = {};
  const stack = [snapshotDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      // Skip the top-level .gitkeep marker (preserves snapshot dir in git when empty).
      // Deeper .gitkeep files (e.g., plugin-supabase contributes supabase/.gitkeep) are real fixtures.
      if (entry.name === '.gitkeep' && dir === snapshotDir) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(snapshotDir, abs).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        stack.push(abs);
      } else {
        tree[rel] = await fs.readFile(abs, 'utf8');
      }
    }
  }
  return Object.keys(tree).length > 0 ? tree : null;
}

function assertTreeMatches(actual, expected, presetName) {
  const actualKeys = new Set(Object.keys(actual));
  const expectedKeys = new Set(Object.keys(expected));

  const missing = [...expectedKeys].filter((k) => !actualKeys.has(k));
  const extra = [...actualKeys].filter((k) => !expectedKeys.has(k));

  assert.equal(
    missing.length,
    0,
    `[${presetName}] missing files in generated tree: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` …+${missing.length - 5}` : ''}`
  );
  assert.equal(
    extra.length,
    0,
    `[${presetName}] unexpected files in generated tree: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ` …+${extra.length - 5}` : ''}`
  );

  for (const key of expectedKeys) {
    assert.equal(actual[key], expected[key], `[${presetName}] content drift in ${key}`);
  }
}
