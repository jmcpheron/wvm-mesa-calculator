// @ts-check
// Accessibility guardrail: scans the real rendered calculator page with axe-core
// and fails the build on any WCAG 2.0/2.1 Level A or AA violation. This is what
// keeps future edits (a dropped label, a missing alt, low-contrast text) from
// quietly regressing accessibility for students using screen readers or keyboards.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('calculator page has no WCAG A/AA accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // On failure, the assertion message lists each violating rule + node so the
  // person who broke it can see exactly what to fix.
  expect(
    results.violations,
    formatViolations(results.violations),
  ).toEqual([]);
});

/** @param {import('axe-core').Result[]} violations */
function formatViolations(violations) {
  if (violations.length === 0) return 'No accessibility violations';
  return violations
    .map((v) => `• [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`)
    .join('\n');
}
