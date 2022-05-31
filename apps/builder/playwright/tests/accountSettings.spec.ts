import test, { expect } from '@playwright/test'
import path from 'path'

// Can't test the update features because of the auth mocking.
test('should display user info properly', async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  const saveButton = page.locator('button:has-text("Save")')
  await expect(saveButton).toBeHidden()
  await expect(
    page.locator('input[type="email"]').getAttribute('disabled')
  ).toBeDefined()
  await page.fill('#name', 'John Doe')
  expect(saveButton).toBeVisible()
  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, '../fixtures/avatar.jpg')
  )
  await expect(page.locator('img >> nth=1')).toHaveAttribute(
    'src',
    new RegExp(
      `http://localhost:9000/typebot/public/users/proUser/avatar`,
      'gm'
    )
  )
  await page.click('text="Preferences"')
  await expect(page.locator('text=Trackpad')).toBeVisible()
})
