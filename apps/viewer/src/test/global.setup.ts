import { test as setup } from '@playwright/test'
import { globalSetup } from '@sniper.io/playwright/globalSetup'

setup('setup db', async () => {
  await globalSetup()
})
