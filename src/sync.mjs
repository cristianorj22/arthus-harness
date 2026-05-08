// arthus-harness sync — re-render templates with same answers, do real 3-way merge.
//
// 3-way merge semantics:
//   BASE   = .arthus-harness/baseline/<file>   (rendered at last sync/scaffold)
//   LOCAL  = <project root>/<file>              (current — possibly user-modified)
//   REMOTE = re-rendered template with same answers (current harness version)
//
// Decisions per file:
//   - target doesn't exist → write REMOTE (newFile)
//   - no baseline yet → if LOCAL == REMOTE skip; else write .rej (noBaseline)
//   - BASE == LOCAL (untouched by user) → overwrite with REMOTE (autoUpdate)
//   - LOCAL == REMOTE (coincidental match) → no-op (identical)
//   - BASE == REMOTE (template unchanged) → keep LOCAL (userKept)
//   - otherwise → run diff3
//
// Diff3 outcomes:
//   - clean merge → write merged
//   - conflict → default writes file w/ markers AND .rej with new template;
//     --interactive prompts; --strict throws
//
// After processing all files, baseline is updated to current REMOTE renders.

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';
import { merge as diff3Merge } from 'node-diff3';

import { loadCore, loadPlugin } from './plugin-loader.mjs';
import { mergeContributions } from './config-merger.mjs';
import { renderTemplate } from './render.mjs';
import { computeMemorySlug } from './memory-slug.mjs';
import { pathExists, readJson, ensureDir } from './utils.mjs';
import {
  findLockPath,
  writeLockPath,
  baselineDir,
} from './harness-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(__dirname, '..');

export async function runSync({ flags }) {
  const projectDir = process.cwd();
  const lockPath = await findLockPath(projectDir);

  if (!lockPath) {
    throw new Error(
      'No .arthus-harness/lock.json (or legacy .arthus-harness.json) found. This directory was not bootstrapped from arthus-harness.'
    );
  }

  const lock = await readJson(lockPath);
  console.log(kleur.bold(`\n  arthus-harness sync — project bootstrapped from v${lock.version}\n`));

  const harnessPkg = await readJson(path.join(HARNESS_ROOT, 'package.json'));
  const currentVersion = harnessPkg.version;

  if (currentVersion === lock.version && !flags.force) {
    console.log(kleur.gray(`  Already on v${currentVersion}. Pass --force to re-render anyway.`));
    return;
  }
  console.log(kleur.cyan(`  upgrading: ${lock.version} → ${currentVersion}`));

  // Re-load core + plugins from current harness version
  const core = await loadCore(path.join(HARNESS_ROOT, 'core'));
  const plugins = [];
  for (const p of lock.plugins || []) {
    plugins.push(await loadPlugin(path.join(HARNESS_ROOT, 'plugins', p), p));
  }
  const merged = mergeContributions([core, ...plugins]);

  // Rebuild render context from lock answers
  const memorySlug =
    lock.memorySlug ||
    (await computeMemorySlug({ projectName: lock.answers?.projectName, targetDir: projectDir }));
  const ctx = buildContext(lock, currentVersion, memorySlug);

  const baseDir = baselineDir(projectDir);
  await ensureDir(baseDir);

  const status = {
    newFile: [],      // didn't exist; created
    autoUpdate: [],   // BASE == LOCAL, took REMOTE
    userKept: [],     // BASE == REMOTE, kept LOCAL
    merged: [],       // diff3 clean merge
    conflict: [],     // diff3 conflict — markers in file + .rej written
    identical: [],    // already matches
    noBaseline: [],   // file exists but no baseline; treated as user-modified
  };

  for (const file of merged.files) {
    const result = await syncOneFile({
      file,
      projectDir,
      baseDir,
      ctx,
      flags,
    });
    status[result.kind].push(result.rel);
  }

  // Update lockfile
  lock.version = currentVersion;
  lock.lastSyncAt = new Date().toISOString();
  // refresh fingerprints (cheap and useful for doctor)
  const newFp = {};
  for (const file of merged.files) {
    const target = path.join(projectDir, file.relPath);
    if (await pathExists(target)) {
      const buf = await fs.readFile(target);
      newFp[file.relPath] = 'sha256:' + (await sha256Hex(buf)).slice(0, 12);
    }
  }
  lock.fingerprint = newFp;

  // Migrate lockfile to new path if it was at legacy location
  const newLockPath = writeLockPath(projectDir);
  await ensureDir(path.dirname(newLockPath));
  await fs.writeFile(newLockPath, JSON.stringify(lock, null, 2) + '\n');
  if (lockPath !== newLockPath) {
    await fs.rm(lockPath, { force: true });
    console.log(kleur.gray(`  migrated lockfile: ${path.relative(projectDir, lockPath)} → ${path.relative(projectDir, newLockPath)}`));
  }

  // Report
  console.log('');
  console.log(`  ${kleur.green('+ ' + status.newFile.length)} new files`);
  console.log(`  ${kleur.green('~ ' + status.autoUpdate.length)} auto-updated (untouched by user)`);
  console.log(`  ${kleur.green('= ' + status.identical.length)} identical (no change needed)`);
  console.log(`  ${kleur.cyan('☆ ' + status.userKept.length)} user version kept (template unchanged)`);
  console.log(`  ${kleur.cyan('⚙ ' + status.merged.length)} merged cleanly (3-way diff)`);
  console.log(`  ${kleur.yellow('? ' + status.noBaseline.length)} no baseline (treated as conflict)`);
  console.log(`  ${kleur.red('✗ ' + status.conflict.length)} conflicts (markers + .rej written)`);

  if (status.conflict.length > 0 || status.noBaseline.length > 0) {
    console.log('');
    console.log(kleur.yellow('  Files needing review:'));
    for (const r of [...status.conflict, ...status.noBaseline]) {
      console.log(`    ${kleur.gray('•')} ${r}`);
    }
    if (flags.strict) {
      throw new Error('--strict mode: conflicts present, failing.');
    }
    console.log('');
    console.log(kleur.gray('  Resolve <<<<<<< / >>>>>>> markers manually or use git mergetool.'));
  }
  console.log('');
}

async function syncOneFile({ file, projectDir, baseDir, ctx, flags }) {
  const targetPath = path.join(projectDir, file.relPath);
  const baselinePath = path.join(baseDir, file.relPath);
  const newContent = file.template ? renderTemplate(file.content, ctx) : file.content;

  const baseContent = (await pathExists(baselinePath)) ? await fs.readFile(baselinePath, 'utf8') : null;
  const localContent = (await pathExists(targetPath)) ? await fs.readFile(targetPath, 'utf8') : null;

  // Helper: update baseline at end of every successful merge
  const writeBaseline = async () => {
    await ensureDir(path.dirname(baselinePath));
    await fs.writeFile(baselinePath, newContent);
  };

  // Case 1: target doesn't exist → write REMOTE
  if (localContent === null) {
    await ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, newContent);
    await writeBaseline();
    return { kind: 'newFile', rel: file.relPath };
  }

  // Case 2: identical to REMOTE → no-op (still update baseline)
  if (localContent === newContent) {
    await writeBaseline();
    return { kind: 'identical', rel: file.relPath };
  }

  // Case 3: no baseline → conservative
  if (baseContent === null) {
    if (flags.strict) {
      return { kind: 'noBaseline', rel: file.relPath };
    }
    // Write .rej with new content; don't touch target
    await fs.writeFile(targetPath + '.rej', newContent);
    await writeBaseline();
    return { kind: 'noBaseline', rel: file.relPath };
  }

  // Case 4: BASE == LOCAL (user didn't touch) → take REMOTE
  if (baseContent === localContent) {
    await fs.writeFile(targetPath, newContent);
    await writeBaseline();
    return { kind: 'autoUpdate', rel: file.relPath };
  }

  // Case 5: BASE == REMOTE (template unchanged) → keep LOCAL
  if (baseContent === newContent) {
    return { kind: 'userKept', rel: file.relPath };
  }

  // Case 6: 3-way merge
  const result = diff3Merge(localContent, baseContent, newContent, {
    label: { a: 'LOCAL', o: 'BASE', b: 'REMOTE' },
    stringSeparator: '\n',
  });

  if (!result.conflict) {
    const mergedText = Array.isArray(result.result) ? result.result.join('\n') : result.result;
    await fs.writeFile(targetPath, mergedText);
    await writeBaseline();
    return { kind: 'merged', rel: file.relPath };
  }

  // Conflict
  if (flags.strict) {
    return { kind: 'conflict', rel: file.relPath };
  }
  if (flags.interactive) {
    const choice = await promptResolve(file.relPath, localContent, newContent);
    if (choice === 'overwrite') {
      await fs.writeFile(targetPath, newContent);
      await writeBaseline();
      return { kind: 'autoUpdate', rel: file.relPath };
    }
    if (choice === 'keep') {
      return { kind: 'userKept', rel: file.relPath };
    }
    // 'markers' falls through
  }

  // Default: write merged (with conflict markers) + .rej as escape hatch
  const mergedText = Array.isArray(result.result) ? result.result.join('\n') : result.result;
  await fs.writeFile(targetPath, mergedText);
  await fs.writeFile(targetPath + '.rej', newContent);
  // DON'T update baseline on conflict — baseline must keep referencing the old template
  // until the user resolves; otherwise next sync would lose context.
  return { kind: 'conflict', rel: file.relPath };
}

async function promptResolve(relPath, currentContent, newContent) {
  const prompts = (await import('prompts')).default;
  const r = await prompts({
    type: 'select',
    name: 'choice',
    message: `Conflict in ${relPath} — what do you want?`,
    choices: [
      { title: 'Keep my version (skip)', value: 'keep' },
      { title: 'Overwrite with new template', value: 'overwrite' },
      { title: 'Write conflict markers + .rej (review later)', value: 'markers' },
    ],
    initial: 2,
  });
  return r.choice || 'markers';
}

async function sha256Hex(buf) {
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function buildContext(lock, harnessVersion, memorySlug) {
  const a = lock.answers || {};
  return {
    projectName: a.projectName || 'project',
    projectSlug: (a.projectName || 'project').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    description: a.description || '',
    plugins: lock.plugins || [],
    pluginsList: (lock.plugins || []).join(', ') || 'none',
    principles: lock.principles || 'A',
    principlesIsLiteral: lock.principles === 'A' || lock.principles === 'both',
    principlesIsFramework: lock.principles === 'C' || lock.principles === 'both',
    memorySlug,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    harnessVersion,
    nodeVersion: '20.x',
    hasSupabase: (lock.plugins || []).includes('supabase'),
    hasDesignSystem: (lock.plugins || []).includes('design-system-pipeline'),
    hasE2E: (lock.plugins || []).includes('e2e-playwright'),
    hasI18n: (lock.plugins || []).includes('i18n'),
    hasPaymentAsaas: (lock.plugins || []).includes('payment-asaas'),
    hasJourneyMapping: (lock.plugins || []).includes('journey-mapping'),
  };
}
