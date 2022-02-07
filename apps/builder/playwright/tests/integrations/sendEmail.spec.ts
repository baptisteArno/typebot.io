import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '../../services/database'
import path from 'path'
import { generate } from 'short-uuid'
import { typebotViewer } from '../../services/selectorUtils'

const typebotId = generate()

test.describe('Send email step', () => {
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
      `text=${process.env.NEXT_PUBLIC_EMAIL_NOTIFICATIONS_FROM_EMAIL}`
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
    await page.fill('[data-testid="body-input"]', 'Here is my email')

    await page.click('text=Preview')
    await typebotViewer(page).locator('text=Go').click()
    await page.waitForResponse(
      (resp) =>
        resp.request().url().includes('/api/integrations/email') &&
        resp.status() === 200 &&
        resp.request().method() === 'POST'
    )
  })
})
