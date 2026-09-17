import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'

test.describe('Text bubble block', () => {
  test('rich text features should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: BubbleBlockType.TEXT,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.getByTestId('block block2').locator('div').first().click()
    await page.click('[data-testid="bold-button"]')
    await page.type('div[role="textbox"]', 'Bold text')
    await page.press('div[role="textbox"]', 'Shift+Enter')

    await page.click('[data-testid="bold-button"]')
    await page.click('[data-testid="italic-button"]')
    await page.type('div[role="textbox"]', 'Italic text')
    await page.press('div[role="textbox"]', 'Shift+Enter')

    await page.click('[data-testid="underline-button"]')
    await page.click('[data-testid="italic-button"]')
    await page.type('div[role="textbox"]', 'Underlined text')
    await page.press('div[role="textbox"]', 'Shift+Enter')

    await page.click('[data-testid="bold-button"]')
    await page.click('[data-testid="italic-button"]')
    await page.type('div[role="textbox"]', 'Everything text')
    await page.press('div[role="textbox"]', 'Shift+Enter')

    await page.click('button[aria-label="Insert variable"]')
    await page.fill('[data-testid="variables-input"]', 'test')
    await page.getByRole('menuitem', { name: 'Create test' }).click()

    await page.click('text=Test')
    await expect(page.locator('span.slate-bold >> nth=0')).toHaveText(
      'Bold text'
    )
    await expect(page.locator('span.slate-italic >> nth=0')).toHaveText(
      'Italic text'
    )
    await expect(page.locator('span.slate-underline >> nth=0')).toHaveText(
      'Underlined text'
    )
    await expect(
      page.locator('span.slate-bold.slate-italic.slate-underline >> nth=0')
    ).toHaveText('Everything text')
  })
})
