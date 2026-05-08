// Unit tests for src/conflict-resolver.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectConflicts } from '../src/conflict-resolver.mjs';

function makeContribution(name, overrides = {}) {
  return {
    name,
    files: [],
    package: { scripts: {}, deps: {}, devDeps: {} },
    conflicts: [],
    ...overrides,
  };
}

test('throws on duplicate file path between two plugins', () => {
  const a = makeContribution('plugin-a', {
    files: [{ relPath: 'src/foo.ts', content: 'A' }],
  });
  const b = makeContribution('plugin-b', {
    files: [{ relPath: 'src/foo.ts', content: 'B' }],
  });

  assert.throws(() => detectConflicts([a, b]), /File path collision/);
});

test('does not throw on duplicate .claude/settings.json (it is merged)', () => {
  const a = makeContribution('plugin-a', {
    files: [{ relPath: '.claude/settings.json', content: '{}' }],
  });
  const b = makeContribution('plugin-b', {
    files: [{ relPath: '.claude/settings.json', content: '{}' }],
  });

  assert.doesNotThrow(() => detectConflicts([a, b]));
});

test('throws on duplicate package.json script name', () => {
  const a = makeContribution('plugin-a', {
    package: { scripts: { 'check': 'a-script' }, deps: {}, devDeps: {} },
  });
  const b = makeContribution('plugin-b', {
    package: { scripts: { 'check': 'b-script' }, deps: {}, devDeps: {} },
  });

  assert.throws(() => detectConflicts([a, b]), /script collision/);
});

test('warns (does not throw) on dep version mismatch', () => {
  const a = makeContribution('plugin-a', {
    package: { scripts: {}, deps: { react: '^18.0.0' }, devDeps: {} },
  });
  const b = makeContribution('plugin-b', {
    package: { scripts: {}, deps: { react: '^19.0.0' }, devDeps: {} },
  });

  // Capture console.log output
  const origLog = console.log;
  let logged = '';
  console.log = (msg) => {
    logged += msg + '\n';
  };
  try {
    assert.doesNotThrow(() => detectConflicts([a, b]));
  } finally {
    console.log = origLog;
  }
  assert.match(logged, /version mismatch/i);
  assert.match(logged, /react/);
});

test('throws on declared conflict where conflicting plugin is also installed', () => {
  const a = makeContribution('plugin-a', { conflicts: ['plugin-b'] });
  const b = makeContribution('plugin-b');

  assert.throws(() => detectConflicts([a, b]), /declares conflict with/);
});

test('does not throw when declared conflict plugin is absent', () => {
  const a = makeContribution('plugin-a', { conflicts: ['plugin-b'] });
  const c = makeContribution('plugin-c');

  assert.doesNotThrow(() => detectConflicts([a, c]));
});

test('does not throw on identical dep versions', () => {
  const a = makeContribution('plugin-a', {
    package: { scripts: {}, deps: { react: '^18.0.0' }, devDeps: {} },
  });
  const b = makeContribution('plugin-b', {
    package: { scripts: {}, deps: { react: '^18.0.0' }, devDeps: {} },
  });

  assert.doesNotThrow(() => detectConflicts([a, b]));
});
