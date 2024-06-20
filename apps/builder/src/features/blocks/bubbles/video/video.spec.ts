import test, { expect } from '@playwright/test'
import { createSnipers } from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'
import { VideoBubbleContentType } from '@sniper.io/schemas/features/blocks/bubbles/video/constants'

const videoSrc =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
const youtubeVideoSrc = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const vimeoVideoSrc = 'https://vimeo.com/649301125'

test.describe.parallel('Video bubble block', () => {
  test.describe('Content settings', () => {
    test('should import video url correctly', async ({ page }) => {
      const sniperId = createId()
      await createSnipers([
        {
          id: sniperId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
          }),
        },
      ])

      await page.goto(`/snipers/${sniperId}/edit`)

      await page.click('text=Click to edit...')
      await page.fill('input[placeholder="Paste the video link..."]', videoSrc)
      await expect(page.locator('video > source')).toHaveAttribute(
        'src',
        videoSrc
      )
    })
  })

  test.describe('Preview', () => {
    test('should display video correctly', async ({ page }) => {
      const sniperId = createId()
      await createSnipers([
        {
          id: sniperId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
            content: {
              type: VideoBubbleContentType.URL,
              url: videoSrc,
            },
          }),
        },
      ])

      await page.goto(`/snipers/${sniperId}/edit`)
      await page.click('text=Test')
      await expect(page.locator('video').nth(1)).toHaveAttribute(
        'src',
        videoSrc
      )
    })

    test('should display youtube video correctly', async ({ page }) => {
      const sniperId = createId()
      await createSnipers([
        {
          id: sniperId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
            content: {
              type: VideoBubbleContentType.YOUTUBE,
              url: youtubeVideoSrc,
              id: 'dQw4w9WgXcQ',
            },
          }),
        },
      ])

      await page.goto(`/snipers/${sniperId}/edit`)
      await page.click('text=Test')
      await expect(page.locator('iframe').nth(1)).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      )
    })

    test('should display vimeo video correctly', async ({ page }) => {
      const sniperId = createId()
      await createSnipers([
        {
          id: sniperId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
            content: {
              type: VideoBubbleContentType.VIMEO,
              url: vimeoVideoSrc,
              id: '649301125',
            },
          }),
        },
      ])

      await page.goto(`/snipers/${sniperId}/edit`)
      await page.click('text=Test')
      await expect(page.locator('iframe').nth(1)).toHaveAttribute(
        'src',
        'https://player.vimeo.com/video/649301125'
      )
    })
  })
})
