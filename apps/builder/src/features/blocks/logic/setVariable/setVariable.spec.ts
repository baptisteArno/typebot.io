import test, { expect } from '@playwright/test'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import cuid from 'cuid'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = cuid()

test.describe('Set variable block', () => {
  test('its configuration should work', async ({ page }) => {
    await importTypebotInDatabase(
      getTestAsset('typebots/logic/setVariable.json'),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Type a number...')
    await page.fill('input[placeholder="Select a variable"] >> nth=-1', 'Num')
    await page.click('text=Create "Num"')

    await page.click('text=Click to edit... >> nth = 0')
    await page.fill('input[placeholder="Select a variable"] >> nth=-1', 'Total')
    await page.click('text=Create "Total"')
    await page.fill('textarea', '1000 * {{Num}}')

    await page.click('text=Click to edit...', { force: true })
    await page.fill(
      'input[placeholder="Select a variable"] >> nth=-1',
      'Custom var'
    )
    await page.click('text=Create "Custom var"')
    await page.fill('textarea', 'Custom value')

    await page.click('text=Click to edit...', { force: true })
    await page.fill(
      'input[placeholder="Select a variable"] >> nth=-1',
      'Addition'
    )
    await page.click('text=Create "Addition"')
    await page.fill('textarea', '1000 + {{Total}}')

    await page.click('text=Preview')
    await typebotViewer(page)
      .locator('input[placeholder="Type a number..."]')
      .fill('365')
    await typebotViewer(page).locator('text=Send').click()
    await expect(
      typebotViewer(page).locator('text=Multiplication: 365000')
    ).toBeVisible()
    await expect(
      typebotViewer(page).locator('text=Custom var: Custom value')
    ).toBeVisible()
    await expect(
      typebotViewer(page).locator('text=Addition: 366000')
    ).toBeVisible()
  })
})
