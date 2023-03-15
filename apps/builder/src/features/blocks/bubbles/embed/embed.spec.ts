import test, { expect } from '@playwright/test'
import { BubbleBlockType, defaultEmbedBubbleContent } from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'
import { createTypebots } from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'

const pdfSrc = 'https://www.orimi.com/pdf-test.pdf'
const siteSrc = 'https://app.cal.com/baptistearno/15min'

test.describe.parallel('Embed bubble block', () => {
  test.describe('Content settings', () => {
    test('should import and parse embed correctly', async ({ page }) => {
      const typebotId = createId()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.EMBED,
            content: defaultEmbedBubbleContent,
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Click to edit...')
      await page.fill('input[placeholder="Paste the link or code..."]', pdfSrc)
      await expect(page.locator('text="Show embed"')).toBeVisible()
    })
  })

  test.describe('Preview', () => {
    test('should display embed correctly', async ({ page }) => {
      const typebotId = createId()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.EMBED,
            content: {
              url: siteSrc,
              height: 700,
            },
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Preview')
      await expect(page.locator('iframe#embed-bubble-content')).toHaveAttribute(
        'src',
        siteSrc
      )
    })
  })
})
