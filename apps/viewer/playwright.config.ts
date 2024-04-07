import { defineConfig, devices } from '@playwright/test'

process.env.SKIP_ENV_CHECK = 'true'

export default defineConfig({
  timeout: process.env.CI ? 50 * 1000 : 40 * 1000,
  expect: {
    timeout: process.env.CI ? 10 * 1000 : 5 * 1000,
  },
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : 3,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html', { outputFolder: 'src/test/reporters' }],
  ],
  maxFailures: process.env.CI ? 10 : undefined,
  webServer: process.env.CI
    ? {
        command: 'pnpm run start',
        timeout: 60_000,
        reuseExistingServer: true,
        port: 3001,
      }
    : undefined,
  outputDir: './src/test/results',
  use: {
    trace: 'on-first-retry',
    locale: 'en-US',
    baseURL: process.env.NEXT_PUBLIC_VIEWER_URL,
  },
  projects: [
    {
      name: 'setup db',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup db'],
    },
  ],
})
