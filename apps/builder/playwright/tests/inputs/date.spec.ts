import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { defaultDateInputOptions, InputStepType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'

test.describe('Date input step', () => {
  test('options should work', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.DATE,
          options: defaultDateInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator('[data-testid="from-date"]')
    ).toHaveAttribute('type', 'date')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=Pick a date...`)
    await page.click('text=Is range?')
    await page.click('text=With time?')
    await page.fill('#from', 'Previous:')
    await page.fill('#to', 'After:')
    await page.fill('#button', 'Go')

    await page.click('text=Restart')
    await expect(
      typebotViewer(page).locator(`[data-testid="from-date"]`)
    ).toHaveAttribute('type', 'datetime-local')
    await expect(
      typebotViewer(page).locator(`[data-testid="to-date"]`)
    ).toHaveAttribute('type', 'datetime-local')
  })
})
