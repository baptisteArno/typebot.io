import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = createId()

test.describe('AB Test block', () => {
  test('its configuration should work', async ({ page }) => {
    await importTypebotInDatabase(getTestAsset('typebots/logic/abTest.json'), {
      id: typebotId,
    })

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.getByText('A 50%').click()
    await page.getByLabel('Percent of users to follow A:').fill('100')
    await expect(page.getByText('A 100%')).toBeVisible()
    await expect(page.getByText('B 0%')).toBeVisible()
    await page.getByRole('button', { name: 'Test' }).click()
    await expect(
      page.locator('typebot-standard').getByText('How are you?')
    ).toBeVisible()
  })
})
