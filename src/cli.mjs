// Sub-command router for `arthus-harness <cmd>`.

import kleur from 'kleur';
import { parseFlags } from './prompts.mjs';
import { runSync } from './sync.mjs';
import { runDoctor } from './doctor.mjs';
import { runAddPlugin } from './add-plugin.mjs';

const COMMANDS = {
  sync: runSync,
  doctor: runDoctor,
  'add-plugin': runAddPlugin,
};

const HELP = `
arthus-harness <command> [options]

Commands:
  sync                Re-render templates with same answers, 3-way merge user mods.
                        --interactive   prompt per conflict
                        --strict        fail if any conflict (for CI)
  doctor              Check drift between project and harness version.
  add-plugin <name>   Add a plugin to existing project.
  help                Show this help.

Examples:
  arthus-harness sync
  arthus-harness sync --strict
  arthus-harness doctor
  arthus-harness add-plugin supabase
`;

export async function runSubcommand(argv) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(HELP);
    return;
  }

  const handler = COMMANDS[cmd];
  if (!handler) {
    console.error(kleur.red(`Unknown command: ${cmd}`));
    console.log(HELP);
    process.exit(1);
  }

  const { positional, flags } = parseFlags(rest);
  await handler({ positional, flags });
}
