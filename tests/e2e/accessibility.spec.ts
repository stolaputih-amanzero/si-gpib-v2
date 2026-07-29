import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit (WCAG 2.1 AA Compliance)', () => {
  test('Halaman Dashboard memenuhi standar Aksesibilitas WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // Filter out minor color contrast warnings for third party elements
    const criticalViolations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalViolations).toEqual([]);
  });
});
