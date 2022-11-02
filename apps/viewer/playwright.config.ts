import { PlaywrightTestConfig } from '@playwright/test'
import path from 'path'
import { playwrightBaseConfig } from 'configs/playwright'

const config: PlaywrightTestConfig = {
  ...playwrightBaseConfig,
  testDir: path.join(__dirname, 'playwright/tests'),
  webServer: process.env.CI
    ? {
        ...(playwrightBaseConfig.webServer as { command: string }),
        port: 3001,
      }
    : undefined,
  use: {
    ...playwrightBaseConfig.use,
    baseURL: process.env.NEXT_PUBLIC_VIEWER_URL,
  },
  outputDir: path.join(__dirname, 'playwright/test-results/'),
}

export default config
