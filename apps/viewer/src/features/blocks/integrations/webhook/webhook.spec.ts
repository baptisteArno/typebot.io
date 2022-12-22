import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { HttpMethod, Typebot } from 'models'
import {
  createWebhook,
  deleteTypebots,
  deleteWebhooks,
  importTypebotInDatabase,
} from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { apiToken } from 'utils/playwright/databaseSetup'
import { getTestAsset } from '@/test/utils/playwright'

test.describe('Bot', () => {
  const typebotId = cuid()

  test.beforeEach(async () => {
    await importTypebotInDatabase(getTestAsset('typebots/webhook.json'), {
      id: typebotId,
      publicId: `${typebotId}-public`,
    })

    try {
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
    } catch (err) {
      console.log(err)
    }
  })

  test.afterEach(async () => {
    await deleteTypebots([typebotId])
    await deleteWebhooks([
      'failing-webhook',
      'partial-body-webhook',
      'full-body-webhook',
    ])
  })

  test('should execute webhooks properly', async ({ page }) => {
    await page.goto(`/${typebotId}-public`)
    await typebotViewer(page).locator('text=Send failing webhook').click()
    await typebotViewer(page)
      .locator('[placeholder="Type a name..."]')
      .fill('John')
    await typebotViewer(page).locator('text="Send"').click()
    await typebotViewer(page)
      .locator('[placeholder="Type an age..."]')
      .fill('30')
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
})

test.describe('API', () => {
  const typebotId = 'webhook-flow'

  test.beforeAll(async () => {
    try {
      await importTypebotInDatabase(getTestAsset('typebots/api.json'), {
        id: typebotId,
      })
      await createWebhook(typebotId)
    } catch (err) {
      console.log(err)
    }
  })

  test('can list typebots', async ({ request }) => {
    expect((await request.get(`/api/typebots`)).status()).toBe(401)
    const response = await request.get(`/api/typebots`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
    const { typebots } = (await response.json()) as { typebots: Typebot[] }
    expect(typebots.length).toBeGreaterThanOrEqual(1)
    expect(typebots.find((typebot) => typebot.id === typebotId)).toMatchObject({
      id: typebotId,
      publishedTypebotId: null,
      name: 'My typebot',
    })
  })

  test('can get webhook blocks', async ({ request }) => {
    expect(
      (await request.get(`/api/typebots/${typebotId}/webhookBlocks`)).status()
    ).toBe(401)
    const response = await request.get(
      `/api/typebots/${typebotId}/webhookBlocks`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    )
    const { blocks } = await response.json()
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toEqual({
      blockId: 'webhookBlock',
      name: 'Webhook > webhookBlock',
    })
  })

  test('can subscribe webhook', async ({ request }) => {
    expect(
      (
        await request.post(
          `/api/typebots/${typebotId}/blocks/webhookBlock/subscribeWebhook`,
          { data: { url: 'https://test.com' } }
        )
      ).status()
    ).toBe(401)
    const response = await request.post(
      `/api/typebots/${typebotId}/blocks/webhookBlock/subscribeWebhook`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        data: { url: 'https://test.com' },
      }
    )
    const body = await response.json()
    expect(body).toEqual({
      message: 'success',
    })
  })

  test('can unsubscribe webhook', async ({ request }) => {
    expect(
      (
        await request.post(
          `/api/typebots/${typebotId}/blocks/webhookBlock/unsubscribeWebhook`
        )
      ).status()
    ).toBe(401)
    const response = await request.post(
      `/api/typebots/${typebotId}/blocks/webhookBlock/unsubscribeWebhook`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    )
    const body = await response.json()
    expect(body).toEqual({
      message: 'success',
    })
  })

  test('can get a sample result', async ({ request }) => {
    expect(
      (
        await request.get(
          `/api/typebots/${typebotId}/blocks/webhookBlock/sampleResult`
        )
      ).status()
    ).toBe(401)
    const response = await request.get(
      `/api/typebots/${typebotId}/blocks/webhookBlock/sampleResult`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    )
    const data = await response.json()
    expect(data).toMatchObject({
      message: 'This is a sample result, it has been generated ⬇️',
      Welcome: 'Hi!',
      Email: 'test@email.com',
      Name: 'answer value',
      Services: 'Website dev, Content Marketing, Social Media, UI / UX Design',
      'Additional information': 'answer value',
    })
  })
})
