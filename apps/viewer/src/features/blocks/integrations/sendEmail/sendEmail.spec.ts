import test, { expect } from '@playwright/test'
import { createSmtpCredentials } from '../../../../test/utils/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { importTypebotInDatabase } from '@typebot.io/lib/playwright/databaseActions'
import { getTestAsset } from '@/test/utils/playwright'
import { SmtpCredentials } from '@typebot.io/schemas'

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
  const typebotId = createId()
  await importTypebotInDatabase(getTestAsset('typebots/sendEmail.json'), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  })
  await page.goto(`/${typebotId}-public`)
  await page.locator('text=Send email').click()
  await expect(page.getByText('Email sent!')).toBeVisible()
  await page.goto(`${process.env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
  await page.click('text="See logs"')
  await expect(page.locator('text="Email successfully sent"')).toBeVisible()
})
