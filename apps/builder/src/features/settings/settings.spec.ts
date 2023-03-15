import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { defaultTextInputOptions } from '@typebot.io/schemas'
import { importTypebotInDatabase } from '@typebot.io/lib/playwright/databaseActions'
import { freeWorkspaceId } from '@typebot.io/lib/playwright/databaseSetup'

test.describe.parallel('Settings page', () => {
  test.describe('General', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = createId()
      await importTypebotInDatabase(getTestAsset('typebots/settings.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/settings`)
      await expect(
        page.locator('a:has-text("Made with Typebot")')
      ).toHaveAttribute('href', 'https://www.typebot.io/?utm_source=litebadge')
      await page.click('text="Typebot.io branding"')
      await expect(page.locator('a:has-text("Made with Typebot")')).toBeHidden()

      await page.click('text="Remember session"')
      await expect(
        page.locator('input[type="checkbox"] >> nth=-3')
      ).toHaveAttribute('checked', '')

      await expect(page.getByPlaceholder('Type your answer...')).toHaveValue(
        'Baptiste'
      )
      await page.click('text=Prefill input')
      await page.click('text=Theme')
      await expect(
        page.locator(
          `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
        )
      ).toHaveValue('')
    })
  })

  test.describe('Typing emulation', () => {
    test('should be fillable', async ({ page }) => {
      const typebotId = createId()
      await importTypebotInDatabase(getTestAsset('typebots/settings.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/settings`)
      await expect(
        page.locator('a:has-text("Made with Typebot")')
      ).toHaveAttribute('href', 'https://www.typebot.io/?utm_source=litebadge')
      await page.click('button:has-text("Typing emulation")')
      await page.fill('[data-testid="speed"] input', '350')
      await page.fill('[data-testid="max-delay"] input', '1.5')
      await page.click('text="Typing emulation" >> nth=-1')
      await expect(page.locator('[data-testid="speed"]')).toBeHidden()
      await expect(page.locator('[data-testid="max-delay"]')).toBeHidden()
    })
  })

  test.describe('Metadata', () => {
    test('should be fillable', async ({ page }) => {
      const favIconUrl = 'https://www.baptistearno.com/favicon.png'
      const imageUrl = 'https://www.baptistearno.com/images/site-preview.png'
      const typebotId = createId()
      await importTypebotInDatabase(getTestAsset('typebots/settings.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/settings`)
      await expect(
        page.locator(
          `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
        )
      ).toHaveValue('Baptiste')
      await page.click('button:has-text("Metadata")')

      // Fav icon
      const favIconImg = page.locator('img >> nth=0')
      await expect(favIconImg).toHaveAttribute('src', '/favicon.png')
      await favIconImg.click()
      await expect(page.locator('text=Giphy')).toBeHidden()
      await page.click('button:has-text("Embed link")')
      await page.fill(
        'input[placeholder="Paste the image link..."]',
        favIconUrl
      )
      await expect(favIconImg).toHaveAttribute('src', favIconUrl)
      // Close popover
      await page.getByText('Image:').click()
      await page.waitForTimeout(1000)

      // Website image
      const websiteImg = page.locator('img >> nth=1')
      await expect(websiteImg).toHaveAttribute('src', '/viewer-preview.png')
      await websiteImg.click()
      await expect(page.locator('text=Giphy')).toBeHidden()
      await page.click('button >> text="Embed link"')
      await page.fill('input[placeholder="Paste the image link..."]', imageUrl)
      await expect(websiteImg).toHaveAttribute('src', imageUrl)

      await page.getByRole('textbox', { name: 'Title' }).fill('Awesome typebot')
      await page
        .getByRole('textbox', { name: 'Description' })
        .fill('Lorem ipsum')
      await page.fill(
        'div[contenteditable=true]',
        '<script>Lorem ipsum</script>'
      )
    })
  })

  test.describe('Free workspace', () => {
    test("can't remove branding", async ({ page }) => {
      const typebotId = createId()
      await importTypebotInDatabase(getTestAsset('typebots/settings.json'), {
        id: typebotId,
        workspaceId: freeWorkspaceId,
      })
      await page.goto(`/typebots/${typebotId}/settings`)
      await expect(page.locator('text="What\'s your name?"')).toBeVisible()
      await expect(
        page.locator('[data-testid="starter-lock-tag"]')
      ).toBeVisible()
      await page.click('text=Typebot.io branding')
      await expect(
        page.locator(
          'text="You need to upgrade your plan in order to remove branding"'
        )
      ).toBeVisible()
    })
  })
})
