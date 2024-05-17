import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'
import { proWorkspaceId } from '@typebot.io/playwright/databaseSetup'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'

const unsplashImageSrc =
  'https://images.unsplash.com/photo-1504297050568-910d24c426d3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80'

test.describe.parallel('Image bubble block', () => {
  test.describe('Content settings', () => {
    test('should upload image file correctly', async ({ page }) => {
      const typebotId = createId()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.IMAGE,
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)

      await page.click('text=Click to edit...')
      await page.getByRole('button', { name: 'Upload' }).click()
      await page.setInputFiles('input[type="file"]', getTestAsset('avatar.jpg'))
      await expect(page.locator('img')).toHaveAttribute(
        'src',
        new RegExp(
          `/public/workspaces/${proWorkspaceId}/typebots/${typebotId}/blocks/block2`,
          'gm'
        )
      )
    })

    test('should import image link correctly', async ({ page }) => {
      const typebotId = createId()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.IMAGE,
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)

      await page.click('text=Click to edit...')
      await page.fill(
        'input[placeholder="Paste the image link..."]',
        unsplashImageSrc
      )
      await expect(page.locator('img')).toHaveAttribute('src', unsplashImageSrc)
    })

    test('should import gifs correctly', async ({ page }) => {
      const typebotId = createId()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.IMAGE,
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)

      await page.click('text=Click to edit...')
      await page.click('text=Giphy')
      const firstGiphyImage = page.locator('.giphy-gif-img >> nth=0')
      await expect(firstGiphyImage).toHaveAttribute(
        'src',
        new RegExp('giphy.com/media', 'gm')
      )
      const trendingfirstImageSrc = await firstGiphyImage.getAttribute('src')
      expect(trendingfirstImageSrc).toMatch(new RegExp('giphy.com/media', 'gm'))
      await page.type('[placeholder="Search..."]', 'fun')
      await expect(page.locator('[placeholder="Search..."]')).toHaveValue('fun')
      await page.waitForTimeout(500)
      await expect(firstGiphyImage).toHaveAttribute(
        'src',
        new RegExp('giphy.com/media', 'gm')
      )
      const funFirstImageSrc = await firstGiphyImage.getAttribute('src')
      expect(funFirstImageSrc).toMatch(new RegExp('giphy.com/media', 'gm'))
      expect(trendingfirstImageSrc).not.toBe(funFirstImageSrc)
      await firstGiphyImage.click({
        force: true,
        position: { x: 0, y: 0 },
      })
      await expect(page.locator('img[alt="Group image"]')).toHaveAttribute(
        'src',
        new RegExp('giphy.com/media', 'gm')
      )
    })
  })

  test.describe('Preview', () => {
    test('should display correctly', async ({ page }) => {
      const typebotId = createId()
      await createTypebots([
        {
          id: typebotId,
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.IMAGE,
            content: {
              url: unsplashImageSrc,
            },
          }),
        },
      ])

      await page.goto(`/typebots/${typebotId}/edit`)
      await page.click('text=Test')
      await expect(page.locator('img')).toHaveAttribute('src', unsplashImageSrc)
    })
  })
})
