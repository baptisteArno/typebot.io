import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'
import { defaultPhoneInputOptions, InputBlockType } from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'

test.describe('Phone input block', () => {
  test('options should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.PHONE,
          options: defaultPhoneInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      page.locator(
        `input[placeholder="${defaultPhoneInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'tel')
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled()

    await page.click(`text=${defaultPhoneInputOptions.labels.placeholder}`)
    await page.getByLabel('Placeholder:').fill('+33 XX XX XX XX')
    await page.getByLabel('Button label:').fill('Go')
    await page.fill(
      `input[value="${defaultPhoneInputOptions.retryMessageContent}"]`,
      'Try again bro'
    )

    await page.click('text=Restart')
    await page.locator(`input[placeholder="+33 XX XX XX XX"]`).type('+33 6 73')
    await expect(page.getByText('🇫🇷')).toBeVisible()
    await page.locator('button >> text="Go"').click()
    await expect(page.locator('text=Try again bro')).toBeVisible()
    await page
      .locator(`input[placeholder="+33 XX XX XX XX"]`)
      .fill('+33 6 73 54 45 67')
    await page.locator('button >> text="Go"').click()
    await expect(page.locator('text=+33 6 73 54 45 67')).toBeVisible()
  })
})
