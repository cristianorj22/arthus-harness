#!/usr/bin/env node
// design-check.mjs
// ------------------------------------------------------------
// Validates the design system contract:
//   1. DESIGN.md tokens vs src/index.css :root block (drift)
//   2. Hard-coded hex colors in src/**/*.{ts,tsx,css} that aren't in tokens
//
// Exits 1 on drift (always blocking).
// Hex violations: warning by default, blocking with --strict.
//
// Configuration:
//   - Optional `design-check.config.json` at project root.
//     {
//       "allowedHexPatterns": ["\\.test\\.tsx?$", "vendored/.*\\.css$"]
//     }
//     Patterns are JS regexes (string form) tested against file paths
//     relative to project root. Files matching ANY pattern skip hex check.
//
//   - Env vars (defaults shown):
//     DESIGN_PATH = Docs/design-system/DESIGN.md
//     CSS_PATH    = src/index.css
//     SRC_PATH    = src

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DESIGN = path.join(ROOT, process.env.DESIGN_PATH || 'Docs/design-system/DESIGN.md');
const CSS = path.join(ROOT, process.env.CSS_PATH || 'src/index.css');
const SRC = path.join(ROOT, process.env.SRC_PATH || 'src');
const CONFIG_PATH = path.join(ROOT, 'design-check.config.json');
const STRICT = process.argv.includes('--strict');

let problems = 0;

// ---------- Load config -------------------------------------

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return { allowedHexPatterns: [] };
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const cfg = JSON.parse(raw);
    return {
      allowedHexPatterns: Array.isArray(cfg.allowedHexPatterns) ? cfg.allowedHexPatterns : [],
    };
  } catch (err) {
    console.warn(`[design-check] could not parse ${path.relative(ROOT, CONFIG_PATH)}: ${err.message}`);
    return { allowedHexPatterns: [] };
  }
}

const config = loadConfig();
// Default empty array — projects add patterns as needed via design-check.config.json.
const ALLOWED_HEX_PATTERNS = config.allowedHexPatterns.map((p) => new RegExp(p));

// ---------- Read tokens from DESIGN.md ----------------------

function readTokens() {
  const text = fs.readFileSync(DESIGN, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('No YAML front-matter in DESIGN.md');
  const yaml = match[1];

  const tokens = { colors: {} };

  // Match top-level "colors:" block
  const colorsMatch = yaml.match(/(?:^|\n)colors:\r?\n([\s\S]*?)(?:\n[A-Za-z_][^\n]*:|$)/);
  if (colorsMatch) {
    const block = colorsMatch[1];
    const lines = block.split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\s+([A-Za-z0-9_-]+):\s*"?(#[0-9a-fA-F]{3,6})"?/);
      if (m) tokens.colors[m[1]] = m[2].toLowerCase();
    }
  }

  return tokens;
}

// ---------- Read CSS variables from src/index.css -----------

function readCssVars() {
  const text = fs.readFileSync(CSS, 'utf8');
  const rootMatch = text.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) throw new Error(`No :root block in ${path.relative(ROOT, CSS)}`);
  const block = rootMatch[1];
  const vars = new Set();
  for (const m of block.matchAll(/--([a-z0-9-]+)\s*:/gi)) {
    vars.add(m[1]);
  }
  return vars;
}

// ---------- Walk src/ for hard-coded hex --------------------

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
      yield* walk(full);
    } else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) {
      yield full;
    }
  }
}

const HEX = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

function checkHardCodedHex(tokens) {
  const tokenHex = new Set(Object.values(tokens.colors).map(h => h.toLowerCase()));
  const violations = [];

  for (const file of walk(SRC)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (ALLOWED_HEX_PATTERNS.some(rx => rx.test(rel) || rx.test(file))) continue;

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, i) => {
      // Skip comments
      if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) return;

      const matches = [...line.matchAll(HEX)];
      for (const m of matches) {
        const hex = m[0].toLowerCase();
        // 3-char hex: skip if part of a larger token (`#fff`-style is OK if used very rarely)
        // 6-char hex: flag if not in tokens
        const norm = hex.length === 4
          ? '#' + hex.slice(1).split('').map(c => c + c).join('')
          : hex;
        if (!tokenHex.has(norm)) {
          violations.push({ file: rel, line: i + 1, hex: m[0] });
        }
      }
    });
  }

  return violations;
}

// ---------- Compare tokens ↔ CSS vars -----------------------

function compareTokensVsCss(tokens, cssVars) {
  const tokenNames = new Set(Object.keys(tokens.colors));
  const issues = [];

  for (const t of tokenNames) {
    if (!cssVars.has(t)) {
      issues.push({ kind: 'missing-in-css', token: t });
    }
  }
  // Allow CSS vars not in tokens for now (e.g., shadcn-derived vars like --primary-foreground)
  // Could tighten later by listing intentional extras.

  return issues;
}

// ---------- Main --------------------------------------------

console.log('Design System check\n');

const tokens = readTokens();
console.log(`✓ ${path.relative(ROOT, DESIGN)}: ${Object.keys(tokens.colors).length} color tokens`);

const cssVars = readCssVars();
console.log(`✓ ${path.relative(ROOT, CSS)}: ${cssVars.size} CSS variables in :root\n`);

// 1. tokens vs CSS
const tokenIssues = compareTokensVsCss(tokens, cssVars);
if (tokenIssues.length) {
  console.error(`✗ ${tokenIssues.length} token(s) declared in DESIGN.md but missing from ${path.relative(ROOT, CSS)}:`);
  for (const i of tokenIssues) console.error(`    - ${i.token}`);
  console.error('  → Run `npm run design:sync` to regenerate.\n');
  problems += tokenIssues.length;
} else {
  console.log(`✓ All DESIGN.md tokens present in ${path.relative(ROOT, CSS)}`);
}

// 2. hard-coded hex
const hexViolations = checkHardCodedHex(tokens);
if (hexViolations.length) {
  if (STRICT) {
    console.error(`\n✗ ${hexViolations.length} hard-coded hex value(s) outside the design tokens:`);
    for (const v of hexViolations.slice(0, 30)) {
      console.error(`    ${v.file}:${v.line}  ${v.hex}`);
    }
    if (hexViolations.length > 30) {
      console.error(`    ... and ${hexViolations.length - 30} more`);
    }
    console.error('\n  Reference a token (`hsl(var(--<name>))`) or add the value to DESIGN.md.\n');
    problems += hexViolations.length;
  } else {
    console.warn(`\n⚠ ${hexViolations.length} hard-coded hex value(s) outside the design tokens (non-blocking).`);
    console.warn('  Run with --strict to fail the check.\n');
  }
}

if (problems > 0) {
  console.error(`✗ ${problems} problem(s) found.`);
  process.exit(1);
}
console.log('\n✓ Design system in sync.');
