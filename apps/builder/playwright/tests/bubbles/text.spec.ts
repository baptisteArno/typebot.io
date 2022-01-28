import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { BubbleStepType, defaultTextBubbleContent } from 'models'
import { typebotViewer } from '../../services/selectorUtils'

const typebotId = 'text-bubble-step'

test.describe('Text bubble step', () => {
  test('rich text features should work', async ({ page }) => {
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
    await page.press('div[role="textbox"]', 'Enter')

    await page.click('[data-testid="bold-button"]')
    await page.click('[data-testid="italic-button"]')
    await page.type('div[role="textbox"]', 'Italic text')
    await page.press('div[role="textbox"]', 'Enter')

    await page.click('[data-testid="underline-button"]')
    await page.click('[data-testid="italic-button"]')
    await page.type('div[role="textbox"]', 'Underlined text')
    await page.press('div[role="textbox"]', 'Enter')

    await page.click('[data-testid="bold-button"]')
    await page.click('[data-testid="italic-button"]')
    await page.type('div[role="textbox"]', 'Everything text')
    await page.press('div[role="textbox"]', 'Enter')

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
  })
})
