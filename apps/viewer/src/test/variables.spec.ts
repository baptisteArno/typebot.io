import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { importSniperInDatabase } from '@sniper.io/playwright/databaseActions'

test('should correctly be injected', async ({ page }) => {
  const sniperId = createId()
  await importSniperInDatabase(
    getTestAsset('snipers/predefinedVariables.json'),
    { id: sniperId, publicId: `${sniperId}-public` }
  )
  await page.goto(`/${sniperId}-public`)
  await expect(page.locator('text="Your name is"')).toBeVisible()
  await page.goto(`/${sniperId}-public?Name=Baptiste&Email=email@test.com`)
  await expect(page.locator('text="Baptiste"')).toBeVisible()
  await expect(page.getByPlaceholder('Type your email...')).toHaveValue(
    'email@test.com'
  )
})
