import { devices, PlaywrightTestConfig } from '@playwright/test'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: path.join(__dirname, 'playwright/.env'),
})

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve(path.join(__dirname, 'playwright/global-setup')),
  testDir: path.join(__dirname, 'playwright/tests'),
  timeout: 10 * 2000,
  expect: {
    timeout: 5000,
  },
  retries: process.env.NO_RETRIES ? 0 : 1,
  workers: process.env.CI ? 1 : 3,
  reporter: 'html',
  maxFailures: process.env.CI ? 10 : undefined,
  use: {
    actionTimeout: 0,
    baseURL: process.env.VIEWER_URL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    locale: 'en-US',
  },
  outputDir: path.join(__dirname, 'playwright/test-results/'),
  projects: [
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1400, height: 1000 },
      },
    },
  ],
}
export default config
