import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = createId()

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

    await page.click('text=Test')
    await page.getByRole('button', { name: 'Trigger code' }).click()
    await expect(page).toHaveURL('https://www.google.com')
  })
})
