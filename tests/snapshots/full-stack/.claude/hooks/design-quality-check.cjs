#!/usr/bin/env node
// design-quality-check.cjs
// ------------------------------------------------------------
// PostToolUse hook (Edit | Write | MultiEdit on .tsx / .css / index.css).
// Detects signs of "generic template" UI and design-system drift at edit
// time (earlier than `npm run design:check` in CI).
//
// Non-blocking: exit 0 always. Emits warnings on stderr.
//
// Stdin: JSON { tool_name, tool_input: { file_path, ?content?, ?old_string?, ?new_string? } }

const fs = require('node:fs');
const path = require('node:path');

const MAX_HITS = 8; // cap warnings to avoid flooding
const TARGETED_EXT = /\.(tsx?|css)$/i;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
    setTimeout(() => resolve(data), 2000);
  });
}

// Yellow-flag patterns. Each comes with a short message.
const SIGNALS = [
  // Hex hardcoded (token violation #1) — exclude rgba/hsla/var()
  {
    pattern: /(?<!#[0-9a-fA-F]{0,6})#[0-9a-fA-F]{6}\b(?![0-9a-fA-F])/g,
    msg: 'Hex hardcoded — reference a token via `bg-primary` or `hsl(var(--<name>))`',
  },
  // Magic px in padding/margin (not letter-spacing)
  {
    pattern: /\b(?:padding|margin|gap)(?:-(?:top|right|bottom|left|x|y))?:\s*\d+(?:\.\d+)?px\b/g,
    msg: 'Spacing in raw px — use Tailwind `p-N` / `gap-N` (4px scale)',
  },
  // Magic radius in []
  {
    pattern: /\brounded-\[\d+(?:px|rem)?\]/g,
    msg: 'Arbitrary radius — use `rounded-{xs|sm|md|lg|xl|full}` (token)',
  },
  // Inline box-shadow with hex/rgb outside tokens
  {
    pattern: /\bbox-shadow:\s*[^;]*(?:rgba?\([^)]*\)|#[0-9a-fA-F]+)/gi,
    msg: 'Custom box-shadow — use Tailwind `shadow-sm/md/lg` or a project utility class',
  },
  // text-center default in hero (sign of unconsidered wireframe layout)
  {
    pattern: /className="[^"]*\btext-center\b[^"]*\btext-(?:4xl|5xl|6xl)\b/g,
    msg: 'Hero centered + text-Nxl: default template feel. Consider asymmetric layout.',
  },
  // CTA cliché — EDIT THIS LIST PER PROJECT LOCALE.
  // Defaults cover common EN + pt-BR clichés.
  {
    pattern: /\b(?:Get Started|Click here|Learn More|Sign up now|Buy now|Comprar agora|Saiba mais|Clique aqui|Cadastre-se grátis)\b/gi,
    msg: 'Generic CTA — voice and tone wants something more specific to the action ("Reserve now", "Find a venue", etc.)',
  },
  // grid-cols-3 default with no responsive prefix (template-y)
  {
    pattern: /\bgrid-cols-3\b(?![^"]*\b(?:sm|md|lg|xl):\bgrid-cols-)/g,
    msg: 'grid-cols-3 with no responsive prefix — mobile will break. Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`',
  },
  // bg-gradient-to-* (startup template cliché)
  {
    pattern: /\bbg-gradient-to-(?:r|l|t|b|tr|tl|br|bl)\b/g,
    msg: 'Gradient template — consider whether a solid color + glass effect would feel less generic',
  },
  // Emojis in primary CTA
  {
    pattern: /<Button[^>]*>[^<]*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,
    msg: 'Emoji in CTA — most voice-and-tone guides forbid emojis in primary CTAs',
  },
];

(async () => {
  const raw = await readStdin();
  if (!raw) process.exit(0);

  let payload;
  try { payload = JSON.parse(raw); } catch { process.exit(0); }

  const filePath = payload?.tool_input?.file_path || '';
  if (!filePath || !TARGETED_EXT.test(filePath)) process.exit(0);

  // Skip generated / vendored
  if (/integrations\/supabase\/types\.ts$/.test(filePath)) process.exit(0);
  if (/\.(test|spec)\./.test(filePath)) process.exit(0);
  if (filePath.replace(/\\/g, '/').includes('/_legacy/')) process.exit(0);

  // Content for analysis: prefer new_string for Edit, then content, then read file
  let content = '';
  if (payload?.tool_input?.new_string) {
    content = payload.tool_input.new_string;
  } else if (payload?.tool_input?.content) {
    content = payload.tool_input.content;
  } else if (fs.existsSync(filePath)) {
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { /* noop */ }
  }
  if (!content) process.exit(0);

  // Run signals
  const findings = [];
  for (const sig of SIGNALS) {
    const matches = [...content.matchAll(sig.pattern)].slice(0, 3);
    if (matches.length === 0) continue;
    findings.push({
      msg: sig.msg,
      samples: matches.map((m) => m[0]).slice(0, 2),
      count: matches.length,
    });
    if (findings.length >= MAX_HITS) break;
  }

  if (findings.length === 0) process.exit(0);

  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  process.stderr.write(`[design-quality-check] ${rel} — ${findings.length} signal(s):\n`);
  for (const f of findings) {
    process.stderr.write(`  · ${f.msg}\n`);
    process.stderr.write(`      ex: ${f.samples.join(' | ')}${f.count > f.samples.length ? ` (and ${f.count - f.samples.length} more)` : ''}\n`);
  }
  process.stderr.write(
    '  Details: Docs/design-system/DESIGN.md · skill design-system-enforcement\n' +
    '  (warning, non-blocking. For full validation: `npm run design:check`.)\n'
  );

  process.exit(0);
})();
