#!/usr/bin/env node
// PostToolUse hook — record the path of every JS/TS file edited this session.
// The Stop hook (batch-format-typecheck.cjs) reads the list and runs lint+tsc
// once at the end instead of after every Edit.
//
// Stdin: JSON { tool_name, tool_input: { file_path } }
// Exit 0 always.  Never blocks.

const fs = require('fs');
const path = require('path');

const TRACKED_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;
const STORE = path.join(process.cwd(), '.claude', '.session-edits.txt');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
    setTimeout(() => resolve(data), 2500);
  });
}

(async () => {
  const raw = await readStdin();
  if (!raw) process.exit(0);

  let payload;
  try { payload = JSON.parse(raw); } catch { process.exit(0); }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !TRACKED_EXT.test(filePath)) process.exit(0);

  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  if (rel.startsWith('..') || rel.startsWith('node_modules/')) process.exit(0);

  try {
    fs.mkdirSync(path.dirname(STORE), { recursive: true });
    fs.appendFileSync(STORE, rel + '\n');
  } catch { /* never block on bookkeeping */ }
  process.exit(0);
})();
