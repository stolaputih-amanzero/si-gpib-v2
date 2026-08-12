import { test, expect } from '@playwright/test';

test.describe('Fase 17 — Document Vault Capability E2E Suite (/vault)', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('01. Cold load /vault renders DocumentVaultWorkspaceShell header and document list', async ({ page }) => {
    await page.goto('/vault');
    await page.waitForLoadState('networkidle');

    // Title / Header Assertions
    await expect(page.locator('text=Document Vault & Object Storage Lifecycle').first()).toBeVisible();
    await expect(page.locator('text=Daftar Dokumen Lampiran Vault').first()).toBeVisible();
    await expect(page.locator('text=proposal_bantuan_pos_pelkes.pdf').first()).toBeVisible();
  });

  test('02. Clicking Unggah Dokumen Baru opens DocumentUploadModal', async ({ page }) => {
    await page.goto('/vault');
    await page.waitForLoadState('networkidle');

    const uploadBtn = page.locator('button:has-text("Unggah Dokumen Baru")');
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.click();

    // Verify modal appears
    await expect(page.locator('text=Unggah Dokumen Baru (Protokol Dua-Fase)').first()).toBeVisible();
    await expect(page.locator('button:has-text("Jalankan Dua-Fase Upload")')).toBeVisible();
  });
});
