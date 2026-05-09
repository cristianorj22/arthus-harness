#!/usr/bin/env node
// check_i18n.mjs
// ------------------------------------------------------------
// Validates locale parity. The source-of-truth locale (default `pt-BR.json`)
// is the contract — every key in it must exist in every other locale, and no
// orphan keys are allowed elsewhere.
//
// Configuration (in order of precedence):
//   1. `harness.config.json` → `{ "i18n": { "source": "en.json" } }`
//   2. `I18N_SOURCE` env var
//   3. fallback: `pt-BR.json`
//
// If `src/locales/` doesn't exist, exits 0 silently — the validator is a
// no-op until i18n is wired. CI-friendly.
//
// Exit 1 on drift.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LOCALES = path.join(ROOT, 'src/locales');

function resolveSource() {
  const cfgPath = path.join(ROOT, 'harness.config.json');
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      if (cfg?.i18n?.source) return cfg.i18n.source;
    } catch {
      // ignore — fall through
    }
  }
  if (process.env.I18N_SOURCE) return process.env.I18N_SOURCE;
  return 'pt-BR.json';
}

const SOURCE = resolveSource();

if (!fs.existsSync(LOCALES)) {
  console.log('i18n not yet wired (src/locales/ does not exist). Skipping check.');
  process.exit(0);
}

const files = fs.readdirSync(LOCALES).filter((f) => f.endsWith('.json'));
if (!files.includes(SOURCE)) {
  console.error(`Source-of-truth missing: src/locales/${SOURCE}`);
  process.exit(1);
}

function load(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(LOCALES, file), 'utf8'));
  } catch (err) {
    console.error(`Invalid JSON in ${file}:`, err.message);
    process.exit(1);
  }
}

function flatKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' && !Array.isArray(v)
      ? flatKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

const sourceTree = load(SOURCE);
const sourceKeys = new Set(flatKeys(sourceTree));
console.log(`✓ ${SOURCE}: ${sourceKeys.size} keys`);

let drift = 0;
for (const file of files.filter((f) => f !== SOURCE)) {
  const tree = load(file);
  const keys = new Set(flatKeys(tree));
  const missing = [...sourceKeys].filter((k) => !keys.has(k));
  const orphan = [...keys].filter((k) => !sourceKeys.has(k));

  console.log(`  ${file}: ${keys.size} keys`);

  if (missing.length || orphan.length) {
    console.error(`  ✗ ${file} is out of parity:`);
    if (missing.length) {
      console.error(`    Missing (in ${SOURCE} but not ${file}):`);
      for (const k of missing.slice(0, 10)) console.error(`      - ${k}`);
      if (missing.length > 10) console.error(`      ... and ${missing.length - 10} more`);
    }
    if (orphan.length) {
      console.error(`    Orphan (in ${file} but not ${SOURCE}):`);
      for (const k of orphan.slice(0, 10)) console.error(`      - ${k}`);
      if (orphan.length > 10) console.error(`      ... and ${orphan.length - 10} more`);
    }
    drift += missing.length + orphan.length;
  }
}

if (drift > 0) {
  console.error(`\n✗ ${drift} key drift(s). Source: ${SOURCE} wins.`);
  process.exit(1);
}

console.log('\n✓ All locales in parity.');
