import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { importSniperInDatabase } from '@sniper.io/playwright/databaseActions'
import { SmtpCredentials } from '@sniper.io/schemas'
import { env } from '@sniper.io/env'
import { createSmtpCredentials } from './utils/databaseActions'
import { getTestAsset } from './utils/playwright'

export const mockSmtpCredentials: SmtpCredentials['data'] = {
  from: {
    email: 'pedro.morissette@ethereal.email',
    name: 'Pedro Morissette',
  },
  host: 'smtp.ethereal.email',
  port: 587,
  username: 'pedro.morissette@ethereal.email',
  password: 'ctDZ8SyeFyTT5MReJM',
}

test.beforeAll(async () => {
  try {
    const credentialsId = 'send-email-credentials'
    await createSmtpCredentials(credentialsId, mockSmtpCredentials)
  } catch (err) {
    console.error(err)
  }
})

test('should send an email', async ({ page }) => {
  const sniperId = createId()
  await importSniperInDatabase(getTestAsset('snipers/sendEmail.json'), {
    id: sniperId,
    publicId: `${sniperId}-public`,
  })
  await page.goto(`/${sniperId}-public`)
  await page.locator('text=Send email').click()
  await expect(page.getByText('Email sent!')).toBeVisible()
  await page.goto(`${env.NEXTAUTH_URL}/snipers/${sniperId}/results`)
  await page.click('text="See logs"')
  await expect(page.locator('text="Email successfully sent"')).toBeVisible()
})
