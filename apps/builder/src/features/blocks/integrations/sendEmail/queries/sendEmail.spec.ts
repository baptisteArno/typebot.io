import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/lib/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = createId()

test.describe('Send email block', () => {
  test('its configuration should work', async ({ page }) => {
    if (
      !process.env.SMTP_USERNAME ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PASSWORD ||
      !process.env.NEXT_PUBLIC_SMTP_FROM
    )
      throw new Error('SMTP_ env vars are missing')
    await importTypebotInDatabase(
      getTestAsset('typebots/integrations/sendEmail.json'),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.click(`text=notifications@typebot.io`)
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
    await page.getByLabel('Subject:').fill('Email subject')
    await page.click('text="Custom content?"')
    await page.locator('textarea').fill('Here is my email')

    await page.click('text=Preview')
    await page.locator('typebot-standard').locator('text=Go').click()
    await expect(
      page.locator('text=Emails are not sent in preview mode >> nth=0')
    ).toBeVisible()
  })
})
