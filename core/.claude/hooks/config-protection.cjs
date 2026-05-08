#!/usr/bin/env node
// PreToolUse hook — blocks edits/writes to config files
// when the user prompt does not explicitly authorise them.
//
// Steers the agent toward fixing code instead of weakening lint/TS/build configs.
//
// Stdin: JSON { tool_name, tool_input: { file_path }, prompt? }
// Exit 0: allow.  Exit 2: block (stderr → user sees the reason).
//
// NOTE: stack-specific protected paths (e.g. supabase/migrations/) are added
// by plugins via settings.json merge — keep this baseline minimal.

const fs = require('fs');

const PROTECTED = [
  /^tsconfig.*\.json$/,
  /^eslint\.config\.[cm]?[jt]s$/,
  /^vite\.config\.[cm]?[jt]s$/,
  /^tailwind\.config\.[cm]?[jt]s$/,
  /^postcss\.config\.[cm]?[jt]s$/,
  /^package\.json$/,
  /^\.claude\/settings\.json$/,
  /^MISSION\.md$/,
];

const AUTH_HINTS = [
  'tsconfig', 'eslint', 'vite config', 'tailwind config', 'postcss',
  'package.json', 'mission.md', 'settings.json',
  'lint config', 'type config', 'build config', 'allow it', 'allow this',
  'go ahead', 'do it', 'proceed', 'override', 'force', 'i approve',
];

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
    setTimeout(() => resolve(data), 4500);
  });
}

(async () => {
  const raw = await readStdin();
  if (!raw) process.exit(0);

  let payload;
  try { payload = JSON.parse(raw); } catch { process.exit(0); }

  const filePath = payload?.tool_input?.file_path || '';
  if (!filePath) process.exit(0);

  const rel = filePath
    .replace(/\\/g, '/')
    .replace(new RegExp('^' + (process.cwd().replace(/\\/g, '/')) + '/?'), '');

  const isProtected = PROTECTED.some((rx) => rx.test(rel));
  if (!isProtected) process.exit(0);

  const userPrompt = (payload?.prompt || payload?.user_prompt || '').toLowerCase();
  const transcriptPath = payload?.transcript_path;
  let recentText = userPrompt;
  if (transcriptPath) {
    try {
      const tail = fs.readFileSync(transcriptPath, 'utf8').slice(-8000).toLowerCase();
      recentText += '\n' + tail;
    } catch { /* ignore */ }
  }

  const looksAuthorised = AUTH_HINTS.some((h) => recentText.includes(h));
  if (looksAuthorised) process.exit(0);

  process.stderr.write(
    `[config-protection] Blocked edit on protected file: ${rel}\n` +
    `Why: this file controls lint / type / build config. Modifying it without\n` +
    `explicit authorisation is usually a way to silence an error instead of fixing the\n` +
    `underlying code. If the user truly meant to change this file, ask them to confirm\n` +
    `(use words like "go ahead", "i approve", or name the file in the prompt).\n`
  );
  process.exit(2);
})();
