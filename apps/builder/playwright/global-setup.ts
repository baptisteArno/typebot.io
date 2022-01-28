import { chromium, FullConfig, Page } from '@playwright/test'
import { setupDatabase, teardownDatabase, user } from './services/database'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  if (!baseURL) throw new Error('baseURL is missing')

  await teardownDatabase()
  await setupDatabase()

  // Skip auth if debugging
  if (process.env.PWDEBUG === '1') return

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await signIn(page, user.email)
  await page.context().storageState({
    path: './playwright/authenticatedState.json',
  })
}

const signIn = async (page: Page, email: string) => {
  await page.goto('http://localhost:3000/api/auth/signin')
  await page.fill('[placeholder="credentials\\@email\\.com"]', email)
  await Promise.all([
    page.waitForNavigation({ url: 'http://localhost:3000/typebots' }),
    page.press('[placeholder="credentials\\@email\\.com"]', 'Enter'),
  ])
}

export default globalSetup
