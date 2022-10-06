import test, { expect } from '@playwright/test'
import { createSmtpCredentials } from '../services/databaseActions'
import cuid from 'cuid'
import path from 'path'
import { SmtpCredentialsData } from 'models'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'

const mockSmtpCredentials: SmtpCredentialsData = {
  from: {
    email: 'sedrick.konopelski@ethereal.email',
    name: 'Kimberly Boyer',
  },
  host: 'smtp.ethereal.email',
  port: 587,
  username: 'sedrick.konopelski@ethereal.email',
  password: 'yXZChpPy25Qa5yBbeH',
}

test('should send an email', async ({ page }) => {
  const typebotId = cuid()
  const credentialsId = 'send-email-credentials'
  await createSmtpCredentials(credentialsId, mockSmtpCredentials)
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/sendEmail.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )
  await page.goto(`/${typebotId}-public`)
  const [response] = await Promise.all([
    page.waitForResponse((resp) =>
      resp.request().url().includes(`integrations/email`)
    ),
    typebotViewer(page).locator('text=Send email').click(),
  ])
  const { previewUrl } = await response.json()
  await page.goto(previewUrl)
  await expect(page.locator('text="Hey!"')).toBeVisible()
  await expect(page.locator('text="Kimberly Boyer"')).toBeVisible()
  await expect(page.locator('text="<test1@gmail.com>" >> nth=0')).toBeVisible()
  await expect(page.locator('text="<test2@gmail.com>" >> nth=0')).toBeVisible()
  await expect(
    page.locator('text="<baptiste.arnaud95@gmail.com>" >> nth=0')
  ).toBeVisible()
  await page.goto(`${process.env.BUILDER_URL}/typebots/${typebotId}/results`)
  await page.click('text="See logs"')
  await expect(page.locator('text="Email successfully sent"')).toBeVisible()
})
