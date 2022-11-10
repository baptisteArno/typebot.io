import test, { expect, Page } from '@playwright/test'
import {
  createWebhook,
  importTypebotInDatabase,
} from 'utils/playwright/databaseActions'
import path from 'path'
import { HttpMethod } from 'models'
import cuid from 'cuid'

test.describe('Webhook block', () => {
  test('easy configuration should work', async ({ page }) => {
    const typebotId = cuid()
    await importTypebotInDatabase(
      path.join(
        __dirname,
        '../../fixtures/typebots/integrations/easyConfigWebhook.json'
      ),
      {
        id: typebotId,
      }
    )
    await createWebhook(typebotId, { method: HttpMethod.POST })
    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.fill(
      'input[placeholder="Paste webhook URL..."]',
      `${process.env.NEXTAUTH_URL}/api/mock/webhook-easy-config`
    )
    await page.click('text=Test the request')
    await expect(page.locator('div[role="textbox"] >> nth=-1')).toContainText(
      `"Group #1": "answer value", "Group #2": "20", "Group #2 (1)": "Yes"`
    )
  })

  test('its configuration should work', async ({ page }) => {
    const typebotId = cuid()
    await importTypebotInDatabase(
      path.join(__dirname, '../../fixtures/typebots/integrations/webhook.json'),
      {
        id: typebotId,
      }
    )
    await createWebhook(typebotId)

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.fill(
      'input[placeholder="Paste webhook URL..."]',
      `${process.env.NEXTAUTH_URL}/api/mock/webhook`
    )
    await page.click('text=Advanced configuration')
    await page.click('text=GET')
    await page.click('text=POST')

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
    await page.fill(
      'input[placeholder="e.g. application/json"]',
      '{{secret 3}}'
    )

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
    await page.click('text=data[0].name')
  })
})

const addTestVariable = async (page: Page, name: string, value: string) => {
  await page.click('text=Add an entry')
  await page.click('[data-testid="variables-input"] >> nth=-1')
  await page.click(`text="${name}"`)
  await page.fill('input >> nth=-1', value)
}
