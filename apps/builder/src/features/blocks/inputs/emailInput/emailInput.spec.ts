import test, { expect } from '@playwright/test'
import { createSnipers } from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { defaultEmailInputOptions } from '@sniper.io/schemas/features/blocks/inputs/email/constants'

test.describe('Email input block', () => {
  test('options should work', async ({ page }) => {
    const sniperId = createId()
    await createSnipers([
      {
        id: sniperId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.EMAIL,
        }),
      },
    ])

    await page.goto(`/snipers/${sniperId}/edit`)

    await page.click('text=Test')
    await expect(
      page.locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'email')

    await page.click(`text=${defaultEmailInputOptions.labels.placeholder}`)
    await page.fill(
      `input[value="${defaultEmailInputOptions.labels.placeholder}"]`,
      'Your email...'
    )
    await expect(page.locator('text=Your email...')).toBeVisible()
    await page.getByLabel('Button label:').fill('Go')
    await page.fill(
      `input[value="${defaultEmailInputOptions.retryMessageContent}"]`,
      'Try again bro'
    )

    await page.click('text=Restart')
    await page.locator(`input[placeholder="Your email..."]`).fill('test@test')
    await page.getByRole('button', { name: 'Go' }).click()
    await expect(page.locator('text=Try again bro')).toBeVisible()
    await page
      .locator(`input[placeholder="Your email..."]`)
      .fill('test@test.com')
    await page.getByRole('button', { name: 'Go' }).click()
    await expect(page.locator('text=test@test.com')).toBeVisible()
  })
})
