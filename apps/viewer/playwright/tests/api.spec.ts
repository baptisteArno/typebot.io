import test, { expect } from '@playwright/test'
import {
  createResults,
  createTypebots,
  parseDefaultBlockWithStep,
} from '../services/database'
import {
  IntegrationStepType,
  defaultWebhookOptions,
  defaultWebhookAttributes,
} from 'models'

const typebotId = 'webhook-flow'
test.beforeAll(async () => {
  try {
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: IntegrationStepType.WEBHOOK,
          options: defaultWebhookOptions,
          webhook: { id: 'webhookId', ...defaultWebhookAttributes },
        }),
      },
    ])
    await createResults({ typebotId })
  } catch (err) {}
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
    id: 'step1',
    blockId: 'block1',
    name: 'Block #1 > step1',
  })
})

test('can subscribe webhook', async ({ request }) => {
  expect(
    (
      await request.patch(
        `/api/typebots/${typebotId}/blocks/block1/steps/step1/subscribeWebhook`,
        { data: { url: 'https://test.com' } }
      )
    ).status()
  ).toBe(401)
  const response = await request.patch(
    `/api/typebots/${typebotId}/blocks/block1/steps/step1/subscribeWebhook`,
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
      await request.delete(
        `/api/typebots/${typebotId}/blocks/block1/steps/step1/unsubscribeWebhook`
      )
    ).status()
  ).toBe(401)
  const response = await request.delete(
    `/api/typebots/${typebotId}/blocks/block1/steps/step1/unsubscribeWebhook`,
    {
      headers: { Authorization: 'Bearer userToken' },
    }
  )
  const body = await response.json()
  expect(body).toEqual({
    message: 'success',
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
  expect(results[0]).toMatchObject({ 'Block #1': 'content199' })
})
