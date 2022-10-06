import test, { expect } from '@playwright/test'
import path from 'path'
import cuid from 'cuid'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'

test('should work as expected', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/hugeGroup.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )
  await page.goto(`/${typebotId}-public`)
  await typebotViewer(page).locator('input').fill('Baptiste')
  await typebotViewer(page).locator('input').press('Enter')
  await typebotViewer(page).locator('input').fill('26')
  await typebotViewer(page).locator('input').press('Enter')
  await typebotViewer(page).locator('button >> text=Yes').click()
  await page.goto(`${process.env.BUILDER_URL}/typebots/${typebotId}/results`)
  await expect(page.locator('text="Baptiste"')).toBeVisible()
  await expect(page.locator('text="26"')).toBeVisible()
  await expect(page.locator('text="Yes"')).toBeVisible()
  await page.hover('tbody > tr')
  await page.click('button >> text="Open"')
  await expect(page.locator('text="Baptiste" >> nth=1')).toBeVisible()
  await expect(page.locator('text="26" >> nth=1')).toBeVisible()
  await expect(page.locator('text="Yes" >> nth=1')).toBeVisible()
})
