import test, { expect } from '@playwright/test'
import path from 'path'
import {
  importTypebotInDatabase,
  createWebhook,
  injectFakeResults,
} from 'utils/playwright/databaseActions'
import { apiToken } from 'utils/playwright/databaseSetup'

const typebotId = 'webhook-flow'
test.beforeAll(async () => {
  try {
    await importTypebotInDatabase(
      path.join(__dirname, '../fixtures/typebots/api.json'),
      { id: typebotId }
    )
    await createWebhook(typebotId)
    await injectFakeResults({ typebotId, count: 20 })
  } catch (err) {
    console.log(err)
  }
})

test('can list typebots', async ({ request }) => {
  expect((await request.get(`/api/typebots`)).status()).toBe(401)
  const response = await request.get(`/api/typebots`, {
    headers: { Authorization: `Bearer ${apiToken}` },
  })
  const { typebots } = (await response.json()) as { typebots: unknown[] }
  expect(typebots.length).toBeGreaterThanOrEqual(1)
  expect(typebots[0]).toMatchObject({
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

test('can list results', async ({ request }) => {
  expect(
    (await request.get(`/api/typebots/${typebotId}/results`)).status()
  ).toBe(401)
  const response = await request.get(
    `/api/typebots/${typebotId}/results?limit=10`,
    {
      headers: { Authorization: `Bearer ${apiToken}` },
    }
  )
  const { results } = await response.json()
  expect(results).toHaveLength(10)
})
