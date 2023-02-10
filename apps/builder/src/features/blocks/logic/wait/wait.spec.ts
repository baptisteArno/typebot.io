import test, { expect } from '@playwright/test'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = createId()

test.describe('Wait block', () => {
  test('wait should trigger', async ({ page }) => {
    await importTypebotInDatabase(getTestAsset('typebots/logic/wait.json'), {
      id: typebotId,
    })

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.getByRole('textbox', { name: 'Seconds to wait for:' }).fill('3')

    await page.click('text=Preview')
    await typebotViewer(page).locator('text=Wait now').click()
    await page.waitForTimeout(1000)
    await expect(typebotViewer(page).locator('text="Hi there!"')).toBeHidden()
    await page.waitForTimeout(3000)
    await expect(typebotViewer(page).locator('text="Hi there!"')).toBeVisible()
  })
})
