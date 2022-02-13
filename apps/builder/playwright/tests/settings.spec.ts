import test, { expect } from '@playwright/test'
import path from 'path'
import { generate } from 'short-uuid'
import { importTypebotInDatabase } from '../services/database'
import { typebotViewer } from '../services/selectorUtils'

test.describe.parallel('Settings page', () => {
  test.describe('General', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = generate()
      await importTypebotInDatabase(
        path.join(__dirname, '../fixtures/typebots/theme.json'),
        {
          id: typebotId,
        }
      )
      await page.goto(`/typebots/${typebotId}/settings`)
      await expect(
        typebotViewer(page).locator('a:has-text("Made with Typebot")')
      ).toHaveAttribute('href', 'https://www.typebot.io/?utm_source=litebadge')
      await page.click('button:has-text("General")')
      await page.uncheck('input[type="checkbox"]', { force: true })
      await expect(
        typebotViewer(page).locator('a:has-text("Made with Typebot")')
      ).toBeHidden()
    })
  })

  test.describe('Typing emulation', () => {
    test('should be fillable', async ({ page }) => {
      const typebotId = generate()
      await importTypebotInDatabase(
        path.join(__dirname, '../fixtures/typebots/theme.json'),
        {
          id: typebotId,
        }
      )
      await page.goto(`/typebots/${typebotId}/settings`)
      await page.click('button:has-text("Typing emulation")')
      await page.fill('[data-testid="speed"] input', '350')
      await page.fill('[data-testid="max-delay"] input', '1.5')
      await page.uncheck(':nth-match(input[type="checkbox"], 2)', {
        force: true,
      })
      await expect(page.locator('[data-testid="speed"]')).toBeHidden()
      await expect(page.locator('[data-testid="max-delay"]')).toBeHidden()
    })
  })

  test.describe('Metadata', () => {
    test('should be fillable', async ({ page }) => {
      const favIconUrl = 'https://www.baptistearno.com/favicon.png'
      const imageUrl = 'https://www.baptistearno.com/images/site-preview.png'
      const typebotId = 'metadata-typebot'
      await importTypebotInDatabase(
        path.join(__dirname, '../fixtures/typebots/theme.json'),
        {
          id: typebotId,
        }
      )
      await page.goto(`/typebots/${typebotId}/settings`)
      await page.click('button:has-text("Metadata")')

      // Fav icon
      const favIconImg = page.locator(':nth-match(img, 1)')
      await expect(favIconImg).toHaveAttribute('src', '/favicon.png')
      await favIconImg.click()
      await expect(page.locator('text=Giphy')).toBeHidden()
      await page.click('button:has-text("Embed link")')
      await page.fill(
        'input[placeholder="Paste the image link..."]',
        favIconUrl
      )
      await expect(favIconImg).toHaveAttribute('src', favIconUrl)

      // Website image
      const websiteImg = page.locator(':nth-match(img, 2)')
      await expect(websiteImg).toHaveAttribute('src', '/viewer-preview.png')
      await websiteImg.click({ position: { x: 0, y: 180 } })
      await expect(page.locator('text=Giphy')).toBeHidden()
      await page.click('button:has-text("Embed link")')
      await page.fill('input[placeholder="Paste the image link..."]', imageUrl)
      await expect(websiteImg).toHaveAttribute('src', imageUrl)

      // Title
      await page.fill('input#title', 'Awesome typebot')

      // Description
      await page.fill('textarea#description', 'Lorem ipsum')
    })
  })

  test.describe('Free user', () => {
    test.use({
      storageState: path.join(__dirname, '../freeUser.json'),
    })
    test("can't remove branding", async ({ page }) => {
      const typebotId = 'free-branding-typebot'
      await importTypebotInDatabase(
        path.join(__dirname, '../fixtures/typebots/theme.json'),
        {
          id: typebotId,
        }
      )
      await page.goto(`/typebots/${typebotId}/settings`)
      await page.click('button:has-text("General")')
      await expect(page.locator('text=Pro')).toBeVisible()
      await page.click('text=Typebot.io branding')
      await expect(page.locator('text=Upgrade now')).toBeVisible()
    })
  })
})
