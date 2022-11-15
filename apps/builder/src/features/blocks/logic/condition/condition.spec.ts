import test, { expect } from '@playwright/test'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import cuid from 'cuid'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = cuid()

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
    await typebotViewer(page)
      .locator('input[placeholder="Type a number..."]')
      .fill('15')
    await typebotViewer(page).locator('text=Send').click()
    await expect(
      typebotViewer(page).locator('text=You are younger than 20')
    ).toBeVisible()

    await page.click('text=Restart')
    await typebotViewer(page)
      .locator('input[placeholder="Type a number..."]')
      .fill('45')
    await typebotViewer(page).locator('text=Send').click()
    await expect(
      typebotViewer(page).locator('text=You are older than 20')
    ).toBeVisible()

    await page.click('text=Restart')
    await typebotViewer(page)
      .locator('input[placeholder="Type a number..."]')
      .fill('90')
    await typebotViewer(page).locator('text=Send').click()
    await expect(
      typebotViewer(page).locator('text=You are older than 80')
    ).toBeVisible()
  })
})
