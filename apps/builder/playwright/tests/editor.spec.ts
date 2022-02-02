import test, { expect } from '@playwright/test'
import { createTypebots, parseDefaultBlockWithStep } from '../services/database'
import { defaultTextInputOptions, InputStepType } from 'models'
import { generate } from 'short-uuid'

test.describe('Editor', () => {
  test('Undo / Redo buttons should work', async ({ page }) => {
    const typebotId = generate()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Block #1', { button: 'right' })
    await page.click('text=Delete')
    await expect(page.locator('text=Block #1')).toBeHidden()
    await page.click('button[aria-label="Undo"]')
    await expect(page.locator('text=Block #1')).toBeVisible()
    await page.click('button[aria-label="Redo"]')
    await expect(page.locator('text=Block #1')).toBeHidden()
  })
})
