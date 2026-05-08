// Shared layout helpers — single source of truth for where lockfile + baseline live.
// Layout: .arthus-harness/ is a directory containing both.

import path from 'node:path';
import { pathExists } from './utils.mjs';

export const HARNESS_DIR = '.arthus-harness';
export const LOCK_FILE = 'lock.json';
export const BASELINE_DIR = 'baseline';
export const LEGACY_LOCK_FILE = '.arthus-harness.json'; // pre-Bundle-3 location

/**
 * Resolve the lockfile path for read.
 * Prefers new layout (.arthus-harness/lock.json); falls back to legacy (.arthus-harness.json).
 * Returns null if neither exists.
 */
export async function findLockPath(projectDir) {
  const newPath = path.join(projectDir, HARNESS_DIR, LOCK_FILE);
  if (await pathExists(newPath)) return newPath;
  const legacyPath = path.join(projectDir, LEGACY_LOCK_FILE);
  if (await pathExists(legacyPath)) return legacyPath;
  return null;
}

/**
 * Path where the lockfile should be written (always new layout).
 */
export function writeLockPath(projectDir) {
  return path.join(projectDir, HARNESS_DIR, LOCK_FILE);
}

/**
 * Baseline directory (rendered templates from last successful render).
 * Written at scaffold time + after each successful sync.
 */
export function baselineDir(projectDir) {
  return path.join(projectDir, HARNESS_DIR, BASELINE_DIR);
}

/**
 * Test if a relative path inside the project is part of the harness metadata
 * (lockfile, baseline). Used to skip these in snapshot tests / git diffs.
 */
export function isHarnessMetaPath(rel) {
  const norm = rel.replace(/\\/g, '/');
  return (
    norm === LEGACY_LOCK_FILE ||
    norm === HARNESS_DIR ||
    norm.startsWith(HARNESS_DIR + '/')
  );
}
