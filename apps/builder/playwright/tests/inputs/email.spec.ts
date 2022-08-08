import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultGroupWithBlock,
} from '../../services/database'
import { defaultEmailInputOptions, InputBlockType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'
import { mockSessionApiCalls } from 'playwright/services/browser'

test.beforeEach(({ page }) => mockSessionApiCalls(page))

test.describe('Email input block', () => {
  test('options should work', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.EMAIL,
          options: defaultEmailInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'email')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=${defaultEmailInputOptions.labels.placeholder}`)
    await page.fill(
      `input[value="${defaultEmailInputOptions.labels.placeholder}"]`,
      'Your email...'
    )
    await expect(page.locator('text=Your email...')).toBeVisible()
    await page.fill('#button', 'Go')
    await page.fill(
      `input[value="${defaultEmailInputOptions.retryMessageContent}"]`,
      'Try again bro'
    )

    await page.click('text=Restart')
    await typebotViewer(page)
      .locator(`input[placeholder="Your email..."]`)
      .fill('test@test')
    await typebotViewer(page).locator('text=Go').click()
    await expect(
      typebotViewer(page).locator('text=Try again bro')
    ).toBeVisible()
    await typebotViewer(page)
      .locator(`input[placeholder="Your email..."]`)
      .fill('test@test.com')
    await typebotViewer(page).locator('text=Go').click()
    await expect(
      typebotViewer(page).locator('text=test@test.com')
    ).toBeVisible()
  })
})
