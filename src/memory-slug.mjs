// Compute memory slug for ~/.claude/projects/<slug>/memory/ — Q1 algorithm.
// Strategy: projectName slugified + (optional) sha256 first 6 chars of git remote.
// Solo dev: portability > absolute uniqueness. Hash disambiguates when same name collides.

import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

export async function computeMemorySlug({ projectName, targetDir }) {
  const slug = String(projectName).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');

  // Try to detect git remote in the parent directory if it's already a repo,
  // OR in targetDir if it's already initialized. Most cases at scaffold time:
  // targetDir doesn't exist yet → no remote yet. So this is mostly a no-op for fresh projects.
  // The slug stabilizes on the first run; it's stored in .arthus-harness.json.
  const remote = await tryGetRemote(targetDir);
  if (!remote) return slug;

  const hash = crypto.createHash('sha256').update(remote).digest('hex').slice(0, 6);
  return `${slug}-${hash}`;
}

function tryGetRemote(cwd) {
  return new Promise((resolve) => {
    const child = spawn('git', ['config', '--get', 'remote.origin.url'], {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: process.platform === 'win32',
    });
    let stdout = '';
    child.stdout.on('data', (c) => (stdout += c));
    child.on('error', () => resolve(null));
    child.on('close', (code) => {
      if (code === 0 && stdout.trim()) resolve(stdout.trim());
      else resolve(null);
    });
    setTimeout(() => resolve(null), 1500);
  });
}
