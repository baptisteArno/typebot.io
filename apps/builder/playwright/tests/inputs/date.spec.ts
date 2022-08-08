import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultGroupWithBlock,
} from '../../services/database'
import { defaultDateInputOptions, InputBlockType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'
import { mockSessionApiCalls } from 'playwright/services/browser'

test.beforeEach(({ page }) => mockSessionApiCalls(page))

test.describe('Date input block', () => {
  test('options should work', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.DATE,
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
