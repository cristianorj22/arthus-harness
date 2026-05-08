// Main scaffolder orchestrator.
// Called by bin/create.mjs.

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';

import { promptUser, parseFlags } from './prompts.mjs';
import { loadCore, loadPlugin } from './plugin-loader.mjs';
import { mergeContributions } from './config-merger.mjs';
import { detectConflicts } from './conflict-resolver.mjs';
import { renderTemplate } from './render.mjs';
import { initGit, npmInstall } from './git.mjs';
import { computeMemorySlug } from './memory-slug.mjs';
import { fingerprintFiles, pathExists, ensureDir } from './utils.mjs';
import { resolvePlugins } from './presets-loader.mjs';
import { writeLockPath, baselineDir } from './harness-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(__dirname, '..');
const HARNESS_VERSION = '1.0.0';

export async function run(argv) {
  const { positional, flags } = parseFlags(argv);
  const requestedName = positional[0];

  banner();

  // Resolve target dir
  const projectName = requestedName || (flags['no-prompt'] ? null : null);
  if (!projectName && flags['no-prompt']) {
    throw new Error('Project name required when --no-prompt is set.');
  }

  // Interactive prompts (or skipped if --no-prompt)
  const answers = flags['no-prompt']
    ? await flagsToAnswers(flags, requestedName)
    : await promptUser({ defaultName: requestedName });

  // --in-place: scaffold into cwd instead of creating a subdir.
  // Used by init-project skill when invoked inside an empty repo.
  const inPlace = flags['in-place'] === true;
  const targetDir = inPlace
    ? process.cwd()
    : path.resolve(process.cwd(), answers.projectName);

  if (!inPlace && await pathExists(targetDir)) {
    throw new Error(
      `Directory "${answers.projectName}" already exists. Pick another name or remove it.`
    );
  }
  if (inPlace) {
    // Refuse if cwd already has a Claude harness — explicit guard.
    const conflicts = ['.claude/settings.json', '.arthus-harness.json'];
    for (const c of conflicts) {
      if (await pathExists(path.join(targetDir, c))) {
        throw new Error(
          `--in-place: ${c} already exists in cwd. Refusing to overwrite a bootstrapped project.`
        );
      }
    }
  }

  // Load core + plugins
  const corePath = path.join(HARNESS_ROOT, 'core');
  const pluginsRoot = path.join(HARNESS_ROOT, 'plugins');

  console.log(kleur.gray(`  loading core from ${path.relative(process.cwd(), corePath)}`));
  const core = await loadCore(corePath);

  const plugins = [];
  for (const pluginName of answers.plugins) {
    const pluginPath = path.join(pluginsRoot, pluginName);
    if (!(await pathExists(pluginPath))) {
      throw new Error(`Plugin not found: ${pluginName} (looked in ${pluginPath})`);
    }
    console.log(kleur.gray(`  loading plugin ${kleur.cyan(pluginName)}`));
    plugins.push(await loadPlugin(pluginPath, pluginName));
  }

  // Detect conflicts before any write
  detectConflicts([core, ...plugins]);

  // Merge contributions in order: core, then plugins (topo-sorted by `requires`)
  const merged = mergeContributions([core, ...plugins]);

  // Compute memory slug (Q1 algorithm: projectName + optional remote hash)
  const memorySlug = await computeMemorySlug({
    projectName: answers.projectName,
    targetDir,
  });

  const renderContext = {
    projectName: answers.projectName,
    projectSlug: slugify(answers.projectName),
    description: answers.description || `${answers.projectName} — bootstrapped from arthus-harness v${HARNESS_VERSION}`,
    plugins: answers.plugins,
    pluginsList: answers.plugins.length > 0 ? answers.plugins.join(', ') : 'none',
    principles: answers.principles,
    principlesIsLiteral: answers.principles === 'A' || answers.principles === 'both',
    principlesIsFramework: answers.principles === 'C' || answers.principles === 'both',
    memorySlug,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    harnessVersion: HARNESS_VERSION,
    nodeVersion: '20.x',
    hasSupabase: answers.plugins.includes('supabase'),
    hasDesignSystem: answers.plugins.includes('design-system-pipeline'),
    hasE2E: answers.plugins.includes('e2e-playwright'),
    hasI18n: answers.plugins.includes('i18n'),
    hasPaymentAsaas: answers.plugins.includes('payment-asaas'),
    hasJourneyMapping: answers.plugins.includes('journey-mapping'),
  };

  // Render + write
  await ensureDir(targetDir);
  let writtenCount = 0;
  for (const file of merged.files) {
    let content = file.content;
    if (file.template) {
      content = renderTemplate(file.content, renderContext);
    }
    const target = path.join(targetDir, file.relPath);
    await ensureDir(path.dirname(target));
    await fs.writeFile(target, content);
    writtenCount++;
  }
  console.log(kleur.gray(`  wrote ${writtenCount} files`));

  // Make hooks executable on Unix
  if (process.platform !== 'win32') {
    for (const file of merged.files) {
      if (file.relPath.endsWith('.cjs') && file.relPath.includes('/hooks/')) {
        await fs.chmod(path.join(targetDir, file.relPath), 0o755);
      }
    }
  }

  // Generate package.json (merged from contributions)
  await writeProjectPackageJson(targetDir, merged.package, answers, renderContext);

  // Write baselines (renders cached for 3-way merge in `arthus-harness sync`)
  await writeBaselines(targetDir, merged.files, renderContext);

  // Generate .arthus-harness/lock.json
  await writeHarnessLockfile(targetDir, {
    version: HARNESS_VERSION,
    preset: answers.preset || 'custom',
    plugins: answers.plugins,
    principles: answers.principles,
    answers: {
      projectName: answers.projectName,
      description: answers.description,
    },
    memorySlug,
    fingerprint: await fingerprintFiles(targetDir, merged.files.map((f) => f.relPath)),
    bootstrappedAt: new Date().toISOString(),
  });

  // Append to .env.example from plugin contributions
  if (merged.env.length > 0) {
    await writeEnvExample(targetDir, merged.env, answers.plugins);
  }

  // Optionally: git init + first commit
  if (answers.gitInit) {
    await initGit(targetDir, HARNESS_VERSION);
  }

  // Optionally: npm install
  if (answers.installDeps && Object.keys(merged.package.deps || {}).length + Object.keys(merged.package.devDeps || {}).length > 0) {
    await npmInstall(targetDir);
  }

  printNextSteps(answers);
}

function banner() {
  const v = HARNESS_VERSION;
  console.log('');
  console.log(kleur.bold().cyan('  arthus-harness') + kleur.gray(` v${v}`));
  console.log(kleur.gray('  Generic Claude Code harness — bootstraps disciplina + 3 camadas de proteção'));
  console.log('');
}

async function flagsToAnswers(flags, projectName) {
  return {
    projectName: projectName || flags.name || 'my-project',
    description: flags.description || '',
    preset: flags.preset || 'minimal',
    plugins: await resolvePlugins({ pluginsFlag: flags.plugins, presetName: flags.preset }),
    principles: flags.principles || 'A',
    gitInit: flags['no-git'] !== true,
    installDeps: flags['no-install'] !== true,
  };
}

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function writeProjectPackageJson(targetDir, mergedPackage, answers, ctx) {
  const pkgPath = path.join(targetDir, 'package.json');
  const baseScripts = {
    'check:all': buildCheckAll(mergedPackage.scripts || {}),
  };
  const allScripts = { ...(mergedPackage.scripts || {}), ...baseScripts };

  const pkg = {
    name: ctx.projectSlug,
    version: '0.1.0',
    private: true,
    description: ctx.description,
    type: 'module',
    scripts: allScripts,
    dependencies: mergedPackage.deps || {},
    devDependencies: mergedPackage.devDeps || {},
  };

  // If package.json already exists from a plugin's `files`, merge instead of overwrite
  if (await pathExists(pkgPath)) {
    const existing = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    const merged = {
      ...existing,
      ...pkg,
      scripts: { ...existing.scripts, ...pkg.scripts },
      dependencies: { ...existing.dependencies, ...pkg.dependencies },
      devDependencies: { ...existing.devDependencies, ...pkg.devDependencies },
    };
    await fs.writeFile(pkgPath, JSON.stringify(merged, null, 2) + '\n');
  } else {
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
}

function buildCheckAll(scripts) {
  const ordered = ['lint', 'type-check', 'design:check', 'i18n:check', 'docs:check'];
  const present = ordered.filter((s) => scripts[s]);
  return present.length === 0 ? 'echo "no checks configured"' : present.map((s) => `npm run ${s}`).join(' && ');
}

async function writeHarnessLockfile(targetDir, lockData) {
  const lockPath = writeLockPath(targetDir);
  await ensureDir(path.dirname(lockPath));
  await fs.writeFile(lockPath, JSON.stringify(lockData, null, 2) + '\n');
}

/**
 * Write rendered templates to .arthus-harness/baseline/ for use as BASE in 3-way merge.
 * Mirrors the project tree exactly — one baseline file per generated file.
 */
async function writeBaselines(targetDir, files, renderContext) {
  const baseDir = baselineDir(targetDir);
  await ensureDir(baseDir);
  for (const file of files) {
    const content = file.template ? renderTemplate(file.content, renderContext) : file.content;
    const target = path.join(baseDir, file.relPath);
    await ensureDir(path.dirname(target));
    await fs.writeFile(target, content);
  }
}

async function writeEnvExample(targetDir, envKeys, plugins) {
  const envPath = path.join(targetDir, '.env.example');
  const lines = [
    '# .env.example — copy to .env and fill in values',
    '# NEVER commit .env (already in .gitignore)',
    '',
  ];
  // Group by plugin
  const byPlugin = {};
  for (const e of envKeys) {
    byPlugin[e.plugin] = byPlugin[e.plugin] || [];
    byPlugin[e.plugin].push(e.key);
  }
  for (const [plugin, keys] of Object.entries(byPlugin)) {
    lines.push(`# from plugin: ${plugin}`);
    for (const k of keys) {
      lines.push(`${k}=<PLACEHOLDER>`);
    }
    lines.push('');
  }
  await fs.writeFile(envPath, lines.join('\n'));
}

function printNextSteps(answers) {
  console.log('');
  console.log(kleur.green().bold('  ✓ Done.'));
  console.log('');
  console.log(kleur.bold('  Next steps:'));
  console.log('');
  console.log(`    ${kleur.cyan('cd ' + answers.projectName)}`);
  if (!answers.installDeps) {
    console.log(`    ${kleur.cyan('npm install')}`);
  }
  console.log(`    ${kleur.cyan('# Read CLAUDE.md (operational manual)')}`);
  console.log(`    ${kleur.cyan('# Read MISSION.md (technical invariants — fill in TODOs)')}`);
  console.log(`    ${kleur.cyan('# Read Docs/produto/principios-de-experiencia.md')}`);
  console.log('');
  console.log(kleur.gray('  Yak-shaving warning:'));
  console.log(kleur.gray('  If you spend > 2h tuning the harness instead of the actual project,'));
  console.log(kleur.gray('  stop. The harness is a means, not the end.'));
  console.log('');
}
