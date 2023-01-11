import test, { expect } from '@playwright/test'
import { createTypebots } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { BubbleBlockType, defaultTextBubbleContent } from 'models'
import cuid from 'cuid'
import { typebotViewer } from 'utils/playwright/testHelpers'

test.describe('Text bubble block', () => {
  test('rich text features should work', async ({ page }) => {
    const typebotId = cuid()
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
    await page.press('div[role="textbox"]', 'Shift+Enter')
    await page.click('button[aria-label="Insert variable"]')
    await page.fill('[data-testid="variables-input"]', 'test')
    await page.getByRole('menuitem', { name: 'Create test' }).click()

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator('span.slate-bold >> nth=0')
    ).toHaveText('Bold text')
    await expect(
      typebotViewer(page).locator('span.slate-italic >> nth=0')
    ).toHaveText('Italic text')
    await expect(
      typebotViewer(page).locator('span.slate-underline >> nth=0')
    ).toHaveText('Underlined text')
    await expect(
      typebotViewer(page).locator('a[href="https://github.com"]')
    ).toHaveText('My super link')
  })
})
