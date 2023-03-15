import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/lib/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const typebotId = createId()

test.describe('Set variable block', () => {
  test('its configuration should work', async ({ page }) => {
    await importTypebotInDatabase(
      getTestAsset('typebots/logic/setVariable.json'),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Type a number...')
    await page.fill('input[placeholder="Select a variable"] >> nth=-1', 'Num')
    await page.getByRole('menuitem', { name: 'Create Num' }).click()

    await page.click('text=Click to edit... >> nth = 0')
    await page.fill('input[placeholder="Select a variable"] >> nth=-1', 'Total')
    await page.getByRole('menuitem', { name: 'Create Total' }).click()
    await page.fill('textarea', '1000 * {{Num}}')

    await page.click('text=Click to edit...', { force: true })
    await page.fill(
      'input[placeholder="Select a variable"] >> nth=-1',
      'Custom var'
    )
    await page.getByRole('menuitem', { name: 'Create Custom var' }).click()
    await page.fill('textarea', 'Custom value')

    await page.click('text=Click to edit...', { force: true })
    await page.fill(
      'input[placeholder="Select a variable"] >> nth=-1',
      'Addition'
    )
    await page.getByRole('menuitem', { name: 'Create Addition' }).click()
    await page.fill('textarea', '1000 + {{Total}}')

    await page.click('text=Preview')
    await page
      .locator('typebot-standard')
      .locator('input[placeholder="Type a number..."]')
      .fill('365')
    await page.locator('typebot-standard').locator('text=Send').click()
    await expect(
      page.locator('typebot-standard').locator('text=Multiplication: 365000')
    ).toBeVisible()
    await expect(
      page.locator('typebot-standard').locator('text=Custom var: Custom value')
    ).toBeVisible()
    await expect(
      page.locator('typebot-standard').locator('text=Addition: 366000')
    ).toBeVisible()
  })
})
