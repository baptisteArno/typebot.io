import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import {
  BubbleStepType,
  defaultVideoBubbleContent,
  VideoBubbleContentType,
} from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'

const videoSrc =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
const youtubeVideoSrc = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const vimeoVideoSrc = 'https://vimeo.com/649301125'

test.describe.parallel('Video bubble step', () => {
  test.describe('Content settings', () => {
    test('should import video url correctly', async ({ page }) => {
      const typebotId = cuid()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultBlockWithStep({
            type: BubbleStepType.VIDEO,
            content: defaultVideoBubbleContent,
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)

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
      const typebotId = cuid()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultBlockWithStep({
            type: BubbleStepType.VIDEO,
            content: {
              type: VideoBubbleContentType.URL,
              url: videoSrc,
            },
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Preview')
      await expect(
        typebotViewer(page).locator('video > source')
      ).toHaveAttribute('src', videoSrc)
    })

    test('should display youtube video correctly', async ({ page }) => {
      const typebotId = cuid()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultBlockWithStep({
            type: BubbleStepType.VIDEO,
            content: {
              type: VideoBubbleContentType.YOUTUBE,
              url: youtubeVideoSrc,
              id: 'dQw4w9WgXcQ',
            },
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Preview')
      await expect(typebotViewer(page).locator('iframe')).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      )
    })

    test('should display vimeo video correctly', async ({ page }) => {
      const typebotId = cuid()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultBlockWithStep({
            type: BubbleStepType.VIDEO,
            content: {
              type: VideoBubbleContentType.VIMEO,
              url: vimeoVideoSrc,
              id: '649301125',
            },
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Preview')
      await expect(typebotViewer(page).locator('iframe')).toHaveAttribute(
        'src',
        'https://player.vimeo.com/video/649301125'
      )
    })
  })
})
