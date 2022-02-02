import { chromium, FullConfig, Page } from '@playwright/test'
import { existsSync } from 'fs'
import { setupDatabase, teardownDatabase } from './services/database'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env' })

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  if (!baseURL) throw new Error('baseURL is missing')

  await teardownDatabase()

  if (!existsSync('./playwright/authenticatedState.json')) {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    await signIn(page)
    await page.context().storageState({
      path: './playwright/authenticatedState.json',
    })
  }

  await setupDatabase(process.env.GITHUB_EMAIL as string)
}

const signIn = async (page: Page) => {
  if (!process.env.GITHUB_EMAIL || !process.env.GITHUB_PASSWORD)
    throw new Error(
      'GITHUB_EMAIL or GITHUB_PASSWORD are missing in the environment. They are required to log in.'
    )
  await page.goto(`${process.env.PLAYWRIGHT_BUILDER_TEST_BASE_URL}/signin`)
  await page.click('text=Continue with GitHub')
  await page.fill('input[name="login"]', process.env.GITHUB_EMAIL)
  await page.fill('input[name="password"]', process.env.GITHUB_PASSWORD)
  await page.press('input[name="password"]', 'Enter')
  try {
    await page.locator('text=Authorize baptisteArno').click({ timeout: 3000 })
  } catch {
    return
  }
  await page.waitForNavigation({
    url: `${process.env.PLAYWRIGHT_BUILDER_TEST_BASE_URL}/typebots`,
  })
}

export default globalSetup
