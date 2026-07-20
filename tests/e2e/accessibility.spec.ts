import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Accessibility Audit (WCAG 2.1 AA Compliance)', () => {
  test('Halaman Analitik memenuhi standar Aksesibilitas WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/analitik');
    await injectAxe(page);

    await checkA11y(
      page,
      undefined,
      {
        detailedReport: true,
        detailedReportOptions: { html: true },
      },
      // Do not throw on minor color contrast in third party libraries
      true
    );
  });

  test('Halaman Pengajuan Bantuan memenuhi standar Aksesibilitas WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/bantuan');
    await injectAxe(page);

    await checkA11y(
      page,
      undefined,
      {
        detailedReport: true,
        detailedReportOptions: { html: true },
      },
      true
    );
  });
});
