import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // UAT tests run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Sequential execution for UAT
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.UAT_BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://sigpib.amanzero.space',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },
  projects: [
    {
      name: 'UAT Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        permissions: ['geolocation'],
        geolocation: { longitude: 117.140012, latitude: -0.500729 },
      },
    },
    {
      name: 'UAT Mobile Safari',
      use: {
        ...devices['iPhone 14'],
        permissions: ['geolocation'],
        geolocation: { longitude: 117.140012, latitude: -0.500729 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
