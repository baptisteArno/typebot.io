import test, { expect } from '@playwright/test'
import { importSniperInDatabase } from '@sniper.io/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const sniperId = createId()

test.describe('Script block', () => {
  test('script should trigger', async ({ page }) => {
    await importSniperInDatabase(getTestAsset('snipers/logic/script.json'), {
      id: sniperId,
    })

    await page.goto(`/snipers/${sniperId}/edit`)
    await page.click('text=Configure...')
    await page.fill(
      'div[role="textbox"]',
      'window.location.href = "https://www.google.com"'
    )

    await page.click('text=Test')
    await page.getByRole('button', { name: 'Trigger code' }).click()
    await expect(page).toHaveURL('https://www.google.com')
  })
})
