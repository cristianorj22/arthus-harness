// Sync test — validates 3-way merge semantics end-to-end.
//
// Scenario:
//   1. Scaffold a project from preset 'minimal'
//   2. Simulate user edit on CLAUDE.md (preserve a marker line)
//   3. Run `arthus-harness sync --force`
//   4. Assert: marker line is still in CLAUDE.md (user version kept)
//   5. Assert: lockfile present at .arthus-harness/lock.json
//   6. Assert: baseline present at .arthus-harness/baseline/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(__dirname, '..');

function runScaffold(targetParent, projectName, preset) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        path.join(HARNESS_ROOT, 'bin', 'create.mjs'),
        '--no-prompt',
        '--preset', preset,
        projectName,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'], cwd: targetParent }
    );
    let stderr = '';
    child.stderr.on('data', (c) => (stderr += c));
    child.on('error', reject);
    child.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`scaffold exited ${code}: ${stderr}`));
    });
  });
}

function runSync(projectDir, ...flags) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(HARNESS_ROOT, 'bin', 'cli.mjs'), 'sync', ...flags],
      { stdio: ['ignore', 'pipe', 'pipe'], cwd: projectDir }
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => (stdout += c));
    child.stderr.on('data', (c) => (stderr += c));
    child.on('error', reject);
    child.on('close', (code) => {
      code === 0 ? resolve(stdout) : reject(new Error(`sync exited ${code}: ${stderr || stdout}`));
    });
  });
}

test('sync: lockfile + baseline present after scaffold', async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'arthus-sync-layout-'));
  const projectDir = path.join(tmpRoot, 'app');
  try {
    await runScaffold(tmpRoot, 'app', 'minimal');

    const lockPath = path.join(projectDir, '.arthus-harness', 'lock.json');
    const baselineDirPath = path.join(projectDir, '.arthus-harness', 'baseline');

    assert.ok(
      await fs.stat(lockPath).then(() => true).catch(() => false),
      'lock.json should exist at .arthus-harness/lock.json'
    );
    assert.ok(
      await fs.stat(baselineDirPath).then(() => true).catch(() => false),
      'baseline dir should exist at .arthus-harness/baseline/'
    );

    // Verify legacy path NOT used
    const legacyPath = path.join(projectDir, '.arthus-harness.json');
    assert.equal(
      await fs.stat(legacyPath).then(() => true).catch(() => false),
      false,
      'legacy .arthus-harness.json should NOT exist (new layout only)'
    );

    // Verify baseline mirrors at least CLAUDE.md
    const baselineClaude = path.join(baselineDirPath, 'CLAUDE.md');
    assert.ok(
      await fs.stat(baselineClaude).then(() => true).catch(() => false),
      'baseline should contain CLAUDE.md'
    );
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('sync: preserves user edits (BASE != LOCAL, BASE == REMOTE)', async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'arthus-sync-keep-'));
  const projectDir = path.join(tmpRoot, 'app');
  try {
    await runScaffold(tmpRoot, 'app', 'minimal');

    const claudeMd = path.join(projectDir, 'CLAUDE.md');
    const original = await fs.readFile(claudeMd, 'utf8');
    const edited = original + '\n<!-- USER MARKER 12345 — should survive sync -->\n';
    await fs.writeFile(claudeMd, edited);

    const output = await runSync(projectDir, '--force');

    const after = await fs.readFile(claudeMd, 'utf8');
    assert.match(after, /USER MARKER 12345/, 'user edit should be preserved');
    assert.match(output, /user version kept|merged cleanly/, 'output should report kept or merged');
    assert.doesNotMatch(output, /✗ [1-9]\d* conflicts/, 'no conflicts expected when BASE == REMOTE and LOCAL differs');
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});

test('sync: auto-updates files user did not touch (BASE == LOCAL)', async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'arthus-sync-auto-'));
  const projectDir = path.join(tmpRoot, 'app');
  try {
    await runScaffold(tmpRoot, 'app', 'minimal');

    // Don't edit anything; just run sync --force
    const output = await runSync(projectDir, '--force');
    // With same version, files re-render identically. Some files have
    // dynamic content (timestamps, dates) — those become "auto-updated".
    // We just assert no crashes and no conflicts.
    assert.doesNotMatch(output, /✗ [1-9]\d* conflicts/, 'no conflicts expected on untouched project');
    assert.match(output, /Already on|new files|auto-updated|identical/, 'should produce a status report');
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
  }
});
