import { PlaywrightTestConfig } from '@playwright/test'
import path from 'path'
import { playwrightBaseConfig } from '@typebot.io/lib/playwright/baseConfig'

const config: PlaywrightTestConfig = {
  ...playwrightBaseConfig,
  testDir: path.join(__dirname, 'src'),
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
}

export default config
