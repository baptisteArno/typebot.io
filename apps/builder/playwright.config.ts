import { PlaywrightTestConfig } from '@playwright/test'
import path from 'path'
import { playwrightBaseConfig } from 'configs/playwright'

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
  outputDir: path.join(__dirname, 'src/test/results/'),
}

export default config
