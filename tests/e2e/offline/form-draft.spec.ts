import { test, expect } from '../fixtures';

test.describe('Offline Form Draft & Recovery', () => {
  test('should auto-save form draft to localStorage and restore on page reload', async ({ authenticatedMobilePage: page }) => {
    // 1. Navigate to pastoral log form
    await page.goto('/dashboard/pastoral/baru');
    await page.waitForLoadState('networkidle');

    // Select scope & chip
    await page.getByTestId('target-scope-jemaat').click();
    const chip = page.getByTestId('chip-kunjungan-jemaat');
    if (await chip.isVisible().catch(() => false)) {
      await chip.click();
    }

    // 2. Fill form fields
    const catatanInput = page.getByTestId('input-catatan');
    await catatanInput.focus();
    await catatanInput.fill('Kunjungan pastoral jemaat sektor 3 di pos pelkes');
    await catatanInput.dispatchEvent('input');
    await catatanInput.dispatchEvent('change');
    await catatanInput.blur();

    const jiwaInput = page.getByTestId('input-jml-jiwa');
    await jiwaInput.focus();
    await jiwaInput.fill('12');
    await jiwaInput.dispatchEvent('input');
    await jiwaInput.dispatchEvent('change');
    await jiwaInput.blur();

    // 3. Verify draft item saved in localStorage
    await expect.poll(async () => {
      const rawDraft = await page.evaluate(() => localStorage.getItem('draft:log-pastoral'));
      if (!rawDraft) return null;
      try {
        const parsed = JSON.parse(rawDraft);
        return parsed.data?.catatan;
      } catch {
        return null;
      }
    }, { timeout: 5000 }).toContain('Kunjungan pastoral');

    // 4. Reload page to test draft recovery
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 5. Verify fields populated from restored draft
    await expect(page.getByTestId('input-catatan')).toHaveValue(/Kunjungan pastoral jemaat sektor 3/);
  });

  test('should clear form draft from localStorage after successful submission', async ({ authenticatedMobilePage: page, context }) => {
    await page.goto('/dashboard/pastoral/baru');
    await page.waitForLoadState('networkidle');

    // Select scope & chip
    await page.getByTestId('target-scope-jemaat').click();
    const chip = page.getByTestId('chip-kunjungan-jemaat');
    if (await chip.isVisible().catch(() => false)) {
      await chip.click();
    }

    // Fill form
    await page.getByTestId('input-catatan').fill('Kunjungan pastoral siap submit');
    await page.getByTestId('input-catatan').blur();

    // Verify draft was saved
    await expect.poll(async () => {
      return await page.evaluate(() => localStorage.getItem('draft:log-pastoral'));
    }, { timeout: 5000 }).not.toBeNull();

    // Set offline & submit form
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForTimeout(300);

    await page.getByTestId('button-submit').click();

    // Verify localStorage draft is cleared
    await expect.poll(async () => {
      return await page.evaluate(() => localStorage.getItem('draft:log-pastoral'));
    }, { timeout: 5000 }).toBeNull();

    // Restore online
    await context.setOffline(false);
  });
});
