import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { BubbleStepType, defaultEmbedBubbleContent } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'

const pdfSrc = 'https://www.orimi.com/pdf-test.pdf'
const iframeCode = '<iframe src="https://typebot.io"></iframe>'
const siteSrc = 'https://app.cal.com/baptistearno/15min'

test.describe.parallel('Embed bubble step', () => {
  test.describe('Content settings', () => {
    test('should import and parse embed correctly', async ({ page }) => {
      const typebotId = cuid()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultBlockWithStep({
            type: BubbleStepType.EMBED,
            content: defaultEmbedBubbleContent,
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Click to edit...')
      await page.fill('input[placeholder="Paste the link or code..."]', pdfSrc)
      await expect(page.locator('iframe#embed-bubble-content')).toHaveAttribute(
        'src',
        pdfSrc
      )
      await page.fill(
        'input[placeholder="Paste the link or code..."]',
        iframeCode
      )
      await expect(page.locator('iframe#embed-bubble-content')).toHaveAttribute(
        'src',
        'https://typebot.io'
      )
      await page.fill('input[placeholder="Paste the link or code..."]', siteSrc)
      await expect(page.locator('iframe#embed-bubble-content')).toHaveAttribute(
        'src',
        siteSrc
      )
    })
  })

  test.describe('Preview', () => {
    test('should display embed correctly', async ({ page }) => {
      const typebotId = cuid()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultBlockWithStep({
            type: BubbleStepType.EMBED,
            content: {
              url: siteSrc,
              height: 700,
            },
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Preview')
      await expect(
        typebotViewer(page).locator('iframe#embed-bubble-content')
      ).toHaveAttribute('src', siteSrc)
    })
  })
})
