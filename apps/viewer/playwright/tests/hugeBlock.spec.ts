import test, { expect } from '@playwright/test'
import path from 'path'
import { importTypebotInDatabase } from '../services/database'
import { typebotViewer } from '../services/selectorUtils'
import cuid from 'cuid'

test('should work as expected', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/hugeBlock.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )
  await page.goto(`/${typebotId}-public`)
  await typebotViewer(page).locator('input').fill('Baptiste')
  await typebotViewer(page).locator('input').press('Enter')
  await typebotViewer(page).locator('input').fill('26')
  await typebotViewer(page).locator('input').press('Enter')
  await typebotViewer(page).locator('button >> text=Yes').click()
  await page.goto(`http://localhost:3000/typebots/${typebotId}/results`)
  await expect(page.locator('text=Baptiste')).toBeVisible()
  await expect(page.locator('text=26')).toBeVisible()
  await expect(page.locator('text=Yes')).toBeVisible()
})
