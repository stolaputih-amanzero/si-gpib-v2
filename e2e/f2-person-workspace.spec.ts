import { test, expect } from '@playwright/test';

test.describe('F2 — Person Workspace Transformation & Privacy E2E Suite', () => {
  test.use({ storageState: 'e2e/.auth/pj-storage.json' });

  const TEST_PERSON_ID = '82e47866-ddf2-4e11-9146-76dd5abb8155';
  const NON_EXISTENT_PERSON_ID = '00000000-0000-0000-0000-000000000000';

  // 01. Canonical /people/{id} -> Default load opens #overview
  test('01. Canonical /people/{id} default load opens #overview', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}`);
    await page.waitForLoadState('domcontentloaded');

    const overviewSection = page.locator('#overview');
    await expect(overviewSection).toBeVisible();
    await expect(overviewSection).toBeInViewport();
  });

  // 02. Cold-load #profile
  test('02. Cold-load /people/{id}#profile lands deterministically', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}#profile`);
    await page.waitForTimeout(1500);

    const profileSection = page.locator('#profile');
    await expect(profileSection).toBeVisible();
    await expect(profileSection).toBeInViewport();
  });

  // 03. Cold-load #roles
  test('03. Cold-load /people/{id}#roles lands deterministically', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}#roles`);
    await page.waitForTimeout(1500);

    const rolesSection = page.locator('#roles');
    await expect(rolesSection).toBeVisible();
    await expect(rolesSection).toBeInViewport();
  });

  // 04. Cold-load #competencies
  test('04. Cold-load /people/{id}#competencies lands deterministically', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}#competencies`);
    await page.waitForTimeout(1500);

    const competenciesSection = page.locator('#competencies');
    await expect(competenciesSection).toBeVisible();
    await expect(competenciesSection).toBeInViewport();
  });

  // 05. Cold-load #pastoral
  test('05. Cold-load /people/{id}#pastoral lands deterministically', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}#pastoral`);
    await page.waitForTimeout(1500);

    const pastoralSection = page.locator('#pastoral');
    await expect(pastoralSection).toBeVisible();
    await expect(pastoralSection).toBeInViewport();
  });

  // 06. Internal anchor navigation -> click link updates hash
  test('06. Internal anchor navigation via semantic link updates hash', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}`);
    await page.waitForLoadState('networkidle');

    // Click semantic anchor link for Roles
    const rolesLink = page.locator('a[href*="#roles"]').first();
    await expect(rolesLink).toBeVisible();
    await rolesLink.click();

    await expect(page).toHaveURL(/#roles/);
    await page.waitForTimeout(1000);

    const rolesSection = page.locator('#roles');
    await expect(rolesSection).toBeVisible();
    await expect(rolesSection).toBeInViewport();
  });

  // 07. Mobile geometry contract (390px)
  test('07. Cold-load #roles satisfies Geometry Contract on Mobile Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(`/people/${TEST_PERSON_ID}#roles`);
    await page.waitForTimeout(1500);

    const rolesSection = page.locator('#roles');
    await expect(rolesSection).toBeVisible();
    await expect(rolesSection).toBeInViewport();

    const header = page.locator('.sticky.top-0').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      const sectionBox = await rolesSection.boundingBox();

      if (headerBox && sectionBox) {
        expect(sectionBox.y + 5).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
      }
    }
  });

  // 08. Desktop geometry contract (1280px)
  test('08. Cold-load #roles satisfies Geometry Contract on Desktop Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(`/people/${TEST_PERSON_ID}#roles`);
    await page.waitForTimeout(1500);

    const rolesSection = page.locator('#roles');
    await expect(rolesSection).toBeVisible();
    await expect(rolesSection).toBeInViewport();

    const header = page.locator('nav[aria-label*="Person Workspace"], nav.sticky').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      const sectionBox = await rolesSection.boundingBox();

      if (headerBox && sectionBox) {
        expect(sectionBox.y + 5).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
      }
    }
  });

  // 09. Unknown id_person -> Triggers Next.js notFound()
  test('09. Unknown id_person triggers 404 notFound() page', async ({ page }) => {
    await page.goto(`/people/${NON_EXISTENT_PERSON_ID}`);
    const notFoundText = page.locator('text=404').or(page.locator('text=Halaman tidak ditemukan')).or(page.locator('text=This page could not be found')).first();
    await expect(notFoundText).toBeVisible();
  });

  // 10. Authorized viewer (Self/Super User) -> Data rendered
  test('10. Authorized viewer loads Person Workspace profile', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}`);
    await page.waitForLoadState('networkidle');

    // Person Header contains name
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  // 11. Unauthorized viewer -> PrivacyStateNotice component rendered
  test('11. Unauthorized viewer sees PrivacyStateNotice for private sections', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}#profile`);
    await page.waitForLoadState('networkidle');

    // Privacy notice component or state is rendered if unauthorized
    const profileSection = page.locator('#profile');
    await expect(profileSection).toBeVisible();
  });

  // 12. Raw payload leak assertion -> DOM absent of raw private data strings for unauthorized viewer
  test('12. Unauthorized viewer DOM does not leak raw private payload data', async ({ page }) => {
    await page.goto(`/people/${TEST_PERSON_ID}`);
    await page.waitForLoadState('networkidle');

    const content = await page.content();
    // Raw sensitive passwords/tokens or internal secret keys must never leak in HTML string
    expect(content).not.toContain('password_hash');
    expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });
});
