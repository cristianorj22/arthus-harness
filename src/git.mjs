// Git init + first commit, optional npm install.

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import kleur from 'kleur';
import { pathExists } from './utils.mjs';

export async function initGit(targetDir, harnessVersion) {
  console.log(kleur.gray('  initializing git...'));
  try {
    await runCommand('git', ['init', '--initial-branch=main'], targetDir);
    await runCommand('git', ['add', '.'], targetDir);
    await runCommand(
      'git',
      [
        'commit',
        '-m',
        `chore: bootstrap from arthus-harness v${harnessVersion}`,
        '--no-verify', // we're inside the bootstrap; user's hooks aren't installed yet
      ],
      targetDir
    );
    console.log(kleur.green('  ✓ git initialized'));
  } catch (err) {
    console.log(kleur.yellow(`  ! git init skipped: ${err.message}`));
  }
}

export async function npmInstall(targetDir) {
  // Skip if no package.json (shouldn't happen — we just wrote one — but defensive)
  if (!(await pathExists(path.join(targetDir, 'package.json')))) {
    console.log(kleur.gray('  no package.json — skipping npm install'));
    return;
  }
  console.log(kleur.gray('  npm install (this may take a minute)...'));
  try {
    await runCommand('npm', ['install', '--no-fund', '--no-audit'], targetDir, { stdio: 'inherit' });
    console.log(kleur.green('  ✓ deps installed'));
  } catch (err) {
    console.log(kleur.yellow(`  ! npm install failed: ${err.message}`));
    console.log(kleur.gray('    you can run "npm install" manually inside the project.'));
  }
}

function runCommand(cmd, args, cwd, options = {}) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const spawnCmd = isWin && cmd === 'npm' ? 'npm.cmd' : cmd;
    const child = spawn(spawnCmd, args, {
      cwd,
      stdio: options.stdio || 'pipe',
      shell: isWin,
    });
    let stderr = '';
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exit ${code} ${stderr ? '— ' + stderr.slice(0, 200) : ''}`));
    });
  });
}
