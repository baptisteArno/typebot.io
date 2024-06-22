import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { createSnipers } from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'

test('should not be able to submit taken url ID', async ({ page }) => {
  const takenSniperId = createId()
  const sniperId = createId()
  await createSnipers([
    {
      id: takenSniperId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
      publicId: 'taken-url-id',
    },
  ])
  await createSnipers([
    {
      id: sniperId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
      publicId: sniperId + '-public',
    },
  ])
  await page.goto(`/snipers/${sniperId}/share`)
  await page.getByText(`${sniperId}-public`).click()
  await page.getByRole('textbox').fill('id with spaces')
  await page.getByRole('textbox').press('Enter')
  await expect(
    page
      .getByText('Can only contain lowercase letters, numbers and dashes.')
      .nth(0)
  ).toBeVisible()
  await page.getByText(`${sniperId}-public`).click()
  await page.getByRole('textbox').fill('taken-url-id')
  await page.getByRole('textbox').press('Enter')
  await expect(page.getByText('ID is already taken').nth(0)).toBeVisible()
  await page.getByText(`${sniperId}-public`).click()
  await page.getByRole('textbox').fill('new-valid-id')
  await page.getByRole('textbox').press('Enter')
  await expect(page.getByText('new-valid-id')).toBeVisible()
  await expect(page.getByText(`${sniperId}-public`)).toBeHidden()
})
