#!/usr/bin/env node
// Entry point: arthus-harness <subcommand>
//
// Subcommands:
//   sync           — re-render templates, 3-way merge user mods
//   doctor         — report drift between project and harness version
//   add-plugin     — add a plugin to existing project
//   help           — show usage

import { runSubcommand } from '../src/cli.mjs';

runSubcommand(process.argv.slice(2)).catch((err) => {
  console.error('\nFailed:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
