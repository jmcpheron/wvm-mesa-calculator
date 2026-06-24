// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Tests load the real published artifact: a static server serves the docs/
 * folder exactly as GitHub Pages will, and the specs drive http://localhost:4173/.
 * See https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Serve docs/ the same way GitHub Pages does (static files, no caching).
  webServer: {
    command: 'npx http-server docs -p 4173 -c-1',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
