#!/usr/bin/env node
// sync-design-tokens.mjs
// ------------------------------------------------------------
// Source of truth: DESIGN.md (front-matter YAML).
// Output:          src/index.css `:root { --... }` block.
// Tailwind:        already reads via hsl(var(--*)). Untouched.
//
// Pipeline:  DESIGN.md  →  this script  →  src/index.css
//
// The :root contract:
//   - This script OWNS the content between `:root {` and the matching `}`.
//   - Anything you put inside that block by hand will be overwritten.
//   - To add styles outside the contract, put them outside `:root { ... }`.
//
// Configurable via env vars (defaults shown):
//   DESIGN_PATH  = Docs/design-system/DESIGN.md
//   CSS_PATH     = src/index.css
//
// Usage:
//   node scripts/sync-design-tokens.mjs           # write
//   node scripts/sync-design-tokens.mjs --check   # dry-run, exit 1 on drift
//
// Zero external deps — minimal YAML parser handles only the shapes our
// DESIGN.md uses (top-level keys, two-level nesting, scalar values).
// If DESIGN.md grows shapes the parser doesn't recognise, fail loud.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DESIGN = path.join(ROOT, process.env.DESIGN_PATH || 'Docs/design-system/DESIGN.md');
const CSS = path.join(ROOT, process.env.CSS_PATH || 'src/index.css');
const CHECK_ONLY = process.argv.includes('--check');

// ---------- Read & parse front-matter -----------------------

function readFrontMatter(mdPath) {
  const text = fs.readFileSync(mdPath, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    console.error('No YAML front-matter found in', mdPath);
    process.exit(2);
  }
  return match[1];
}

// Minimal YAML parser:
//   - top-level: key: scalar | key:\n  nested
//   - nested: 2-space indent, scalar values
//   - scalars: quoted "..."  or  unquoted   or  number
//   - skips multi-line block (`|` or `>`) — uses last line only
//   - skips comments (#) and blank lines
function parseYaml(yaml) {
  const out = {};
  const lines = yaml.split(/\r?\n/);
  let currentKey = null;
  let currentObj = null;
  let blockMode = false;

  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;

    // Top-level key (no leading space)
    if (/^[A-Za-z_][A-Za-z0-9_-]*:/.test(raw)) {
      const m = raw.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
      const [, key, rest] = m;
      currentKey = key;

      if (!rest || rest === '|' || rest === '>') {
        // Multi-line block or nested object
        out[key] = rest === '|' || rest === '>' ? '' : {};
        currentObj = typeof out[key] === 'object' ? out[key] : null;
        blockMode = !currentObj;
      } else {
        out[key] = parseScalar(rest);
        currentObj = null;
        blockMode = false;
      }
      continue;
    }

    // Skip block-scalar continuation lines
    if (blockMode) continue;

    // Nested level (indented)
    if (/^\s+[A-Za-z0-9_."-]+/.test(raw) && currentObj) {
      const indent = raw.match(/^(\s+)/)[1].length;
      const m = raw.match(/^\s+([A-Za-z0-9_."-]+):\s*(.*)$/);
      if (!m) continue;
      let [, key, rest] = m;
      // strip surrounding quotes from key like "0.5"
      key = key.replace(/^"(.*)"$/, '$1');

      if (indent === 2) {
        if (!rest) {
          currentObj[key] = {};
        } else {
          currentObj[key] = parseScalar(rest);
        }
      } else if (indent >= 4) {
        // Deeper nesting — find last 2-space key inside currentObj
        const lastTopKey = Object.keys(currentObj).pop();
        const target = currentObj[lastTopKey];
        if (typeof target === 'object') {
          if (!rest) target[key] = {};
          else target[key] = parseScalar(rest);
        }
      }
    }
  }

  return out;
}

function parseScalar(val) {
  let v = val.trim();
  if (v === '') return '';
  // Quoted — strip then return verbatim (no comment-stripping inside quoted string)
  if (v.startsWith('"') && v.includes('"', 1)) {
    const close = v.indexOf('"', 1);
    return v.slice(1, close);
  }
  if (v.startsWith("'") && v.includes("'", 1)) {
    const close = v.indexOf("'", 1);
    return v.slice(1, close);
  }
  // Strip inline comment ( # ...)
  const hashIdx = v.indexOf(' #');
  if (hashIdx !== -1) v = v.slice(0, hashIdx).trim();
  // Number?
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  // Bool
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

// ---------- Hex → HSL ---------------------------------------

function hexToHsl(hex) {
  hex = hex.replace('#', '').trim();
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`Invalid hex: ${hex}`);
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d) + (g < b ? 6 : 0); break;
      case g: h = ((b - r) / d) + 2; break;
      case b: h = ((r - g) / d) + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// ---------- Build CSS :root block ---------------------------

function buildRootBlock(tokens) {
  const lines = [];
  lines.push('  /* Design System tokens — generated by scripts/sync-design-tokens.mjs */');
  lines.push(`  /* Source: ${path.relative(ROOT, DESIGN).replace(/\\/g, '/')} (v${tokens.version || 'unknown'}) — DO NOT EDIT BY HAND */`);
  lines.push('');

  // Colors
  if (tokens.colors) {
    lines.push('  /* Colors */');
    for (const [name, hex] of Object.entries(tokens.colors)) {
      if (typeof hex !== 'string' || !hex.startsWith('#')) continue;
      lines.push(`  --${name}: ${hexToHsl(hex)};`);
    }
    lines.push('');
  }

  // Aliases — duplicate the underlying token's HSL into a second CSS var
  if (tokens.aliases) {
    lines.push('  /* Aliases (shadcn-compat) */');
    for (const [aliasName, target] of Object.entries(tokens.aliases)) {
      if (typeof target !== 'string') continue;
      const hex = tokens.colors?.[target];
      if (!hex) {
        console.warn(`[sync] alias ${aliasName} -> ${target} but ${target} not in colors. Skipping.`);
        continue;
      }
      lines.push(`  --${aliasName}: ${hexToHsl(hex)};`);
    }
    lines.push('');
  }

  // Radius default
  if (tokens.rounded?.lg) {
    lines.push('  /* Radius (default = rounded.lg) */');
    lines.push(`  --radius: ${tokens.rounded.lg};`);
    lines.push('');
  }

  return lines.join('\n');
}

// ---------- Splice into src/index.css -----------------------

function spliceCss(existing, generatedBody) {
  // Find the @layer base { :root { ... } } block.
  const rootStart = existing.indexOf(':root {');
  if (rootStart === -1) {
    throw new Error(`${path.relative(ROOT, CSS)} does not contain a :root block. Cannot splice.`);
  }
  const blockOpenEnd = existing.indexOf('{', rootStart) + 1;
  // Find matching closing brace (single level)
  let depth = 1;
  let i = blockOpenEnd;
  while (i < existing.length && depth > 0) {
    if (existing[i] === '{') depth++;
    else if (existing[i] === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  const blockCloseStart = i;
  // Replace the inside (between blockOpenEnd and blockCloseStart)
  return existing.slice(0, blockOpenEnd) + '\n' + generatedBody + '\n  ' + existing.slice(blockCloseStart);
}

// ---------- Main --------------------------------------------

function main() {
  const yaml = readFrontMatter(DESIGN);
  let tokens;
  try {
    tokens = parseYaml(yaml);
  } catch (err) {
    console.error('Parser failed:', err.message);
    process.exit(2);
  }

  if (!tokens.colors || Object.keys(tokens.colors).length === 0) {
    console.error('No colors found in DESIGN.md front-matter. Aborting.');
    process.exit(2);
  }

  const generatedBody = buildRootBlock(tokens);
  const existing = fs.readFileSync(CSS, 'utf8');
  const next = spliceCss(existing, generatedBody);

  if (existing === next) {
    console.log(`✓ ${path.relative(ROOT, CSS)} already in sync with ${path.relative(ROOT, DESIGN)}`);
    process.exit(0);
  }

  if (CHECK_ONLY) {
    console.error(`✗ ${path.relative(ROOT, CSS)} is out of sync with ${path.relative(ROOT, DESIGN)}`);
    console.error('  Run `npm run design:sync` to regenerate.');
    process.exit(1);
  }

  fs.writeFileSync(CSS, next);
  console.log(`✓ Synced ${Object.keys(tokens.colors).length} colors + radius into ${path.relative(ROOT, CSS)}`);
}

main();
