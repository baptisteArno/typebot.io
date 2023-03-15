import { PlaywrightTestConfig } from '@playwright/test'
import path from 'path'
import { playwrightBaseConfig } from '@typebot.io/lib/playwright/baseConfig'

const config: PlaywrightTestConfig = {
  ...playwrightBaseConfig,
  webServer: process.env.CI
    ? {
        ...(playwrightBaseConfig.webServer as { command: string }),
        port: 3000,
      }
    : undefined,
  use: {
    ...playwrightBaseConfig.use,
    baseURL: process.env.NEXTAUTH_URL,
    storageState: path.join(__dirname, 'src/test/storageState.json'),
  },
}

export default config
