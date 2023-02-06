import test, { expect } from '@playwright/test'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import cuid from 'cuid'
import { getTestAsset } from '@/test/utils/playwright'

test('should be configurable', async ({ page }) => {
  const typebotId = cuid()
  const linkedTypebotId = cuid()
  await importTypebotInDatabase(
    getTestAsset('typebots/logic/linkTypebots/1.json'),
    { id: typebotId, name: 'My link typebot 1' }
  )
  await importTypebotInDatabase(
    getTestAsset('typebots/logic/linkTypebots/2.json'),
    { id: linkedTypebotId, name: 'My link typebot 2' }
  )

  await page.goto(`/typebots/${typebotId}/edit`)
  await page.click('text=Configure...')
  await page.click('input[placeholder="Select a typebot"]')
  await page.click('text=My link typebot 2')
  await expect(page.locator('input[value="My link typebot 2"]')).toBeVisible()
  await expect(page.getByText('Jump in My link typebot 2')).toBeVisible()
  await page.click('[aria-label="Navigate to typebot"]')
  await expect(page).toHaveURL(
    `/typebots/${linkedTypebotId}/edit?parentId=${typebotId}`
  )
  await page.waitForTimeout(500)
  await page.click('[aria-label="Navigate back"]')
  await expect(page).toHaveURL(`/typebots/${typebotId}/edit`)
  await page.click('text=Jump in My link typebot 2')
  await expect(page.locator('input[value="My link typebot 2"]')).toBeVisible()
  await page.click('input[placeholder="Select a block"]')
  await page.click('text=Group #2')

  await page.click('text=Preview')
  await expect(typebotViewer(page).locator('text=Second block')).toBeVisible()

  await page.click('[aria-label="Close"]')
  await page.click('text=Jump to Group #2 in My link typebot 2')
  await page.click('input[value="Group #2"]', { clickCount: 3 })
  await page.press('input[value="Group #2"]', 'Backspace')
  await page.click('button >> text=Start')

  await page.click('text=Preview')
  await typebotViewer(page).locator('input').fill('Hello there!')
  await typebotViewer(page).locator('input').press('Enter')
  await expect(typebotViewer(page).locator('text=Hello there!')).toBeVisible()

  await page.click('[aria-label="Close"]')
  await page.click('text=Jump to Start in My link typebot 2')
  await page.waitForTimeout(1000)
  await page.click('input[value="My link typebot 2"]', { clickCount: 3 })
  await page.press('input[value="My link typebot 2"]', 'Backspace')
  await page.click('button >> text=My link typebot 1')
  await page.click('input[placeholder="Select a block"]', {
    clickCount: 3,
  })
  await page.press('input[placeholder="Select a block"]', 'Backspace')
  await page.click('button >> text=Hello')

  await page.click('text=Preview')
  await expect(typebotViewer(page).locator('text=Hello world')).toBeVisible()
})
