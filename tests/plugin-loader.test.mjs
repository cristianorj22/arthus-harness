// Unit tests for src/plugin-loader.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { loadPlugin } from '../src/plugin-loader.mjs';

async function tmpPlugin(name, manifestYaml, files = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), `arthus-plugin-${name}-`));
  const pluginDir = path.join(root, name);
  await fs.mkdir(pluginDir, { recursive: true });
  await fs.writeFile(path.join(pluginDir, 'plugin.yaml'), manifestYaml);
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(pluginDir, rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content);
  }
  return { root, pluginDir, cleanup: () => fs.rm(root, { recursive: true, force: true }) };
}

test('rejects invalid plugin.yaml — missing required field "name"', async () => {
  const yaml = `
version: 0.1.0
description: missing name
`;
  const { pluginDir, cleanup } = await tmpPlugin('bad', yaml);
  try {
    await assert.rejects(
      () => loadPlugin(pluginDir, 'bad'),
      /validation failed|name/i
    );
  } finally {
    await cleanup();
  }
});

test('rejects invalid YAML', async () => {
  const yaml = `
name: bad
this: is: not: valid: yaml
  - oops
`;
  const { pluginDir, cleanup } = await tmpPlugin('bad-yaml', yaml);
  try {
    await assert.rejects(() => loadPlugin(pluginDir, 'bad-yaml'), /invalid YAML|validation failed/i);
  } finally {
    await cleanup();
  }
});

test('parses a minimal valid manifest', async () => {
  const yaml = `
name: minimal
version: 0.1.0
description: minimal plugin
`;
  const { pluginDir, cleanup } = await tmpPlugin('minimal', yaml);
  try {
    const result = await loadPlugin(pluginDir, 'minimal');
    assert.equal(result.name, 'minimal');
    assert.equal(result.version, '0.1.0');
    assert.deepEqual(result.files, []);
    assert.deepEqual(result.package, { scripts: {}, deps: {}, devDeps: {} });
    assert.deepEqual(result.env, []);
  } finally {
    await cleanup();
  }
});

test('resolves glob `from: templates/**` correctly', async () => {
  const yaml = `
name: globby
version: 0.1.0
contributes:
  files:
    - from: templates/**
      to: out/
`;
  const { pluginDir, cleanup } = await tmpPlugin('globby', yaml, {
    'templates/a.ts': 'export const a = 1;',
    'templates/sub/b.ts': 'export const b = 2;',
  });

  try {
    const result = await loadPlugin(pluginDir, 'globby');
    const paths = result.files.map((f) => f.relPath).sort();
    assert.deepEqual(paths, ['out/a.ts', 'out/sub/b.ts']);
    const aContent = result.files.find((f) => f.relPath === 'out/a.ts').content;
    assert.equal(aContent, 'export const a = 1;');
  } finally {
    await cleanup();
  }
});

test('renders .eta files by stripping the suffix in target path', async () => {
  const yaml = `
name: tmpl
version: 0.1.0
contributes:
  files:
    - from: templates/file.ts.eta
      to: src/file.ts
`;
  const { pluginDir, cleanup } = await tmpPlugin('tmpl', yaml, {
    'templates/file.ts.eta': '// hi <%= projectName %>',
  });

  try {
    const result = await loadPlugin(pluginDir, 'tmpl');
    assert.equal(result.files.length, 1);
    assert.equal(result.files[0].relPath, 'src/file.ts');
    assert.equal(result.files[0].template, true);
    assert.match(result.files[0].content, /<%= projectName %>/);
  } finally {
    await cleanup();
  }
});

test('parses claude.skills folder contribution', async () => {
  const yaml = `
name: with-skill
version: 0.1.0
contributes:
  claude:
    skills:
      - my-skill
`;
  const { pluginDir, cleanup } = await tmpPlugin('with-skill', yaml, {
    'claude/skills/my-skill/SKILL.md': '# My skill\n',
  });

  try {
    const result = await loadPlugin(pluginDir, 'with-skill');
    const skillFile = result.files.find((f) => f.relPath === '.claude/skills/my-skill/SKILL.md');
    assert.ok(skillFile, 'skill file should be in result.files');
    assert.match(skillFile.content, /# My skill/);
  } finally {
    await cleanup();
  }
});

test('throws when plugin.yaml is missing', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'arthus-no-manifest-'));
  const pluginDir = path.join(root, 'no-manifest');
  await fs.mkdir(pluginDir, { recursive: true });
  try {
    await assert.rejects(() => loadPlugin(pluginDir, 'no-manifest'), /missing plugin\.yaml/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('parses env list', async () => {
  const yaml = `
name: env-plugin
version: 0.1.0
contributes:
  env:
    - FOO_KEY
    - BAR_URL
`;
  const { pluginDir, cleanup } = await tmpPlugin('env-plugin', yaml);
  try {
    const result = await loadPlugin(pluginDir, 'env-plugin');
    assert.deepEqual(
      result.env.map((e) => e.key).sort(),
      ['BAR_URL', 'FOO_KEY']
    );
    for (const e of result.env) {
      assert.equal(e.plugin, 'env-plugin');
    }
  } finally {
    await cleanup();
  }
});
