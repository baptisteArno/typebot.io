import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '../../services/database'
import path from 'path'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'
import { mockSessionApiCalls } from 'playwright/services/browser'

const typebotId = cuid()

test.beforeEach(({ page }) => mockSessionApiCalls(page))

test.describe('Send email block', () => {
  test('its configuration should work', async ({ page }) => {
    if (
      !process.env.SMTP_USERNAME ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_SECURE ||
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PASSWORD
    )
      throw new Error('SMTP_ env vars are missing')
    await importTypebotInDatabase(
      path.join(
        __dirname,
        '../../fixtures/typebots/integrations/sendEmail.json'
      ),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.click(
      `text=${process.env.NEXT_PUBLIC_SMTP_FROM?.match(/\<(.*)\>/)?.pop()}`
    )
    await page.click('text=Connect new')
    const createButton = page.locator('button >> text=Create')
    await expect(createButton).toBeDisabled()
    await page.fill(
      '[placeholder="notifications@provider.com"]',
      process.env.SMTP_USERNAME
    )
    await page.fill('[placeholder="John Smith"]', 'John Smith')
    await page.fill('[placeholder="mail.provider.com"]', process.env.SMTP_HOST)
    await page.fill(
      '[placeholder="user@provider.com"]',
      process.env.SMTP_USERNAME
    )
    await page.fill('[type="password"]', process.env.SMTP_PASSWORD)
    if (process.env.SMTP_SECURE === 'true') await page.click('text=Use TLS?')
    await page.fill('input[role="spinbutton"]', process.env.SMTP_PORT)
    await expect(createButton).toBeEnabled()
    await createButton.click()

    await expect(
      page.locator(`button >> text=${process.env.SMTP_USERNAME}`)
    ).toBeVisible()

    await page.fill(
      '[placeholder="email1@gmail.com, email2@gmail.com"]',
      'email1@gmail.com, email2@gmail.com'
    )
    await expect(page.locator('span >> text=email1@gmail.com')).toBeVisible()
    await expect(page.locator('span >> text=email2@gmail.com')).toBeVisible()

    await page.fill(
      '[placeholder="email1@gmail.com, email2@gmail.com"]',
      'email1@gmail.com, email2@gmail.com'
    )
    await page.fill('[data-testid="subject-input"]', 'Email subject')
    await page.click('text="Custom content?"')
    await page.fill('[data-testid="body-input"]', 'Here is my email')

    await page.click('text=Preview')
    await typebotViewer(page).locator('text=Go').click()
    await expect(
      page.locator('text=Emails are not sent in preview mode >> nth=0')
    ).toBeVisible()
  })
})
