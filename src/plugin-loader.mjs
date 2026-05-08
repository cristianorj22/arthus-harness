// Loads core/ and plugins/<name>/ as `Contribution` objects.
// Validates plugin.yaml manifests with zod.
// Returns a normalized shape ready to merge.

import path from 'node:path';
import fs from 'node:fs/promises';
import YAML from 'yaml';
import { z } from 'zod';
import { walkFiles, pathExists } from './utils.mjs';

const TEMPLATE_EXTENSIONS = new Set(['.eta']);

const PluginManifestSchema = z.object({
  name: z.string(),
  version: z.string().default('0.1.0'),
  description: z.string().optional(),
  requires: z
    .object({
      core: z.string().optional(),
      plugins: z.array(z.string()).default([]),
    })
    .default({ plugins: [] }),
  conflicts: z.array(z.string()).default([]),
  contributes: z
    .object({
      files: z
        .array(
          z.object({
            from: z.string(),
            to: z.string(),
          })
        )
        .default([]),
      claude: z
        .object({
          skills: z.array(z.string()).default([]),
          agents: z.array(z.string()).default([]),
          hooks: z.array(z.string()).default([]),
          commands: z.array(z.string()).default([]),
          settingsHooks: z
            .array(
              z.object({
                event: z.enum(['PreToolUse', 'PostToolUse', 'Stop', 'SessionStart']),
                matcher: z.string().default('Edit|Write|MultiEdit'),
                command: z.string(),
                timeout: z.number().default(10),
              })
            )
            .default([]),
        })
        .default({ skills: [], agents: [], hooks: [], commands: [], settingsHooks: [] }),
      docs: z
        .array(
          z.object({
            from: z.string(),
            to: z.string(),
          })
        )
        .default([]),
      package: z
        .object({
          scripts: z.record(z.string()).default({}),
          deps: z.record(z.string()).default({}),
          devDeps: z.record(z.string()).default({}),
        })
        .default({ scripts: {}, deps: {}, devDeps: {} }),
      ci: z
        .object({
          jobs: z
            .array(
              z.object({
                name: z.string(),
                run: z.string(),
              })
            )
            .default([]),
        })
        .default({ jobs: [] }),
      env: z.array(z.string()).default([]),
    })
    .default({}),
  prompts: z
    .array(
      z.object({
        name: z.string(),
        message: z.string(),
        type: z.enum(['input', 'confirm', 'select']).default('input'),
        optional: z.boolean().default(false),
      })
    )
    .default([]),
});

/**
 * Load core/ as a Contribution.
 * Treats every file in core/ as a contribution to the root, with .eta files marked as templates.
 */
export async function loadCore(corePath) {
  const allFiles = await walkFiles(corePath);
  const files = allFiles.map((absPath) => {
    const rel = path.relative(corePath, absPath).replace(/\\/g, '/');
    const isTemplate = rel.endsWith('.eta');
    const relPath = isTemplate ? rel.slice(0, -4) : rel;
    return {
      absPath,
      relPath,
      template: isTemplate,
      source: 'core',
    };
  });

  // Read content lazily — defer to merge step? Or load all now?
  // Load now for simplicity (small file count).
  const filesWithContent = await Promise.all(
    files.map(async (f) => ({
      ...f,
      content: await fs.readFile(f.absPath, 'utf8'),
    }))
  );

  return {
    name: 'core',
    version: '1.0.0',
    files: filesWithContent,
    settingsHooks: [], // core defines settings.json directly via files
    package: { scripts: {}, deps: {}, devDeps: {} },
    ci: { jobs: [] },
    env: [],
  };
}

/**
 * Load plugins/<name>/ as a Contribution.
 */
export async function loadPlugin(pluginPath, name) {
  const manifestPath = path.join(pluginPath, 'plugin.yaml');
  if (!(await pathExists(manifestPath))) {
    throw new Error(`Plugin "${name}" missing plugin.yaml at ${pluginPath}`);
  }

  const manifestRaw = await fs.readFile(manifestPath, 'utf8');
  let manifest;
  try {
    manifest = YAML.parse(manifestRaw);
  } catch (err) {
    throw new Error(`Plugin "${name}" plugin.yaml is invalid YAML: ${err.message}`);
  }

  const parsed = PluginManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Plugin "${name}" plugin.yaml validation failed: ${issues}`);
  }
  const m = parsed.data;

  const files = [];
  const contributes = m.contributes;

  // contributes.files (with rendering)
  for (const fileSpec of contributes.files) {
    const fromGlob = path.join(pluginPath, fileSpec.from);
    const matched = await resolveGlobOrFile(fromGlob);
    for (const abs of matched) {
      const relWithinFrom = path.relative(path.dirname(fromGlob.replace(/\*\*?/g, '').replace(/\/$/, '')) || pluginPath, abs);
      const rawTo = path.posix.normalize(fileSpec.to.replace(/\\/g, '/'));
      const isFromGlob = fileSpec.from.includes('*');
      const targetRel = isFromGlob
        ? path.posix.join(rawTo.replace(/\/$/, ''), path.relative(stripGlob(path.join(pluginPath, fileSpec.from)), abs).replace(/\\/g, '/'))
        : rawTo;
      const isTemplate = abs.endsWith('.eta');
      const finalRelPath = isTemplate ? targetRel.replace(/\.eta$/, '') : targetRel;
      files.push({
        absPath: abs,
        relPath: finalRelPath,
        template: isTemplate,
        source: name,
        content: await fs.readFile(abs, 'utf8'),
      });
    }
  }

  // contributes.claude.{skills,agents,hooks,commands} — copy from plugin/claude/<dir>/
  for (const skillName of contributes.claude.skills) {
    await pushClaudeAsset(files, pluginPath, name, 'skills', skillName);
  }
  for (const agentName of contributes.claude.agents) {
    await pushClaudeAsset(files, pluginPath, name, 'agents', agentName);
  }
  for (const hookName of contributes.claude.hooks) {
    await pushClaudeAsset(files, pluginPath, name, 'hooks', hookName);
  }
  for (const cmdName of contributes.claude.commands) {
    await pushClaudeAsset(files, pluginPath, name, 'commands', cmdName);
  }

  // contributes.docs
  for (const docSpec of contributes.docs) {
    const abs = path.join(pluginPath, docSpec.from);
    if (await pathExists(abs)) {
      const isTemplate = abs.endsWith('.eta');
      const relPath = isTemplate ? docSpec.to.replace(/\.eta$/, '') : docSpec.to;
      files.push({
        absPath: abs,
        relPath,
        template: isTemplate,
        source: name,
        content: await fs.readFile(abs, 'utf8'),
      });
    }
  }

  return {
    name,
    version: m.version,
    requires: m.requires,
    conflicts: m.conflicts,
    files,
    settingsHooks: contributes.claude.settingsHooks,
    package: contributes.package,
    ci: contributes.ci,
    env: contributes.env.map((key) => ({ key, plugin: name })),
  };
}

async function pushClaudeAsset(files, pluginPath, pluginName, kind, name) {
  // Skills are folders (skills/<name>/SKILL.md + extras)
  // Agents/commands/hooks are single files
  const isFolder = kind === 'skills';
  const sourceDir = path.join(pluginPath, 'claude', kind);

  if (isFolder) {
    const sourceFolder = path.join(sourceDir, name);
    if (!(await pathExists(sourceFolder))) return;
    const allFiles = await walkFiles(sourceFolder);
    for (const abs of allFiles) {
      const rel = path.relative(sourceFolder, abs).replace(/\\/g, '/');
      const isTemplate = abs.endsWith('.eta');
      const relWithinTarget = isTemplate ? rel.slice(0, -4) : rel;
      files.push({
        absPath: abs,
        relPath: `.claude/${kind}/${name}/${relWithinTarget}`,
        template: isTemplate,
        source: pluginName,
        content: await fs.readFile(abs, 'utf8'),
      });
    }
  } else {
    // Single file — try common extensions
    const candidates = [
      path.join(sourceDir, name),
      path.join(sourceDir, name + '.md'),
      path.join(sourceDir, name + '.cjs'),
      path.join(sourceDir, name + '.md.eta'),
    ];
    for (const abs of candidates) {
      if (await pathExists(abs)) {
        const isTemplate = abs.endsWith('.eta');
        const baseName = path.basename(abs, '.eta');
        files.push({
          absPath: abs,
          relPath: `.claude/${kind}/${baseName}`,
          template: isTemplate,
          source: pluginName,
          content: await fs.readFile(abs, 'utf8'),
        });
        return;
      }
    }
  }
}

// Resolve a from-spec which can be either a literal file or a glob (with **)
async function resolveGlobOrFile(spec) {
  if (spec.includes('*')) {
    const root = stripGlob(spec);
    if (!(await pathExists(root))) return [];
    return walkFiles(root);
  }
  if (await pathExists(spec)) return [spec];
  return [];
}

function stripGlob(spec) {
  // Normalize Windows backslashes to forward slashes for regex matching, then strip glob suffix.
  const normalized = spec.replace(/\\/g, '/');
  return normalized.replace(/\/\*\*\/?.*$/, '').replace(/\/\*\*$/, '');
}
