// arthus-harness doctor — diagnose drift between project and harness version.
// Default: human-readable. --json: machine-readable (used by harness-doctor skill).

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';
import { pathExists, readJson } from './utils.mjs';
import { findLockPath, baselineDir } from './harness-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(__dirname, '..');

export async function runDoctor({ flags } = { flags: {} }) {
  const projectDir = process.cwd();
  const lockPath = await findLockPath(projectDir);
  const asJson = flags && flags.json === true;

  if (!lockPath) {
    if (asJson) {
      console.log(JSON.stringify({ status: 'no-harness', message: 'no .arthus-harness.json' }, null, 2));
    } else {
      console.log(kleur.yellow('  ! No .arthus-harness.json — this project was not bootstrapped from arthus-harness.'));
    }
    return;
  }

  const lock = await readJson(lockPath);
  const harnessPkg = await readJson(path.join(HARNESS_ROOT, 'package.json'));
  const drift = lock.version !== harnessPkg.version;

  // Sanity checks: are referenced files present?
  const missing = [];
  for (const rel of Object.keys(lock.fingerprint || {})) {
    if (!(await pathExists(path.join(projectDir, rel)))) {
      missing.push(rel);
    }
  }

  // Baseline check (Bundle 3): is .arthus-harness/baseline/ present?
  const hasBaseline = await pathExists(baselineDir(projectDir));
  const lockfileLocation = path.relative(projectDir, lockPath).replace(/\\/g, '/');

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          status: 'ok',
          project: lock.answers?.projectName,
          installedVersion: lock.version,
          currentVersion: harnessPkg.version,
          drift,
          preset: lock.preset || 'custom',
          plugins: lock.plugins || [],
          principles: lock.principles || 'A',
          memorySlug: lock.memorySlug,
          lockfileLocation,
          hasBaseline,
          missingFiles: missing,
          recommendation: drift
            ? `npx arthus-harness sync`
            : missing.length > 0
              ? `npx arthus-harness sync (restore missing files)`
              : !hasBaseline
                ? `npx arthus-harness sync (regenerate baseline for 3-way merge)`
                : 'all good',
        },
        null,
        2
      )
    );
    return;
  }

  console.log('');
  console.log(kleur.bold('  arthus-harness doctor'));
  console.log('');
  console.log(`  Project:        ${kleur.cyan(lock.answers?.projectName || '?')}`);
  console.log(`  Bootstrapped:   ${kleur.gray(lock.bootstrappedAt || '?')}`);
  console.log(`  From version:   ${kleur.cyan('v' + lock.version)}`);
  console.log(`  Current arthus: ${kleur.cyan('v' + harnessPkg.version)}`);
  console.log(`  Preset:         ${lock.preset || 'custom'}`);
  console.log(`  Plugins:        ${(lock.plugins || []).join(', ') || '(none)'}`);
  console.log(`  Principles:     ${lock.principles || 'A'}`);
  console.log(`  Memory slug:    ${kleur.gray(lock.memorySlug || '?')}`);
  console.log(`  Lockfile:       ${kleur.gray(lockfileLocation)}`);
  console.log(`  Baseline:       ${hasBaseline ? kleur.green('present (.arthus-harness/baseline/)') : kleur.yellow('missing — run sync to generate')}`);
  console.log('');

  if (missing.length > 0) {
    console.log(kleur.yellow(`  ! Missing files (${missing.length}):`));
    for (const m of missing.slice(0, 5)) console.log(`    • ${m}`);
    if (missing.length > 5) console.log(`    ... +${missing.length - 5} more`);
    console.log('');
  }

  if (drift) {
    console.log(kleur.yellow(`  ! Drift detected: ${lock.version} → ${harnessPkg.version}`));
    console.log(kleur.gray('    Run "arthus-harness sync" to update templates.'));
  } else if (missing.length === 0) {
    console.log(kleur.green('  ✓ Up to date.'));
  }
  console.log('');
}
