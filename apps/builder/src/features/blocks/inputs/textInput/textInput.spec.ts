import test, { expect } from '@playwright/test'
import { createSnipers } from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { defaultTextInputOptions } from '@sniper.io/schemas/features/blocks/inputs/text/constants'

test.describe.parallel('Text input block', () => {
  test('options should work', async ({ page }) => {
    const sniperId = createId()
    await createSnipers([
      {
        id: sniperId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
    ])

    await page.goto(`/snipers/${sniperId}/edit`)

    await page.click('text=Test')
    await expect(
      page.locator(
        `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'text')

    await page.click(`text=${defaultTextInputOptions.labels.placeholder}`)
    await page.getByLabel('Placeholder:').fill('Your name...')
    await page.getByLabel('Button label:').fill('Go')
    await page.click('text=Long text?')

    await page.click('text=Restart')
    await expect(
      page.locator(`textarea[placeholder="Your name..."]`)
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Go' })).toBeVisible()
  })
})
