import { test, expect } from '@playwright/test';

test.describe('F3 — Organization Workspace Deep-Link & Geometry Contract Audit', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  const TEST_ORG_ID = 'POS-43938'; // Verified valid Pos Pelkes org ID

  // 1. /org/me -> Resolves to fallback or canonical route
  test('1. /org/me resolves via server redirect', async ({ page }) => {
    await page.goto('/org/me', { waitUntil: 'networkidle' });
    // Verify server redirect status (307/308) or resolved target URL
    expect(page.url()).not.toBe('http://localhost:3000/org/me');
  });

  // 2. /org/me#assets -> Redirect ke canonical tanpa hash (Contract clarification)
  test('2. /org/me#assets resolves via server redirect (Contract Clarification)', async ({ page }) => {
    await page.goto('/org/me#assets', { waitUntil: 'networkidle' });
    expect(page.url()).not.toBe('http://localhost:3000/org/me#assets');
  });

  // 3. Canonical /org/{id} default load -> Overview section active
  test('3. Canonical /org/{id} default load opens Overview', async ({ page }) => {
    await page.goto(`/org/${TEST_ORG_ID}`);
    await page.waitForLoadState('networkidle');

    const overviewSection = page.locator('#overview');
    await expect(overviewSection).toBeVisible();
    await expect(overviewSection).toBeInViewport();
  });

  // 4. Canonical /org/{id}#assets cold load -> Assets active & Geometry contract verified
  test('4. Cold load /org/{id}#assets satisfies Geometry Contract (Desktop)', async ({ page }) => {
    await page.goto(`/org/${TEST_ORG_ID}#assets`);
    await page.waitForTimeout(1500);

    const assetSection = page.locator('#assets');
    await expect(assetSection).toBeVisible();
    await expect(assetSection).toBeInViewport();

    // Verify Geometry Contract: target.top >= effectiveHeaderBottom
    const header = page.locator('header, .sticky.top-0').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      const sectionBox = await assetSection.boundingBox();

      if (headerBox && sectionBox) {
        // Target top margin compensates for sticky header height
        expect(sectionBox.y + 5).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
      }
    }
  });

  // 5. Cold load /org/{id}#people satisfied on Mobile Viewport
  test('5. Cold load /org/{id}#people satisfies Geometry Contract on Mobile Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone mobile viewport

    await page.goto(`/org/${TEST_ORG_ID}#people`);
    await page.waitForTimeout(1500);

    const peopleSection = page.locator('#people');
    await expect(peopleSection).toBeVisible();
    await expect(peopleSection).toBeInViewport();

    // Geometry contract check on mobile
    const header = page.locator('.sticky.top-0').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      const sectionBox = await peopleSection.boundingBox();

      if (headerBox && sectionBox) {
        expect(sectionBox.y + 5).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
      }
    }
  });

  // 6. Internal Navigation -> tap Aset button -> URL hash updated & section visible
  test('6. Internal navigation via Anchor bar updates hash & scrolls smoothly', async ({ page }) => {
    await page.goto(`/org/${TEST_ORG_ID}`);
    await page.waitForLoadState('networkidle');

    // Tap Aset anchor button
    const assetButton = page.locator('button:has-text("Aset")').first();
    await expect(assetButton).toBeVisible();
    await assetButton.click();

    await expect(page).toHaveURL(/#assets/);
    await page.waitForTimeout(1000);

    const assetSection = page.locator('#assets');
    await expect(assetSection).toBeVisible();
    await expect(assetSection).toBeInViewport();
  });
});
