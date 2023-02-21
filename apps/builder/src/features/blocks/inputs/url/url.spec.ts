import test, { expect } from '@playwright/test'
import { createTypebots } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { defaultUrlInputOptions, InputBlockType } from 'models'
import { createId } from '@paralleldrive/cuid2'

test.describe('Url input block', () => {
  test('options should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.URL,
          options: defaultUrlInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      page.locator(
        `input[placeholder="${defaultUrlInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'url')
    await expect(
      page.locator('typebot-standard').locator(`button`)
    ).toBeDisabled()

    await page.click(`text=${defaultUrlInputOptions.labels.placeholder}`)
    await page.fill('#placeholder', 'Your URL...')
    await expect(page.locator('text=Your URL...')).toBeVisible()
    await page.fill('#button', 'Go')
    await page.fill(
      `input[value="${defaultUrlInputOptions.retryMessageContent}"]`,
      'Try again bro'
    )

    await page.click('text=Restart')
    await page
      .locator(`input[placeholder="Your URL..."]`)
      .fill('https://https://test')
    await page.locator('button >> text="Go"').click()
    await expect(page.locator('text=Try again bro')).toBeVisible()
    await page
      .locator(`input[placeholder="Your URL..."]`)
      .fill('https://website.com')
    await page.locator('button >> text="Go"').click()
    await expect(page.locator('text=https://website.com')).toBeVisible()
  })
})
