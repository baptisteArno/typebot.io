import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'

test.describe.parallel('Text input block', () => {
  test('options should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

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
