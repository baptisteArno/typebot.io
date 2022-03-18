import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { BubbleStepType, defaultTextBubbleContent } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'

test.describe('Text bubble step', () => {
  test('rich text features should work', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: BubbleStepType.TEXT,
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
    await page.press('div[role="textbox"]', 'Shift+Meta+ArrowLeft')
    await page.waitForTimeout(200)
    page.on('dialog', async (dialog) => {
      await dialog.accept('https://github.com')
    })
    await page.click('[data-testid="link-button"]')

    await page.press('div[role="textbox"]', 'Shift+Enter')
    await page.click('button >> text=Variables')
    await page.fill('[data-testid="variables-input"]', 'test')
    await page.click('text=Create "test"')

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
