import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'

test('should correctly be injected', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    getTestAsset('typebots/predefinedVariables.json'),
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
