// Eta templating wrapper.
// Templates use <%= var %> for interpolation and <% if (cond) { %>...<% } %> for conditionals.
// Eta is preferred over Mustache (logic-less) and Handlebars (heavyweight).

import { Eta } from 'eta';

const eta = new Eta({
  autoEscape: false,         // we generate code, not HTML
  useWith: true,             // allow `<%= projectName %>` instead of `<%= it.projectName %>`
  rmWhitespace: false,
  autoTrim: false,           // preserve newlines around tags (markdown is whitespace-sensitive)
  cache: false,
});

export function renderTemplate(content, context) {
  try {
    return eta.renderString(content, context);
  } catch (err) {
    throw new Error(`Template rendering failed: ${err.message}\n--- content (first 200 chars) ---\n${content.slice(0, 200)}`);
  }
}
