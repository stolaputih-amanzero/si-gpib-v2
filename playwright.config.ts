import { defineConfig, devices } from '@playwright/test';

const isProd = process.env.E2E_MODE === 'production';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    ...devices['Pixel 7'],
    storageState: 'e2e/.auth/pj-storage.json',
    trace: 'on-first-retry',
  },
  webServer: {
    command: isProd ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/, use: { storageState: undefined } },
    { name: 'cj1', dependencies: ['setup'] },
  ],
});
