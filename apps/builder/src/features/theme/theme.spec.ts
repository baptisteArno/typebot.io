import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { freeWorkspaceId } from '@typebot.io/playwright/databaseSetup'
import {
  defaultContainerMaxHeight,
  defaultContainerMaxWidth,
} from '@typebot.io/schemas/features/typebot/theme/constants'

const hostAvatarUrl =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80'
const guestAvatarUrl =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80'
const backgroundImageUrl =
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80'

test.describe.parallel('Theme page', () => {
  test.describe('General', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = createId()
      await importTypebotInDatabase(getTestAsset('typebots/theme.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/theme`)
      await expect(page.getByRole('button', { name: 'Go' })).toBeVisible()

      // Branding
      await page.getByRole('button', { name: 'Global' }).click()
      await expect(
        page.locator('a:has-text("Made with Typebot")')
      ).toHaveAttribute('href', 'https://www.typebot.io/?utm_source=litebadge')
      await page.click('text="Show Typebot brand"')
      await expect(page.locator('a:has-text("Made with Typebot")')).toBeHidden()

      // Font
      await page.getByRole('button', { name: 'Font' }).click()
      await page.getByRole('textbox').fill('Roboto Slab')
      await page.getByRole('menuitem', { name: 'Roboto Slab' }).click()
      await expect(page.locator('.typebot-container')).toHaveCSS(
        'font-family',
        /Roboto Slab/
      )

      // BG color
      await expect(page.locator('.typebot-container')).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)'
      )
      await page.getByRole('button', { name: 'Background' }).click()
      await page.click('text=Color')
      await page.waitForTimeout(100)
      await page.getByRole('button', { name: 'Pick a color' }).click()
      await page.fill('[aria-label="Color value"] >> nth=-1', '#2a9d8f')
      await expect(page.locator('.typebot-container')).toHaveCSS(
        'background-color',
        'rgb(42, 157, 143)'
      )
      await page.click('text=Color')

      await page.click('text="Image"')
      await page.getByRole('button', { name: 'Select an image' }).click()
      await page
        .getByPlaceholder('Paste the image link...')
        .fill(backgroundImageUrl)
      await expect(
        page.getByRole('img', { name: 'Background image' })
      ).toHaveAttribute('src', backgroundImageUrl)
      await expect(page.locator('.typebot-container')).toHaveCSS(
        'background-image',
        `url("${backgroundImageUrl}")`
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
      await expect(page.getByRole('button', { name: 'Go' })).toBeVisible()
      await page.click('button:has-text("Chat")')

      // Container
      await expect(page.locator('.typebot-chat-view')).toHaveCSS(
        'max-width',
        defaultContainerMaxWidth
      )
      await page
        .locator('div')
        .filter({ hasText: /^Max width:px$/ })
        .getByRole('spinbutton')
        .fill('600')
      await expect(page.locator('.typebot-chat-view')).toHaveCSS(
        'max-width',
        '600px'
      )
      await expect(page.locator('.typebot-chat-view')).toHaveCSS(
        'max-height',
        defaultContainerMaxHeight
      )
      await page
        .locator('div')
        .filter({ hasText: /^Max height:%$/ })
        .getByRole('spinbutton')
        .fill('80')
      await expect(page.locator('.typebot-chat-view')).toHaveCSS(
        'max-height',
        '80%'
      )
      await expect(page.locator('.typebot-chat-view')).toHaveCSS(
        'color',
        'rgb(48, 50, 53)'
      )

      // Host avatar
      await expect(
        page.locator('[data-testid="default-avatar"]').nth(1)
      ).toBeVisible()
      await page.click('[data-testid="default-avatar"]')
      await page.click('button:has-text("Link")')
      await page.fill(
        'input[placeholder="Paste the image link..."]',
        hostAvatarUrl
      )
      await page.getByRole('button', { name: 'Go' }).click()

      await expect(page.locator('.typebot-container img')).toHaveAttribute(
        'src',
        hostAvatarUrl
      )
      await page.click('text=Bot avatar')

      await expect(page.locator('.typebot-container img')).toBeHidden()

      // Host bubbles
      await page.click(
        '[data-testid="hostBubblesTheme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#F7F8FF"]', '#2a9d8f')
      await page.click(
        '[data-testid="hostBubblesTheme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#303235"]', '#ffffff')
      const hostBubble = page.locator('[data-testid="host-bubble"] >> nth=-1')
      await expect(hostBubble).toHaveCSS(
        'background-color',
        'rgb(42, 157, 143)'
      )
      await expect(hostBubble).toHaveCSS('color', 'rgb(255, 255, 255)')

      // Buttons
      await page.click(
        '[data-testid="buttonsTheme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#0042DA"]', '#7209b7')
      await page.click(
        '[data-testid="buttonsTheme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#FFFFFF"]', '#e9c46a')
      const button = page.getByRole('button', { name: 'Go' })
      await expect(button).toHaveCSS('background-color', 'rgb(114, 9, 183)')
      await expect(button).toHaveCSS('color', 'rgb(233, 196, 106)')

      // Guest bubbles
      await page.click(
        '[data-testid="guestBubblesTheme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#FF8E21"]', '#d8f3dc')
      await page.click(
        '[data-testid="guestBubblesTheme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#FFFFFF"]', '#264653')
      await page.getByRole('button', { name: 'Go' }).click()
      const guestBubble = page.locator('[data-testid="guest-bubble"] >> nth=-1')
      await expect(guestBubble).toHaveCSS(
        'background-color',
        'rgb(216, 243, 220)'
      )
      await expect(guestBubble).toHaveCSS('color', 'rgb(38, 70, 83)')

      // Guest avatar
      await page.click('text=User avatar')
      await expect(
        page.locator('[data-testid="default-avatar"] >> nth=-1')
      ).toBeVisible()
      await page.click('[data-testid="default-avatar"]')
      await page.click('button:has-text("Link")')
      await page
        .locator('input[placeholder="Paste the image link..."]')
        .fill(guestAvatarUrl)
      await page.getByRole('button', { name: 'Go' }).click()
      await expect(
        page.getByRole('img', { name: 'Bot avatar' }).nth(2)
      ).toHaveAttribute('src', guestAvatarUrl)

      await page.waitForTimeout(1000)
      // Input
      await page.click(
        '[data-testid="inputsTheme"] >> [aria-label="Pick a color"] >> nth=0'
      )
      await page.fill('input[value="#FFFFFF"]', '#ffe8d6')
      await page.click(
        '[data-testid="inputsTheme"] >> [aria-label="Pick a color"] >> nth=1'
      )
      await page.fill('input[value="#303235"]', '#023e8a')
      const input = page.locator('.typebot-input')
      await expect(input).toHaveCSS('background-color', 'rgb(255, 232, 214)')
      await expect(input).toHaveCSS('color', 'rgb(2, 62, 138)')
    })
  })

  test.describe('Custom CSS', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = createId()
      await importTypebotInDatabase(getTestAsset('typebots/theme.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/theme`)
      await expect(page.getByRole('button', { name: 'Go' })).toBeVisible()
      await page.click('button:has-text("Custom CSS")')
      await page.fill(
        'div[role="textbox"]',
        '.typebot-button {background-color: green}'
      )
      await expect(page.getByRole('button', { name: 'Go' })).toHaveCSS(
        'background-color',
        'rgb(0, 128, 0)'
      )
    })
  })

  test.describe('Theme templates', () => {
    test('should reflect change in real-time', async ({ page }) => {
      const typebotId = createId()
      await importTypebotInDatabase(getTestAsset('typebots/theme.json'), {
        id: typebotId,
      })
      await page.goto(`/typebots/${typebotId}/theme`)
      await expect(page.getByRole('button', { name: 'Go' })).toBeVisible()
      await page.getByRole('button', { name: 'Templates' }).click()
      await page.getByRole('button', { name: 'Save current theme' }).click()
      await page.getByPlaceholder('My template').fill('My awesome theme')
      await page.getByRole('button', { name: 'Save' }).click()
      await page.getByRole('button', { name: 'Open template menu' }).click()
      await page.getByRole('menuitem', { name: 'Rename' }).click()
      await expect(page.getByPlaceholder('My template')).toHaveValue(
        'My awesome theme'
      )
      await page.getByPlaceholder('My template').fill('My awesome theme 2')
      await page.getByRole('button', { name: 'Save as new template' }).click()
      await expect(
        page.getByRole('button', { name: 'Open template menu' })
      ).toHaveCount(2)
      await page
        .getByRole('button', { name: 'Open template menu' })
        .first()
        .click()
      await page.getByRole('menuitem', { name: 'Delete' }).click()
      await expect(page.getByText('My awesome theme 2')).toBeHidden()
      await page.getByRole('button', { name: 'Gallery' }).click()
      await page.getByText('Typebot Dark').click()
      await expect(page.getByTestId('host-bubble')).toHaveCSS(
        'background-color',
        'rgb(30, 41, 59)'
      )
    })
  })
})

test.describe('Free workspace', () => {
  test("can't remove branding", async ({ page }) => {
    const typebotId = createId()
    await importTypebotInDatabase(getTestAsset('typebots/settings.json'), {
      id: typebotId,
      workspaceId: freeWorkspaceId,
    })
    await page.goto(`/typebots/${typebotId}/theme`)
    await expect(page.locator('text="What\'s your name?"')).toBeVisible()
    await page.getByRole('button', { name: 'Global' }).click()
    await expect(page.locator('[data-testid="starter-lock-tag"]')).toBeVisible()
    await page.click('text=Show Typebot brand')
    await expect(
      page.locator(
        'text="You need to upgrade your plan in order to remove branding"'
      )
    ).toBeVisible()
  })
})
