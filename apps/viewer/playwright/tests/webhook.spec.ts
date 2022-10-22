import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import path from 'path'
import { HttpMethod } from 'models'
import {
  createWebhook,
  importTypebotInDatabase,
} from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'

test('should execute webhooks properly', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/webhook.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )

  await createWebhook(typebotId, {
    id: 'failing-webhook',
    url: 'http://localhost:3001/api/mock/fail',
    method: HttpMethod.POST,
  })

  await createWebhook(typebotId, {
    id: 'partial-body-webhook',
    url: 'http://localhost:3000/api/mock/webhook-easy-config',
    method: HttpMethod.POST,
    body: `{
      "name": "{{Name}}",
      "age": {{Age}},
      "gender": "{{Gender}}"
    }`,
  })

  await createWebhook(typebotId, {
    id: 'full-body-webhook',
    url: 'http://localhost:3000/api/mock/webhook-easy-config',
    method: HttpMethod.POST,
    body: `{{Full body}}`,
  })

  await page.goto(`/${typebotId}-public`)
  await typebotViewer(page).locator('text=Send failing webhook').click()
  await typebotViewer(page)
    .locator('[placeholder="Type a name..."]')
    .fill('John')
  await typebotViewer(page).locator('text="Send"').click()
  await typebotViewer(page).locator('[placeholder="Type an age..."]').fill('30')
  await typebotViewer(page).locator('text="Send"').click()
  await typebotViewer(page).locator('text="Male"').click()
  await expect(
    typebotViewer(page).getByText('{"name":"John","age":25,"gender":"male"}')
  ).toBeVisible()
  await expect(
    typebotViewer(page).getByText('{"name":"John","age":30,"gender":"Male"}')
  ).toBeVisible()
  await page.goto(`http://localhost:3000/typebots/${typebotId}/results`)
  await page.click('text="See logs"')
  await expect(
    page.locator('text="Webhook successfuly executed." >> nth=1')
  ).toBeVisible()
  await expect(page.locator('text="Webhook returned an error"')).toBeVisible()
})
