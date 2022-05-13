import test, { expect, Page } from '@playwright/test'
import cuid from 'cuid'
import path from 'path'
import { createFolders, createTypebots } from '../services/database'
import { deleteButtonInConfirmDialog } from '../services/selectorUtils'

test.describe('Dashboard page', () => {
  test('folders navigation should work', async ({ page }) => {
    await page.goto('/typebots')
    const createFolderButton = page.locator(
      'button:has-text("Create a folder")'
    )
    await expect(createFolderButton).not.toBeDisabled()
    await createFolderButton.click()
    await page.click('text="New folder"')
    await page.fill('input[value="New folder"]', 'My folder #1')
    await page.press('input[value="My folder #1"]', 'Enter')
    await waitForNextApiCall(page)
    await page.click('li:has-text("My folder #1")')
    await expect(page.locator('h1:has-text("My folder #1")')).toBeVisible()
    await createFolderButton.click()
    await page.click('text="New folder"')
    await page.fill('input', 'My folder #2')
    await page.press('input', 'Enter')
    await waitForNextApiCall(page)

    await page.click('li:has-text("My folder #2")')
    await expect(page.locator('h1 >> text="My folder #2"')).toBeVisible()

    await page.click('text="Back"')
    await expect(page.locator('span >> text="My folder #2"')).toBeVisible()

    await page.click('text="Back"')
    await expect(page.locator('span >> text=My folder #1')).toBeVisible()
  })

  test('folders and typebots should be deletable', async ({ page }) => {
    await createFolders([{ name: 'Folder #1' }, { name: 'Folder #2' }])
    await createTypebots([{ id: 'deletable-typebot', name: 'Typebot #1' }])
    await page.goto('/typebots')
    await page.click('button[aria-label="Show Folder #1 menu"]')
    await page.click('li:has-text("Folder #1") >> button:has-text("Delete")')
    await deleteButtonInConfirmDialog(page).click()
    await expect(page.locator('span >> text="Folder #1"')).not.toBeVisible()
    await page.click('button[aria-label="Show Typebot #1 menu"]')
    await page.click('li:has-text("Typebot #1") >> button:has-text("Delete")')
    await deleteButtonInConfirmDialog(page).click()
    await expect(page.locator('span >> text="Typebot #1"')).not.toBeVisible()
  })

  test('folders and typebots should be movable', async ({ page }) => {
    const droppableFolderId = cuid()
    await createFolders([{ id: droppableFolderId, name: 'Droppable folder' }])
    await createTypebots([{ name: 'Draggable typebot' }])
    await page.goto('/typebots')
    const typebotButton = page.locator('li:has-text("Draggable typebot")')
    const folderButton = page.locator('li:has-text("Droppable folder")')
    await page.dragAndDrop(
      'li:has-text("Draggable typebot")',
      'li:has-text("Droppable folder")'
    )
    await waitForNextApiCall(page)
    await expect(typebotButton).toBeHidden()
    await folderButton.click()
    await expect(page).toHaveURL(new RegExp(`/folders/${droppableFolderId}`))
    await expect(typebotButton).toBeVisible()
    await page.dragAndDrop(
      'li:has-text("Draggable typebot")',
      'a:has-text("Back")'
    )
    await waitForNextApiCall(page)
    await expect(typebotButton).toBeHidden()
    await page.click('a:has-text("Back")')
    await expect(typebotButton).toBeVisible()
  })

  test.describe('Free user', () => {
    test.use({
      storageState: path.join(__dirname, '../freeUser.json'),
    })
    test("create folder shouldn't be available", async ({ page }) => {
      await page.goto('/typebots')
      await page.click('text=Shared workspace')
      await page.click('text=Free workspace')
      await page.click('text=Create a folder')
      await expect(page.locator('text=For solo creator')).toBeVisible()
    })
  })
})

const waitForNextApiCall = (page: Page, path?: string) =>
  page.waitForResponse((resp) => resp.url().includes(path ?? '/api'))
