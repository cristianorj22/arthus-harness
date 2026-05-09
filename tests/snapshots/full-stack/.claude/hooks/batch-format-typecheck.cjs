#!/usr/bin/env node
// Stop hook — runs ESLint on the JS/TS files edited this session, plus a
// scoped tsc check.  Blocks Stop on lint errors in edited files.
//
// Reads .claude/.session-edits.txt (populated by post-edit-accumulator.cjs),
// deduplicates and filters out deleted files, then:
//
//   1. eslint --fix <files>       → blocks Stop on remaining errors.
//   2. tsc --noEmit               → reports new errors in edited files only,
//                                   but does NOT block (informational; many
//                                   projects carry pre-existing TS debt and a
//                                   bail-out here would loop).
//
// Stdin: JSON (Stop event payload). Reads/writes: .claude/.session-edits.txt.
// Exit 0: allow Stop.  Exit 2: block Stop (lint errors found).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const STORE = path.join(process.cwd(), '.claude', '.session-edits.txt');
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function loadEdited() {
  if (!fs.existsSync(STORE)) return [];
  const lines = fs.readFileSync(STORE, 'utf8').split(/\r?\n/);
  const set = new Set();
  for (const l of lines) {
    const p = l.trim();
    if (!p) continue;
    if (!fs.existsSync(p)) continue;
    set.add(p);
  }
  return [...set];
}

function clearStore() {
  try { fs.writeFileSync(STORE, ''); } catch { /* noop */ }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
    setTimeout(() => resolve(data), 1000);
  });
}

(async () => {
  await readStdin(); // we don't act on stop payload, but consume to unblock

  const edited = loadEdited();
  if (edited.length === 0) process.exit(0);

  // 1. ESLint scoped to edited files
  const eslint = spawnSync(NPX, ['--no-install', 'eslint', '--fix', ...edited], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  if (eslint.status !== 0) {
    process.stderr.write(
      '[batch-format-typecheck] ESLint reported errors in edited files:\n\n'
    );
    process.stderr.write(eslint.stdout || '');
    process.stderr.write(eslint.stderr || '');
    process.stderr.write(
      '\nBlocking Stop. Fix the lint errors above (or run `npx eslint --fix ' +
      edited.slice(0, 3).join(' ') + (edited.length > 3 ? ' ...' : '') + '`),\n' +
      'then continue.\n'
    );
    clearStore();
    process.exit(2);
  }

  // 2. tsc scoped report (informational — never blocks)
  // override: project may use tsconfig.app.json (Vite) — adjust here
  const tsc = spawnSync(
    NPX,
    ['--no-install', 'tsc', '--noEmit', '-p', 'tsconfig.json', '--pretty', 'false'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: true }
  );

  if (tsc.status !== 0) {
    const lines = (tsc.stdout || '').split('\n');
    const editedNorm = edited.map((p) => p.replace(/\\/g, '/'));
    const hits = lines.filter((line) =>
      editedNorm.some((f) => line.replace(/\\/g, '/').startsWith(f + '('))
    );
    if (hits.length > 0) {
      process.stderr.write(
        '[batch-format-typecheck] tsc found type errors in files you edited:\n\n'
      );
      process.stderr.write(hits.join('\n') + '\n\n');
      process.stderr.write(
        'NOT blocking Stop (informational). Please review the errors above and\n' +
        'fix what you introduced this session.\n'
      );
    }
  }

  clearStore();
  process.exit(0);
})();
