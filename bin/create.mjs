#!/usr/bin/env node
// Entry point: npx create-arthus-harness <name>
//
// Scaffolds a new project with the arthus-harness baseline:
// 3 layers of protection (process / technical invariants / experience invariants)
// plus opt-in stack plugins.

import { run } from '../src/index.mjs';

run(process.argv.slice(2)).catch((err) => {
  console.error('\nFailed:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
