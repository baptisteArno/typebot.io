import test, { expect } from '@playwright/test'
import {
  createSmtpCredentials,
  importTypebotInDatabase,
} from '../services/database'
import cuid from 'cuid'
import path from 'path'
import { typebotViewer } from '../services/selectorUtils'
import { SmtpCredentialsData } from 'models'

const mockSmtpCredentials: SmtpCredentialsData = {
  from: {
    email: 'tobin.tillman65@ethereal.email',
    name: 'John Smith',
  },
  host: 'smtp.ethereal.email',
  port: 587,
  isTlsEnabled: false,
  username: 'tobin.tillman65@ethereal.email',
  password: 'Ty9BcwCBrK6w8AG2hx',
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
  await typebotViewer(page).locator('text=Send email').click()
  const response = await page.waitForResponse((resp) =>
    resp.request().url().includes(`/api/integrations/email`)
  )
  const { previewUrl } = await response.json()
  await page.goto(previewUrl)
  await expect(page.locator('text="Hey!"')).toBeVisible()
  await expect(page.locator('text="John Smith"')).toBeVisible()
  await expect(page.locator('text="<test1@gmail.com>" >> nth=0')).toBeVisible()
  await expect(page.locator('text="<test2@gmail.com>" >> nth=0')).toBeVisible()
  await expect(
    page.locator('text="<baptiste.arnaud95@gmail.com>" >> nth=0')
  ).toBeVisible()
  await page.goto(`http://localhost:3000/typebots/${typebotId}/results`)
  await page.click('text="See logs"')
  await expect(page.locator('text="Email successfully sent"')).toBeVisible()
})
