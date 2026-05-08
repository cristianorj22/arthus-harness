// Merges contributions from core + plugins into a single deliverable.
// Order: core first, then plugins in topological order by `requires`.
// First-wins on file path collisions (after conflict-resolver has cleared hard errors).

export function mergeContributions(contributions) {
  const sorted = topoSort(contributions);

  const filesByPath = new Map();
  for (const c of sorted) {
    for (const f of c.files) {
      if (!filesByPath.has(f.relPath)) {
        filesByPath.set(f.relPath, f);
      } else {
        // Special case: settings.json should be merged, not first-wins
        if (f.relPath === '.claude/settings.json') {
          const existing = filesByPath.get(f.relPath);
          existing.content = mergeSettingsJson(existing.content, f.content);
        }
        // else: silent skip (conflict-resolver should have caught)
      }
    }
  }

  // Apply settingsHooks from plugins to settings.json
  let settingsContent = filesByPath.get('.claude/settings.json')?.content;
  if (settingsContent) {
    for (const c of sorted) {
      if (c.settingsHooks?.length > 0) {
        settingsContent = appendSettingsHooks(settingsContent, c.settingsHooks);
      }
    }
    filesByPath.set('.claude/settings.json', {
      ...filesByPath.get('.claude/settings.json'),
      content: settingsContent,
    });
  }

  // Merge package contributions
  const mergedPackage = {
    scripts: {},
    deps: {},
    devDeps: {},
  };
  for (const c of sorted) {
    if (!c.package) continue;
    Object.assign(mergedPackage.scripts, c.package.scripts || {});
    mergeVersions(mergedPackage.deps, c.package.deps || {});
    mergeVersions(mergedPackage.devDeps, c.package.devDeps || {});
  }

  // Merge CI jobs
  const ciJobs = [];
  for (const c of sorted) {
    for (const j of c.ci?.jobs || []) {
      if (!ciJobs.find((existing) => existing.name === j.name)) {
        ciJobs.push(j);
      }
    }
  }

  // Merge env
  const env = [];
  for (const c of sorted) {
    for (const e of c.env || []) {
      if (!env.find((existing) => existing.key === e.key)) {
        env.push(e);
      }
    }
  }

  return {
    files: [...filesByPath.values()],
    package: mergedPackage,
    ciJobs,
    env,
  };
}

function topoSort(contributions) {
  // For now: core first, then plugins in declaration order.
  // TODO v1.1: full topological sort by `requires.plugins`.
  const core = contributions.find((c) => c.name === 'core');
  const rest = contributions.filter((c) => c.name !== 'core');
  return core ? [core, ...rest] : rest;
}

function mergeSettingsJson(coreJsonStr, pluginJsonStr) {
  // Parse both, deep-merge `hooks` arrays per event, return JSON string.
  const core = JSON.parse(coreJsonStr);
  const plugin = JSON.parse(pluginJsonStr);

  const merged = { ...core, ...plugin };
  if (core.hooks && plugin.hooks) {
    merged.hooks = { ...core.hooks };
    for (const event of Object.keys(plugin.hooks)) {
      const coreList = core.hooks[event] || [];
      const pluginList = plugin.hooks[event] || [];
      merged.hooks[event] = [...coreList, ...pluginList];
    }
  }

  return JSON.stringify(merged, null, 2) + '\n';
}

function appendSettingsHooks(settingsJsonStr, settingsHooks) {
  const settings = JSON.parse(settingsJsonStr);
  settings.hooks = settings.hooks || {};

  for (const sh of settingsHooks) {
    settings.hooks[sh.event] = settings.hooks[sh.event] || [];
    settings.hooks[sh.event].push({
      matcher: sh.matcher,
      hooks: [
        {
          type: 'command',
          command: sh.command,
          timeout: sh.timeout,
        },
      ],
    });
  }

  return JSON.stringify(settings, null, 2) + '\n';
}

function mergeVersions(target, incoming) {
  for (const [name, version] of Object.entries(incoming)) {
    if (!target[name]) {
      target[name] = version;
    } else if (target[name] !== version) {
      // Pick higher semver — naive comparison
      target[name] = pickHigherSemver(target[name], version);
    }
  }
}

function pickHigherSemver(a, b) {
  // Strip carets/tildes, parse, compare
  const parse = (v) => v.replace(/^[^\d]+/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const [aMajor, aMinor, aPatch] = parse(a);
  const [bMajor, bMinor, bPatch] = parse(b);
  if (aMajor !== bMajor) return aMajor > bMajor ? a : b;
  if (aMinor !== bMinor) return aMinor > bMinor ? a : b;
  return aPatch >= bPatch ? a : b;
}
