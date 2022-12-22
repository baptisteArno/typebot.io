import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'

const hostAvatarUrl =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80'
const guestAvatarUrl =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80'

test.describe.parallel('Theme page', () => {
  test.describe('General', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = cuid()
      const chatContainer = typebotViewer(page).locator(
        '[data-testid="container"]'
      )
      await importTypebotInDatabase(getTestAsset('typebots/theme.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/theme`)
      await expect(
        typebotViewer(page).locator('button >> text="Go"')
      ).toBeVisible()

      // Font
      await page.fill('input[type="text"]', 'Roboto Slab')
      await expect(chatContainer).toHaveCSS('font-family', '"Roboto Slab"')

      // BG color
      await expect(chatContainer).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)'
      )
      await page.click('text=Color')
      await page.click('[aria-label="Pick a color"]')
      await page.fill('[aria-label="Color value"] >> nth=-1', '#2a9d8f')
      await expect(chatContainer).toHaveCSS(
        'background-color',
        'rgb(42, 157, 143)'
      )
    })
  })

  test.describe('Chat', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = 'chat-theme-typebot'
      try {
        await importTypebotInDatabase(getTestAsset('typebots/theme.json'), {
          id: typebotId,
        })
      } catch {
        /* empty */
      }

      await page.goto(`/typebots/${typebotId}/theme`)
      await expect(
        typebotViewer(page).locator('button >> text="Go"')
      ).toBeVisible()
      await page.click('button:has-text("Chat")')

      // Host avatar
      await expect(
        typebotViewer(page).locator('[data-testid="default-avatar"]')
      ).toBeVisible()
      await page.click('[data-testid="default-avatar"]')
      await page.click('button:has-text("Embed link")')
      await page.fill(
        'input[placeholder="Paste the image link..."]',
        hostAvatarUrl
      )
      await typebotViewer(page).locator('button >> text="Go"').click()

      await expect(typebotViewer(page).locator('img')).toHaveAttribute(
        'src',
        hostAvatarUrl
      )
      await page.click('text=Bot avatar')

      await expect(typebotViewer(page).locator('img')).toBeHidden()

      // Host bubbles
      await page.click(
        '[data-testid="host-bubbles-theme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#F7F8FF"]', '#2a9d8f')
      await page.click(
        '[data-testid="host-bubbles-theme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#303235"]', '#ffffff')
      const hostBubble = typebotViewer(page).locator(
        '[data-testid="host-bubble"] >> nth=-1'
      )
      await expect(hostBubble).toHaveCSS(
        'background-color',
        'rgb(42, 157, 143)'
      )
      await expect(hostBubble).toHaveCSS('color', 'rgb(255, 255, 255)')

      // Buttons
      await page.click(
        '[data-testid="buttons-theme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#0042DA"]', '#7209b7')
      await page.click(
        '[data-testid="buttons-theme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#FFFFFF"]', '#e9c46a')
      const button = typebotViewer(page).locator('[data-testid="button"]')
      await expect(button).toHaveCSS('background-color', 'rgb(114, 9, 183)')
      await expect(button).toHaveCSS('color', 'rgb(233, 196, 106)')

      // Guest bubbles
      await page.click(
        '[data-testid="guest-bubbles-theme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#FF8E21"]', '#d8f3dc')
      await page.click(
        '[data-testid="guest-bubbles-theme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#FFFFFF"]', '#264653')
      await typebotViewer(page).locator('button >> text="Go"').click()
      const guestBubble = typebotViewer(page).locator(
        '[data-testid="guest-bubble"] >> nth=-1'
      )
      await expect(guestBubble).toHaveCSS(
        'background-color',
        'rgb(216, 243, 220)'
      )
      await expect(guestBubble).toHaveCSS('color', 'rgb(38, 70, 83)')

      // Guest avatar
      await page.click('text=User avatar')
      await expect(
        typebotViewer(page).locator('[data-testid="default-avatar"] >> nth=-1')
      ).toBeVisible()
      await page.click('[data-testid="default-avatar"]')
      await page.click('button:has-text("Embed link")')
      await page.fill(
        'input[placeholder="Paste the image link..."]',
        guestAvatarUrl
      )

      typebotViewer(page).locator('button >> text="Go"').click()
      await expect(typebotViewer(page).locator('img')).toHaveAttribute(
        'src',
        guestAvatarUrl
      )

      // Input
      await page.click(
        '[data-testid="inputs-theme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#FFFFFF"]', '#ffe8d6')
      await page.click(
        '[data-testid="inputs-theme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#303235"]', '#023e8a')
      const input = typebotViewer(page).locator('.typebot-input')
      await expect(input).toHaveCSS('background-color', 'rgb(255, 232, 214)')
      await expect(input).toHaveCSS('color', 'rgb(2, 62, 138)')
    })
  })

  test.describe('Custom CSS', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = cuid()
      await importTypebotInDatabase(getTestAsset('typebots/theme.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/theme`)
      await expect(
        typebotViewer(page).locator('button >> text="Go"')
      ).toBeVisible()
      await page.click('button:has-text("Custom CSS")')
      await page.fill(
        'div[role="textbox"]',
        '.typebot-button {background-color: green}'
      )
      await expect(
        typebotViewer(page).locator('[data-testid="button"]')
      ).toHaveCSS('background-color', 'rgb(0, 128, 0)')
    })
  })
})
