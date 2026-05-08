// Detects hard conflicts between core + plugin contributions.
// Throws with a friendly diagnostic. Soft conflicts (skill name dup, dep semver) are warnings.

import kleur from 'kleur';

export function detectConflicts(contributions) {
  const errors = [];
  const warnings = [];

  // Hard: same file path from two contributions (excluding settings.json which we merge)
  const fileOwners = new Map();
  for (const c of contributions) {
    for (const f of c.files) {
      if (f.relPath === '.claude/settings.json') continue;
      if (fileOwners.has(f.relPath)) {
        errors.push(
          `File path collision: ${kleur.red(f.relPath)} contributed by both ${kleur.cyan(
            fileOwners.get(f.relPath)
          )} and ${kleur.cyan(c.name)}. Plugins must namespace under src/integrations/<plugin>/.`
        );
      } else {
        fileOwners.set(f.relPath, c.name);
      }
    }
  }

  // Hard: same package.json script name
  const scriptOwners = new Map();
  for (const c of contributions) {
    for (const scriptName of Object.keys(c.package?.scripts || {})) {
      if (scriptOwners.has(scriptName)) {
        errors.push(
          `package.json script collision: ${kleur.red(scriptName)} contributed by both ${kleur.cyan(
            scriptOwners.get(scriptName)
          )} and ${kleur.cyan(c.name)}. Rename or remove from one plugin.`
        );
      } else {
        scriptOwners.set(scriptName, c.name);
      }
    }
  }

  // Soft: dep version mismatch (warn only — config-merger picks higher semver)
  const depOwners = new Map();
  for (const c of contributions) {
    for (const [depName, version] of Object.entries({
      ...(c.package?.deps || {}),
      ...(c.package?.devDeps || {}),
    })) {
      if (depOwners.has(depName)) {
        const [prevOwner, prevVersion] = depOwners.get(depName);
        if (prevVersion !== version) {
          warnings.push(
            `Dep version mismatch: ${kleur.yellow(depName)} — ${prevOwner} wants ${prevVersion}, ${c.name} wants ${version}. Picking higher.`
          );
        }
      }
      depOwners.set(depName, [c.name, version]);
    }
  }

  // Hard: explicit `conflicts` declared in plugin.yaml
  const names = new Set(contributions.map((c) => c.name));
  for (const c of contributions) {
    for (const conflictName of c.conflicts || []) {
      if (names.has(conflictName)) {
        errors.push(
          `Plugin ${kleur.cyan(c.name)} declares conflict with ${kleur.cyan(
            conflictName
          )}, which is also being installed. Pick one.`
        );
      }
    }
  }

  if (errors.length > 0) {
    const msg =
      kleur.red().bold('  ✗ Conflicts detected:\n\n') +
      errors.map((e) => '    • ' + e).join('\n') +
      '\n';
    throw new Error(msg);
  }

  if (warnings.length > 0) {
    console.log(kleur.yellow().bold('  ! Warnings:'));
    for (const w of warnings) {
      console.log('    • ' + w);
    }
    console.log('');
  }
}
