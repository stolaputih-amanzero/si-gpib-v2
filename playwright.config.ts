import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    // Mobile devices (primary target)
    {
      name: 'Mobile Chrome (Android mid-range)',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36',
        permissions: ['geolocation'],
        geolocation: { longitude: 115.487099, latitude: 0.331233 },
      },
    },
    {
      name: 'Mobile Safari (iPhone SE)',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
        permissions: ['geolocation'],
        geolocation: { longitude: 115.487099, latitude: 0.331233 },
      },
    },
    // Desktop (fallback)
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
