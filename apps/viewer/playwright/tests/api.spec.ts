import test, { expect } from '@playwright/test'
import {
  createResults,
  createWebhook,
  importTypebotInDatabase,
} from '../services/database'
import path from 'path'

const typebotId = 'webhook-flow'
test.beforeAll(async () => {
  try {
    await importTypebotInDatabase(
      path.join(__dirname, '../fixtures/typebots/api.json'),
      { id: typebotId }
    )
    await createWebhook(typebotId)
    await createResults({ typebotId })
  } catch (err) {
    console.log(err)
  }
})

test('can list typebots', async ({ request }) => {
  expect((await request.get(`/api/typebots`)).status()).toBe(401)
  const response = await request.get(`/api/typebots`, {
    headers: { Authorization: 'Bearer userToken' },
  })
  const { typebots } = await response.json()
  expect(typebots).toHaveLength(1)
  expect(typebots[0]).toMatchObject({
    id: typebotId,
    publishedTypebotId: null,
    name: 'My typebot',
  })
})

test('can get webhook steps', async ({ request }) => {
  expect(
    (await request.get(`/api/typebots/${typebotId}/webhookSteps`)).status()
  ).toBe(401)
  const response = await request.get(
    `/api/typebots/${typebotId}/webhookSteps`,
    {
      headers: { Authorization: 'Bearer userToken' },
    }
  )
  const { steps } = await response.json()
  expect(steps).toHaveLength(1)
  expect(steps[0]).toEqual({
    id: 'webhookStep',
    blockId: 'webhookBlock',
    name: 'Webhook > webhookStep',
  })
})

test('can subscribe webhook', async ({ request }) => {
  expect(
    (
      await request.post(
        `/api/typebots/${typebotId}/blocks/webhookBlock/steps/webhookStep/subscribeWebhook`,
        { data: { url: 'https://test.com' } }
      )
    ).status()
  ).toBe(401)
  const response = await request.post(
    `/api/typebots/${typebotId}/blocks/webhookBlock/steps/webhookStep/subscribeWebhook`,
    {
      headers: {
        Authorization: 'Bearer userToken',
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
        `/api/typebots/${typebotId}/blocks/webhookBlock/steps/webhookStep/unsubscribeWebhook`
      )
    ).status()
  ).toBe(401)
  const response = await request.post(
    `/api/typebots/${typebotId}/blocks/webhookBlock/steps/webhookStep/unsubscribeWebhook`,
    {
      headers: { Authorization: 'Bearer userToken' },
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
        `/api/typebots/${typebotId}/blocks/webhookBlock/steps/webhookStep/sampleResult`
      )
    ).status()
  ).toBe(401)
  const response = await request.get(
    `/api/typebots/${typebotId}/blocks/webhookBlock/steps/webhookStep/sampleResult`,
    {
      headers: { Authorization: 'Bearer userToken' },
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
      headers: { Authorization: 'Bearer userToken' },
    }
  )
  const { results } = await response.json()
  expect(results).toHaveLength(10)
})
