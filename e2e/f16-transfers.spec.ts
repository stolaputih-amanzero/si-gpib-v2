import { test, expect } from '@playwright/test';

test.describe('Fase 16 — Pastoral Transfers Capability E2E Suite (/transfers)', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  test('01. Cold load /transfers renders TransferWorkspaceShell header and content', async ({ page }) => {
    await page.goto('/transfers');
    await page.waitForLoadState('networkidle');

    // Title / Header Assertions
    await expect(page.locator('text=Pastoral Transfer & Relocation Engine').first()).toBeVisible();
    await expect(page.locator('text=Pdt. Abraham Lincoln, M.Th.').first()).toBeVisible();
    await expect(page.locator('text=Timelines & Continuity Histori Pelayanan').first()).toBeVisible();
  });

  test('02. Clicking Buat Usulan Mutasi Baru opens ProposalTransferModal', async ({ page }) => {
    await page.goto('/transfers');
    await page.waitForLoadState('networkidle');

    const proposalBtn = page.locator('button:has-text("Buat Usulan Mutasi Baru")');
    await expect(proposalBtn).toBeVisible();
    await proposalBtn.click();

    // Verify modal appears
    await expect(page.locator('text=Buat Usulan Mutasi Pelayan Baru').first()).toBeVisible();
    await expect(page.locator('button:has-text("Kirim Proposal Mutasi")')).toBeVisible();
  });
});
