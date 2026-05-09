#!/usr/bin/env node
// PostToolUse hook — when editing a file that maps to a documented journey,
// records a hint for the Stop hook to surface.
//
// Surface → journey mapping is read from `Docs/produto/jornadas/_surfaces.json`.
// Format: array of { "match": "<substring>", "journey": "<persona>/<journey>.md" }.
// Match is substring (case-sensitive) against the relative path.
//
// Stdin: JSON { tool_name, tool_input: { file_path } }
// Exit 0 always — never blocks.

const fs = require('fs');
const path = require('path');

const SURFACES_PATH = path.join(process.cwd(), 'Docs', 'produto', 'jornadas', '_surfaces.json');
const STORE = path.join(process.cwd(), '.claude', '.session-journey-hints.txt');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
    setTimeout(() => resolve(data), 2500);
  });
}

function loadSurfaces() {
  if (!fs.existsSync(SURFACES_PATH)) return [];
  try {
    const raw = fs.readFileSync(SURFACES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s) => s && typeof s.match === 'string' && typeof s.journey === 'string'
    );
  } catch {
    return [];
  }
}

(async () => {
  const surfaces = loadSurfaces();
  if (surfaces.length === 0) process.exit(0); // no journeys configured — no-op

  const raw = await readStdin();
  if (!raw) process.exit(0);

  let payload;
  try { payload = JSON.parse(raw); } catch { process.exit(0); }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  if (rel.startsWith('..') || rel.startsWith('node_modules/')) process.exit(0);

  // Match against configured surfaces (substring matching)
  for (const { match, journey } of surfaces) {
    if (rel.includes(match)) {
      try {
        fs.mkdirSync(path.dirname(STORE), { recursive: true });
        const existing = fs.existsSync(STORE) ? fs.readFileSync(STORE, 'utf8') : '';
        // Append once per journey per session
        if (!existing.includes(journey)) {
          fs.appendFileSync(STORE, journey + '\n');
        }
      } catch { /* never block */ }
      break;
    }
  }

  process.exit(0);
})().catch(() => process.exit(0));
