import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'

test('should correctly be injected', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    getTestAsset('typebots/predefinedVariables.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )
  await page.goto(`/next/${typebotId}-public`)
  await expect(page.locator('text="Your name is"')).toBeVisible()
  await page.goto(
    `/next/${typebotId}-public?Name=Baptiste&Email=email@test.com`
  )
  await expect(page.locator('text="Your name is Baptiste"')).toBeVisible()
  await expect(page.getByPlaceholder('Type your email...')).toHaveValue(
    'email@test.com'
  )
})
