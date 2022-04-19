import test, { expect } from '@playwright/test'
import { createWebhook, importTypebotInDatabase } from '../services/database'
import cuid from 'cuid'
import path from 'path'
import { typebotViewer } from '../services/selectorUtils'
import { HttpMethod } from 'models'

test('should execute webhooks properly', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/webhook.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )
  await createWebhook(typebotId, {
    id: 'success-webhook',
    url: 'https://webhook.site/912bafb0-b92f-4be8-ae6a-186b5879a17a',
    method: HttpMethod.POST,
  })
  await createWebhook(typebotId, {
    id: 'failed-webhook',
    url: 'https://webhook.site/8be94c01-141e-4792-b3c6-cf45137481d6',
    method: HttpMethod.POST,
  })

  await page.goto(`/${typebotId}-public`)
  await typebotViewer(page).locator('text=Send success webhook').click()
  await page.waitForResponse(
    (resp) =>
      resp.request().url().includes(`/api/typebots/${typebotId}/blocks`) &&
      resp.status() === 200
  )
  await typebotViewer(page).locator('text=Send failed webhook').click()
  await page.waitForResponse(
    async (resp) =>
      resp.request().url().includes(`/api/typebots/${typebotId}/blocks`) &&
      resp.status() === 200 &&
      (await resp.json()).statusCode === 500
  )
  await page.goto(`http://localhost:3000/typebots/${typebotId}/results`)
  await page.click('text="See logs"')
  await expect(
    page.locator('text="Webhook successfuly executed."')
  ).toBeVisible()
  await expect(page.locator('text="Webhook returned an error"')).toBeVisible()
})
