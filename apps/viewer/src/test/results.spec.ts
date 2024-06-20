import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { importSniperInDatabase } from '@sniper.io/playwright/databaseActions'
import { env } from '@sniper.io/env'

test('Big groups should work as expected', async ({ page }) => {
  const sniperId = createId()
  await importSniperInDatabase(getTestAsset('snipers/hugeGroup.json'), {
    id: sniperId,
    publicId: `${sniperId}-public`,
  })
  await page.goto(`/${sniperId}-public`)
  await page.locator('input').fill('Baptiste')
  await page.locator('input').press('Enter')
  await page.locator('input').fill('26')
  await page.locator('input').press('Enter')
  await page.getByRole('button', { name: 'Yes' }).click()
  await page.goto(`${env.NEXTAUTH_URL}/snipers/${sniperId}/results`)
  await expect(page.locator('text="Baptiste"')).toBeVisible()
  await expect(page.locator('text="26"')).toBeVisible()
  await expect(page.locator('text="Yes"')).toBeVisible()
  await page.hover('tbody > tr')
  await page.click('button >> text="Open"')
  await expect(page.locator('text="Baptiste" >> nth=1')).toBeVisible()
  await expect(page.locator('text="26" >> nth=1')).toBeVisible()
  await expect(page.locator('text="Yes" >> nth=1')).toBeVisible()
})
