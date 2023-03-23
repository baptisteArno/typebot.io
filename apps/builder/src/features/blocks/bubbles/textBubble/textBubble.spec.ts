import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'
import { BubbleBlockType, defaultTextBubbleContent } from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'

test.describe('Text bubble block', () => {
  test('rich text features should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: BubbleBlockType.TEXT,
          content: defaultTextBubbleContent,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

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

    await page.type('div[role="textbox"]', 'My super link')
    await page.waitForTimeout(300)
    await page.press('div[role="textbox"]', 'Shift+Meta+ArrowLeft')
    await page.click('[data-testid="link-button"]')
    await page.fill('input[placeholder="Paste link"]', 'https://github.com')
    await page.press('input[placeholder="Paste link"]', 'Enter')
    await page.press('div[role="textbox"]', 'ArrowRight')
    await page.press('div[role="textbox"]', 'Shift+Enter')
    await page.click('button[aria-label="Insert variable"]')
    await page.fill('[data-testid="variables-input"]', 'test')
    await page.getByRole('menuitem', { name: 'Create test' }).click()

    await page.click('text=Preview')
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
      page.locator('typebot-standard').locator('a[href="https://github.com"]')
    ).toHaveText('My super link')
  })
})
