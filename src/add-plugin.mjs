// arthus-harness add-plugin <name> — add a plugin to existing project.

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';

import { loadCore, loadPlugin } from './plugin-loader.mjs';
import { mergeContributions } from './config-merger.mjs';
import { detectConflicts } from './conflict-resolver.mjs';
import { renderTemplate } from './render.mjs';
import { pathExists, readJson, ensureDir } from './utils.mjs';
import { findLockPath, writeLockPath, baselineDir } from './harness-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(__dirname, '..');

export async function runAddPlugin({ positional }) {
  const pluginName = positional[0];
  if (!pluginName) {
    throw new Error('Usage: arthus-harness add-plugin <name>');
  }

  const projectDir = process.cwd();
  const lockPath = await findLockPath(projectDir);

  if (!lockPath) {
    throw new Error('No lockfile — this directory was not bootstrapped from arthus-harness.');
  }

  const lock = await readJson(lockPath);
  if ((lock.plugins || []).includes(pluginName)) {
    console.log(kleur.gray(`  Plugin ${pluginName} already installed. Nothing to do.`));
    return;
  }

  const pluginPath = path.join(HARNESS_ROOT, 'plugins', pluginName);
  if (!(await pathExists(pluginPath))) {
    throw new Error(`Plugin not found: ${pluginName}`);
  }

  console.log(kleur.bold(`\n  Adding plugin: ${kleur.cyan(pluginName)}\n`));

  // Load existing plugins + new one to detect conflicts
  const core = await loadCore(path.join(HARNESS_ROOT, 'core'));
  const existing = [];
  for (const p of lock.plugins || []) {
    existing.push(await loadPlugin(path.join(HARNESS_ROOT, 'plugins', p), p));
  }
  const newPlugin = await loadPlugin(pluginPath, pluginName);
  detectConflicts([core, ...existing, newPlugin]);

  // Render only the new plugin's contributions
  const renderContext = buildContext(lock);
  for (const file of newPlugin.files) {
    const target = path.join(projectDir, file.relPath);
    if (await pathExists(target)) {
      console.log(kleur.yellow(`  ! Skipping (already exists): ${file.relPath}`));
      continue;
    }
    const content = file.template ? renderTemplate(file.content, renderContext) : file.content;
    await ensureDir(path.dirname(target));
    await fs.writeFile(target, content);
    console.log(kleur.gray(`  + ${file.relPath}`));
  }

  // Also write baseline files for the new plugin (so future sync can 3-way-merge them)
  const baseDir = baselineDir(projectDir);
  for (const file of newPlugin.files) {
    const content = file.template ? renderTemplate(file.content, renderContext) : file.content;
    const baselineTarget = path.join(baseDir, file.relPath);
    await ensureDir(path.dirname(baselineTarget));
    await fs.writeFile(baselineTarget, content);
  }

  // Update lockfile (always to new layout)
  lock.plugins = [...(lock.plugins || []), pluginName];
  lock.lastModifiedAt = new Date().toISOString();
  const newLockPath = writeLockPath(projectDir);
  await ensureDir(path.dirname(newLockPath));
  await fs.writeFile(newLockPath, JSON.stringify(lock, null, 2) + '\n');
  if (lockPath !== newLockPath) {
    await fs.rm(lockPath, { force: true });
  }

  console.log('');
  console.log(kleur.green(`  ✓ Plugin ${pluginName} installed.`));
  console.log(kleur.gray(`  Run "npm install" to fetch new deps if any.`));
  console.log('');
}

function buildContext(lock) {
  const a = lock.answers || {};
  return {
    projectName: a.projectName || 'project',
    projectSlug: (a.projectName || 'project').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    description: a.description || '',
    plugins: lock.plugins || [],
    principles: lock.principles || 'A',
    memorySlug: lock.memorySlug || a.projectName,
    harnessVersion: lock.version,
    nodeVersion: '20.x',
    date: new Date().toISOString().slice(0, 10),
  };
}
