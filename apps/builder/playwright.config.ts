import { PlaywrightTestConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

if (fs.existsSync(path.join(__dirname, '.env.local')))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({
    path: path.join(__dirname, '.env.local'),
  })

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve(path.join(__dirname, 'playwright/global-setup')),
  testDir: path.join(__dirname, 'playwright/tests'),
  timeout: process.env.CI ? 50 * 1000 : 20 * 1000,
  expect: {
    timeout: process.env.CI ? 10 * 1000 : 5 * 1000,
  },
  retries: process.env.NO_RETRIES ? 0 : 1,
  workers: process.env.CI ? 1 : 3,
  reporter: [[process.env.CI ? 'github' : 'list'], ['html']],
  maxFailures: process.env.CI ? 10 : undefined,
  webServer: process.env.CI
    ? {
        command: 'cd ../.. && pnpm run ci:e2e:start',
        port: 3000,
        timeout: 60_000,
        reuseExistingServer: true,
      }
    : undefined,
  use: {
    actionTimeout: 0,
    baseURL: process.env.NEXTAUTH_URL,
    trace: 'on-first-retry',
    storageState: path.join(__dirname, 'playwright/firstUser.json'),
    video: 'retain-on-failure',
    locale: 'en-US',
    browserName: 'chromium',
    viewport: { width: 1400, height: 1000 },
  },
  outputDir: path.join(__dirname, 'playwright/test-results/'),
}
export default config
