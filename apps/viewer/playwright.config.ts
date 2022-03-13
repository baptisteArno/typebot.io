import { devices, PlaywrightTestConfig } from '@playwright/test'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: path.join(__dirname, '.env.local') })

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve(path.join(__dirname, 'playwright/global-setup')),
  testDir: path.join(__dirname, 'playwright/tests'),
  timeout: 10 * 2000,
  expect: {
    timeout: 5000,
  },
  retries: process.env.NO_RETRIES ? 0 : 2,
  workers: process.env.CI ? 1 : 3,
  reporter: 'html',
  maxFailures: process.env.CI ? 10 : undefined,
  use: {
    actionTimeout: 0,
    baseURL: process.env.NEXT_PUBLIC_VIEWER_URL,
    storageState: path.join(__dirname, 'playwright/proUser.json'),
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
