import test, { expect, Page } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'
import { apiToken } from '@typebot.io/playwright/databaseSetup'
import { env } from '@typebot.io/env'
import { omit } from '@typebot.io/lib/utils'

test.describe.configure({ mode: 'parallel' })

test('editor configuration should work', async ({ page }) => {
  const typebotId = createId()
  await importTypebotInDatabase(
    getTestAsset('typebots/integrations/webhook.json'),
    {
      id: typebotId,
    }
  )

  await page.goto(`/typebots/${typebotId}/edit`)
  await page.click('text=Configure...')
  await page.fill(
    'input[placeholder="Paste URL..."]',
    `${env.NEXTAUTH_URL}/api/mock/webhook-easy-config`
  )
  await page.click('text=Test the request')
  await expect(page.locator('div[role="textbox"] >> nth=-1')).toContainText(
    `"Group #1": "Go", "secret 1": "content"`,
    { timeout: 10000 }
  )

  await page.fill(
    'input[placeholder="Paste URL..."]',
    `${env.NEXTAUTH_URL}/api/mock/webhook`
  )
  await page.click('text=Advanced configuration')

  await page.click('text=Query params')
  await page.click('text=Add a param')
  await page.fill('input[placeholder="e.g. email"]', 'firstParam')
  await page.fill('input[placeholder="e.g. {{Email}}"]', '{{secret 1}}')

  await page.click('text=Add a param')
  await page.fill('input[placeholder="e.g. email"] >> nth=1', 'secondParam')
  await page.fill(
    'input[placeholder="e.g. {{Email}}"] >> nth=1',
    '{{secret 2}}'
  )

  await page.click('text=Headers')
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Add a value' }).click()
  await page.fill('input[placeholder="e.g. Content-Type"]', 'Custom-Typebot')
  await page.fill('input[placeholder="e.g. application/json"]', '{{secret 3}}')

  await page.click('text=Body')
  await page.click('text=Custom body')
  await page.fill('div[role="textbox"]', '{ "customField": "{{secret 4}}" }')

  await page.click('text=Variable values for test')
  await addTestVariable(page, 'secret 1', 'secret1')
  await addTestVariable(page, 'secret 2', 'secret2')
  await addTestVariable(page, 'secret 3', 'secret3')
  await addTestVariable(page, 'secret 4', 'secret4')

  await page.click('text=Test the request')
  await expect(page.locator('div[role="textbox"] >> nth=-1')).toContainText(
    '"statusCode": 200'
  )

  await page.click('text=Save in variables')
  await page.click('text=Add an entry >> nth=-1')
  await page.click('input[placeholder="Select the data"]')
  await page.click('text=data.flatMap(item => item.name)')
})

const addTestVariable = async (page: Page, name: string, value: string) => {
  await page.click('text=Add an entry')
  await page.click('[data-testid="variables-input"] >> nth=-1')
  await page.click(`text="${name}"`)
  await page.fill('input >> nth=-1', value)
}

test('Webhook API endpoints should work', async ({ request }) => {
  const typebotId = createId()
  await importTypebotInDatabase(getTestAsset('typebots/api.json'), {
    id: typebotId,
  })

  // GET webhook blocks
  const getResponse = await request.get(
    `/api/v1/typebots/${typebotId}/webhookBlocks`,
    {
      headers: { Authorization: `Bearer ${apiToken}` },
    }
  )
  const { webhookBlocks } = await getResponse.json()
  expect(webhookBlocks).toHaveLength(1)
  expect(webhookBlocks[0]).toEqual({
    id: 'webhookBlock',
    label: 'Webhook > webhookBlock',
    type: 'Webhook',
  })

  // Subscribe webhook
  const url = 'https://test.com'
  const subscribeResponse = await request.post(
    `/api/v1/typebots/${typebotId}/webhookBlocks/webhookBlock/subscribe`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: { url },
    }
  )
  expect(await subscribeResponse.json()).toEqual({
    id: 'webhookBlock',
    url,
  })

  // Unsubscribe webhook
  const unsubResponse = await request.post(
    `/api/v1/typebots/${typebotId}/webhookBlocks/webhookBlock/unsubscribe`,
    {
      headers: { Authorization: `Bearer ${apiToken}` },
    }
  )
  expect(await unsubResponse.json()).toEqual({
    id: 'webhookBlock',
    url: null,
  })

  // Get sample result
  const sampleResponse = await request.get(
    `/api/v1/typebots/${typebotId}/webhookBlocks/webhookBlock/getResultExample`,
    {
      headers: { Authorization: `Bearer ${apiToken}` },
    }
  )
  const sample = await sampleResponse.json()

  expect(omit(sample.resultExample, 'submittedAt')).toMatchObject({
    message: 'This is a sample result, it has been generated ⬇️',
    Welcome: 'Hi!',
    Email: 'user@email.com',
    Name: 'answer value',
    Services: 'Website dev, Content Marketing, Social Media, UI / UX Design',
    'Additional information': 'answer value',
  })
})
