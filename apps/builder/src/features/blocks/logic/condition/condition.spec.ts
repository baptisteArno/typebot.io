import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/lib/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = createId()

test.describe('Condition block', () => {
  test('its configuration should work', async ({ page }) => {
    await importTypebotInDatabase(
      getTestAsset('typebots/logic/condition.json'),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure... >> nth=0', { force: true })
    await page.fill(
      'input[placeholder="Search for a variable"] >> nth=-1',
      'Age'
    )
    await page.click('button:has-text("Age")')
    await page.click('button:has-text("Select an operator")')
    await page.click('button:has-text("Greater than")', { force: true })
    await page.fill('input[placeholder="Type a value..."]', '80')

    await page.click('button:has-text("Add a comparison")')

    await page.fill(
      ':nth-match(input[placeholder="Search for a variable"], 2)',
      'Age'
    )
    await page.click('button:has-text("Age")')
    await page.click('button:has-text("Select an operator")')
    await page.click('button:has-text("Less than")', { force: true })
    await page.fill(
      ':nth-match(input[placeholder="Type a value..."], 2)',
      '100'
    )

    await page.click('text=Configure...', { force: true })
    await page.fill(
      'input[placeholder="Search for a variable"] >> nth=-1',
      'Age'
    )
    await page.click('button:has-text("Age")')
    await page.click('button:has-text("Select an operator")')
    await page.click('button:has-text("Greater than")', { force: true })
    await page.fill('input[placeholder="Type a value..."]', '20')

    await page.click('text=Preview')
    await page
      .locator('typebot-standard')
      .locator('input[placeholder="Type a number..."]')
      .fill('15')
    await page.locator('typebot-standard').locator('text=Send').click()
    await expect(
      page.locator('typebot-standard').getByText('You are younger than 20')
    ).toBeVisible()

    await page.click('text=Restart')
    await page
      .locator('typebot-standard')
      .locator('input[placeholder="Type a number..."]')
      .fill('45')
    await page.locator('typebot-standard').locator('text=Send').click()
    await expect(
      page.locator('typebot-standard').getByText('You are older than 20')
    ).toBeVisible()

    await page.click('text=Restart')
    await page
      .locator('typebot-standard')
      .locator('input[placeholder="Type a number..."]')
      .fill('90')
    await page.locator('typebot-standard').locator('text=Send').click()
    await expect(
      page.locator('typebot-standard').getByText('You are older than 80')
    ).toBeVisible()
  })
})
