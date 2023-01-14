import test, { expect } from '@playwright/test'
import { createSmtpCredentials } from '../../../../test/utils/databaseActions'
import cuid from 'cuid'
import { SmtpCredentialsData } from 'models'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { getTestAsset } from '@/test/utils/playwright'

const mockSmtpCredentials: SmtpCredentialsData = {
  from: {
    email: 'ted.kreiger@ethereal.email',
    name: 'Ted Kreiger',
  },
  host: 'smtp.ethereal.email',
  port: 587,
  username: 'ted.kreiger@ethereal.email',
  password: 'bFYFHfWjFxB9MK28zS',
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
  const typebotId = cuid()
  await importTypebotInDatabase(getTestAsset('typebots/sendEmail.json'), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  })
  await page.goto(`/next/${typebotId}-public`)
  await page.locator('text=Send email').click()
  await expect(page.getByText('Email sent!')).toBeVisible()
  await page.goto(`${process.env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
  await page.click('text="See logs"')
  await expect(page.locator('text="Email successfully sent"')).toBeVisible()
})
