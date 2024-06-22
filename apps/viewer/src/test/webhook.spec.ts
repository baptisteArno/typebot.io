import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  createWebhook,
  importSniperInDatabase,
} from '@sniper.io/playwright/databaseActions'
import { getTestAsset } from '@/test/utils/playwright'
import { HttpMethod } from '@sniper.io/schemas/features/blocks/integrations/webhook/constants'

const sniperId = createId()

test.beforeEach(async () => {
  await importSniperInDatabase(getTestAsset('snipers/webhook.json'), {
    id: sniperId,
    publicId: `${sniperId}-public`,
  })

  try {
    await createWebhook(sniperId, {
      id: 'failing-webhook',
      url: 'http://localhost:3001/api/mock/fail',
      method: HttpMethod.POST,
    })

    await createWebhook(sniperId, {
      id: 'partial-body-webhook',
      url: 'http://localhost:3000/api/mock/webhook-easy-config',
      method: HttpMethod.POST,
      body: `{
          "name": "{{Name}}",
          "age": {{Age}},
          "gender": "{{Gender}}"
        }`,
    })

    await createWebhook(sniperId, {
      id: 'full-body-webhook',
      url: 'http://localhost:3000/api/mock/webhook-easy-config',
      method: HttpMethod.POST,
      body: `{{Full body}}`,
    })
  } catch (err) {
    console.log(err)
  }
})

test('should execute webhooks properly', async ({ page }) => {
  await page.goto(`/${sniperId}-public`)
  await page.locator('text=Send failing webhook').click()
  await page.locator('[placeholder="Type a name..."]').fill('John')
  await page.locator('text="Send"').click()
  await page.locator('[placeholder="Type an age..."]').fill('30')
  await page.locator('text="Send"').click()
  await page.locator('text="Male"').click()
  await expect(
    page.getByText('{"name":"John","age":25,"gender":"male"}')
  ).toBeVisible()
  await expect(
    page.getByText('{"name":"John","age":30,"gender":"Male"}')
  ).toBeVisible()
  await page.goto(`http://localhost:3000/snipers/${sniperId}/results`)
  await page.click('text="See logs"')
  await expect(
    page.locator('text="Webhook successfuly executed." >> nth=1')
  ).toBeVisible()
  await expect(page.locator('text="Webhook returned an error."')).toBeVisible()
})
