import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

type AxeImpact = 'minor' | 'moderate' | 'serious' | 'critical';

interface AxeChecksOptions {
  /** Filter violations by impact. Defaults to 'critical'. */
  impact?: AxeImpact;
  /** WCAG tags to include. Defaults to wcag2a + wcag2aa. */
  tags?: string[];
  /** Rule IDs to skip. Defaults to ['region'] (avoid noise from page chrome). */
  disableRules?: string[];
}

/**
 * Run axe against `scope` and return only violations at the given impact.
 *
 * Logs each match for debugging. The default scope `'main'` keeps the audit
 * focused on the surface under test instead of the surrounding header/sidebar.
 *
 * @example
 *   const critical = await axeChecks(page, 'main', { impact: 'critical' });
 *   expect(critical).toHaveLength(0);
 */
export async function axeChecks(
  page: Page,
  scope: string = 'main',
  opts: AxeChecksOptions = {},
) {
  const {
    impact = 'critical',
    tags = ['wcag2a', 'wcag2aa'],
    disableRules = ['region'],
  } = opts;

  const builder = new AxeBuilder({ page }).include(scope).withTags(tags).disableRules(disableRules);
  const results = await builder.analyze();

  const matched = results.violations.filter((v) => v.impact === impact);
  if (matched.length > 0) {
     
    console.log(`[axe] ${impact.toUpperCase()} violations on ${page.url()}:`);
    for (const v of matched) {
       
      console.log(`  - ${v.id}: ${v.description}`);
    }
  }
  return matched;
}
