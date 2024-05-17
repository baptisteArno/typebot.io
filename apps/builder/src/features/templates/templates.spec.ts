import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'

test.describe.parallel('Templates page', () => {
  test('From scratch should create a blank typebot', async ({ page }) => {
    await page.goto('/typebots/create')
    await expect(
      page.locator('button >> text="Settings & Members"')
    ).toBeEnabled()
    await page.click('text=Start from scratch')
    await expect(page).toHaveURL(new RegExp(`/edit`), { timeout: 20000 })
  })

  test('From file should import correctly', async ({ page }) => {
    await page.goto('/typebots/create')
    await page.waitForTimeout(2000)
    await page.setInputFiles(
      'input[type="file"]',
      getTestAsset('typebots/singleChoiceTarget.json')
    )
    await expect(page).toHaveURL(new RegExp(`/edit`), { timeout: 20000 })
  })

  test('Templates should be previewable and usable', async ({ page }) => {
    await page.goto('/typebots/create')
    await page.click('text=Start from a template')
    await page.click('text=Customer Support')
    await expect(page.locator('text=How can I help you?')).toBeVisible()
    await page.click('text=Use this template')
    await expect(page).toHaveURL(new RegExp(`/edit`), { timeout: 20000 })
  })
})
