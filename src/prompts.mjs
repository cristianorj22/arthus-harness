// Interactive prompts.
// Wizard with 3 questions by default (preset / principles / custom override).
// Falls back to flag parsing when --no-prompt.

import prompts from 'prompts';
import kleur from 'kleur';
import { loadAllPresets } from './presets-loader.mjs';

const ALL_PLUGINS = [
  { value: 'design-system-pipeline', label: 'design-system-pipeline (DESIGN.md → CSS vars + design:check)' },
  { value: 'supabase', label: 'supabase (Postgres + Auth + RLS + edge functions)' },
  { value: 'e2e-playwright', label: 'e2e-playwright (storageState + persona + AxeBuilder)' },
  { value: 'i18n', label: 'i18n (JSON tree validator + pt-BR source-of-truth)' },
  { value: 'payment-asaas', label: 'payment-asaas (BR payment + webhook HMAC + idempotency)' },
  { value: 'journey-mapping', label: 'journey-mapping (Docs/produto/jornadas + surface→journey hook)' },
  { value: 'mcp-code-review-graph', label: 'mcp-code-review-graph (Tree-sitter knowledge graph — requires uv + uv tool install code-review-graph)' },
];

export async function promptUser({ defaultName } = {}) {
  const onCancel = () => {
    console.log(kleur.gray('\n  Cancelled.'));
    process.exit(0);
  };

  // Load presets from disk (single source of truth)
  const presets = await loadAllPresets();

  // Q0 — project name (if not given on CLI)
  let projectName = defaultName;
  if (!projectName) {
    const r = await prompts(
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name',
        initial: 'my-project',
        validate: (v) => /^[a-z0-9][a-z0-9-_]*$/i.test(v) || 'Use letters, numbers, hyphen or underscore.',
      },
      { onCancel }
    );
    projectName = r.projectName;
  }

  // Q1 — preset
  const presetChoices = Object.entries(presets).map(([k, v]) => ({ title: v.label, value: k }));
  // Default to "web-supabase" if it exists, else first non-custom preset
  const defaultIdx = Math.max(0, presetChoices.findIndex((c) => c.value === 'web-supabase'));
  const r1 = await prompts(
    {
      type: 'select',
      name: 'preset',
      message: 'Pick a preset',
      choices: presetChoices,
      initial: defaultIdx,
    },
    { onCancel }
  );

  // Q1b — if custom, multi-select plugins
  let plugins = presets[r1.preset].plugins;
  if (plugins === null) {
    const r1b = await prompts(
      {
        type: 'multiselect',
        name: 'plugins',
        message: 'Pick plugins (space to toggle, enter to confirm)',
        choices: ALL_PLUGINS.map((p) => ({ ...p, selected: false })),
        hint: '- Space to select. Return to submit. None selected = core only.',
      },
      { onCancel }
    );
    plugins = r1b.plugins || [];
  }

  // Q2 — experience principles
  const r2 = await prompts(
    {
      type: 'select',
      name: 'principles',
      message: 'Experience principles',
      choices: [
        {
          title: 'A — literal (4 sensações + 5 réguas from GoParty, ready to use)',
          value: 'A',
          description: 'Opinionated default. Override sentences in 5 min if needed.',
        },
        {
          title: 'C — framework (you define your own N sensações + M réguas)',
          value: 'C',
          description: 'For products with a different brand voice from GoParty.',
        },
        {
          title: 'both — ship A as default + C framework available',
          value: 'both',
          description: 'Strategy A is active; Strategy C scaffold sits next to it.',
        },
      ],
      initial: 0,
    },
    { onCancel }
  );

  // Q3 — git init + npm install
  const r3 = await prompts(
    [
      {
        type: 'confirm',
        name: 'gitInit',
        message: 'git init + first commit?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Run npm install after scaffold?',
        initial: true,
      },
    ],
    { onCancel }
  );

  return {
    projectName,
    description: '',
    preset: r1.preset,
    plugins,
    principles: r2.principles,
    gitInit: r3.gitInit,
    installDeps: r3.installDeps,
  };
}

// Parse argv flags into { positional, flags }
export function parseFlags(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx >= 0) {
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          flags[arg.slice(2)] = next;
          i++;
        } else {
          flags[arg.slice(2)] = true;
        }
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}
