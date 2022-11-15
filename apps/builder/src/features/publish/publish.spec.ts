import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { defaultTextInputOptions, InputBlockType } from 'models'
import { createTypebots } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'

test('should not be able to submit taken url ID', async ({ page }) => {
  const takenTypebotId = cuid()
  const typebotId = cuid()
  await createTypebots([
    {
      id: takenTypebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
      publicId: 'taken-url-id',
    },
  ])
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
      publicId: typebotId + '-public',
    },
  ])
  await page.goto(`/typebots/${typebotId}/share`)
  await page.getByText(`${typebotId}-public`).click()
  await page.getByRole('textbox').fill('taken-url-id')
  await page.getByRole('textbox').press('Enter')
  await expect(page.getByText('ID is already taken').nth(0)).toBeVisible()
})
