import test, { expect } from '@playwright/test'
import { importSniperInDatabase } from '@sniper.io/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const sniperId = createId()

test.describe('Wait block', () => {
  test('wait should trigger', async ({ page }) => {
    await importSniperInDatabase(getTestAsset('snipers/logic/wait.json'), {
      id: sniperId,
    })

    await page.goto(`/snipers/${sniperId}/edit`)
    await page.click('text=Configure...')
    await page.getByRole('textbox', { name: 'Seconds to wait for:' }).fill('3')

    await page.click('text=Test')
    await page.getByRole('button', { name: 'Wait now' }).click()
    await page.waitForTimeout(1000)
    await expect(
      page.locator('sniper-standard').locator('text="Hi there!"')
    ).toBeHidden()
    await page.waitForTimeout(3000)
    await expect(
      page.locator('sniper-standard').locator('text="Hi there!"')
    ).toBeVisible()
  })
})
