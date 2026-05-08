// Single source of truth for preset definitions.
// Reads `presets/*.yaml` at startup. The "custom" choice is in-memory only
// (no file) and triggers interactive multi-select.

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { pathExists } from './utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(__dirname, '..');
const PRESETS_DIR = path.join(HARNESS_ROOT, 'presets');

/**
 * Load a single preset by name.
 * Returns null if not found. Throws on invalid YAML.
 */
export async function loadPreset(name) {
  if (name === 'custom') {
    return { name: 'custom', label: 'custom (pick plugins individually)', plugins: null };
  }
  const file = path.join(PRESETS_DIR, `${name}.yaml`);
  if (!(await pathExists(file))) return null;
  const raw = await fs.readFile(file, 'utf8');
  const parsed = YAML.parse(raw);
  return {
    name: parsed.name || name,
    label: `${parsed.name || name} (${parsed.description || 'no description'})`,
    description: parsed.description || '',
    plugins: parsed.plugins || [],
    principles: parsed.principles,
  };
}

/**
 * Load all presets from disk + the synthetic "custom" choice.
 * Order: presets in presets/ alphabetically, then minimal, then custom last.
 */
export async function loadAllPresets() {
  const entries = await fs.readdir(PRESETS_DIR, { withFileTypes: true });
  const yamlFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith('.yaml'))
    .map((e) => e.name.replace(/\.yaml$/, ''));

  const presets = {};
  for (const name of yamlFiles) {
    const preset = await loadPreset(name);
    if (preset) presets[name] = preset;
  }
  presets.custom = await loadPreset('custom');
  return presets;
}

/**
 * Resolve plugin list given (pluginsFlag, presetName).
 * Used by --no-prompt flow.
 */
export async function resolvePlugins({ pluginsFlag, presetName }) {
  if (Array.isArray(pluginsFlag)) return pluginsFlag;
  if (typeof pluginsFlag === 'string') {
    return pluginsFlag.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (!presetName) return [];
  const preset = await loadPreset(presetName);
  return preset?.plugins || [];
}
