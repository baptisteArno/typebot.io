import test, { expect } from '@playwright/test'
import { createTypebots } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { defaultPhoneInputOptions, InputBlockType } from 'models'
import { typebotViewer } from 'utils/playwright/testHelpers'
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
      typebotViewer(page).locator(
        `input[placeholder="${defaultPhoneInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'tel')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=${defaultPhoneInputOptions.labels.placeholder}`)
    await page.fill('#placeholder', '+33 XX XX XX XX')
    await page.fill('#button', 'Go')
    await page.fill(
      `input[value="${defaultPhoneInputOptions.retryMessageContent}"]`,
      'Try again bro'
    )

    await page.click('text=Restart')
    await typebotViewer(page)
      .locator(`input[placeholder="+33 XX XX XX XX"]`)
      .fill('+33 6 73')
    await expect(typebotViewer(page).locator(`img`)).toHaveAttribute(
      'alt',
      'France'
    )
    await typebotViewer(page).locator('button >> text="Go"').click()
    await expect(
      typebotViewer(page).locator('text=Try again bro')
    ).toBeVisible()
    await typebotViewer(page)
      .locator(`input[placeholder="+33 XX XX XX XX"]`)
      .fill('+33 6 73 54 45 67')
    await typebotViewer(page).locator('button >> text="Go"').click()
    await expect(typebotViewer(page).locator('text=+33673544567')).toBeVisible()
  })
})
