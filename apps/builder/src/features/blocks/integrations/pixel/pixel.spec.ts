import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'

test.describe('Pixel block', () => {
  test('its configuration should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: IntegrationBlockType.PIXEL,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.getByPlaceholder('Pixel ID (e.g. "123456789")').fill('pixelid')
    await expect(page.getByText('Init Pixel')).toBeVisible()
    await page.getByText('Track event').click()
    await page.getByPlaceholder('Select event type').click()
    await page.getByRole('menuitem', { name: 'Lead' }).click()
    await expect(page.getByText('Track "Lead"')).toBeVisible()
    await page.getByRole('button', { name: 'Add parameter' }).click()
    await page.getByRole('button', { name: 'Select key' }).click()
    await page.getByRole('menuitem', { name: 'currency' }).click()
    await page.getByPlaceholder('Value').fill('USD')
    await page.getByRole('button', { name: 'Test' }).click()
    await expect(
      page.getByText('Pixel is not enabled in Preview mode').nth(1)
    ).toBeVisible()
  })
})
