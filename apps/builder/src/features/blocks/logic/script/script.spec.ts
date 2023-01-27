import test, { expect } from '@playwright/test'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import cuid from 'cuid'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = cuid()

test.describe('Script block', () => {
  test('script should trigger', async ({ page }) => {
    await importTypebotInDatabase(getTestAsset('typebots/logic/script.json'), {
      id: typebotId,
    })

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.fill(
      'div[role="textbox"]',
      'window.location.href = "https://www.google.com"'
    )

    await page.click('text=Preview')
    await typebotViewer(page).locator('text=Trigger code').click()
    await expect(page).toHaveURL('https://www.google.com')
  })
})
