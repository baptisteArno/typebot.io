import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '../services/database'
import cuid from 'cuid'
import path from 'path'
import { typebotViewer } from '../services/selectorUtils'

test('should correctly be injected', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/predefinedVariables.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )
  await page.goto(`/${typebotId}-public`)
  await expect(typebotViewer(page).locator('text="Your name is"')).toBeVisible()
  await page.goto(`/${typebotId}-public?Name=Baptiste&Email=email@test.com`)
  await expect(
    typebotViewer(page).locator('text="Your name is Baptiste"')
  ).toBeVisible()
  await expect(
    typebotViewer(page).locator('input[value="email@test.com"]')
  ).toBeVisible()
})
