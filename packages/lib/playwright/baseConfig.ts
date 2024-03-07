import { PlaywrightTestConfig } from '@playwright/test'
import path from 'path'

export const playwrightBaseConfig: PlaywrightTestConfig = {
  globalSetup: require.resolve(path.join(__dirname, 'globalSetup')),
  timeout: process.env.CI ? 50 * 1000 : 40 * 1000,
  expect: {
    timeout: process.env.CI ? 10 * 1000 : 5 * 1000,
  },
  retries: 0,
  workers: process.env.CI ? 2 : 3,
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
      }
    : undefined,
  outputDir: './src/test/results',
  use: {
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    locale: 'en-US',
    browserName: 'chromium',
    viewport: { width: 1400, height: 1000 },
  },
}
