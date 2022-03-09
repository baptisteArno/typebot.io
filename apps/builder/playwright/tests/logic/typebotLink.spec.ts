import test, { expect } from '@playwright/test'
import { typebotViewer } from '../../services/selectorUtils'
import { generate } from 'short-uuid'
import { importTypebotInDatabase } from '../../services/database'
import path from 'path'

test('should be configurable', async ({ page }) => {
  const typebotId = generate()
  const linkedTypebotId = generate()
  await importTypebotInDatabase(
    path.join(__dirname, '../../fixtures/typebots/logic/linkTypebots/1.json'),
    { id: typebotId }
  )
  await importTypebotInDatabase(
    path.join(__dirname, '../../fixtures/typebots/logic/linkTypebots/2.json'),
    { id: linkedTypebotId }
  )

  await page.goto(`/typebots/${typebotId}/edit`)
  await page.click('text=Configure...')
  await page.click('input[placeholder="Select a typebot"]')
  await page.click('text=Another typebot')
  await expect(page.locator('input[value="Another typebot"]')).toBeVisible()
  await page.click('[aria-label="Navigate to typebot"]')
  await expect(page).toHaveURL(
    `/typebots/${linkedTypebotId}/edit?parentId=${typebotId}`
  )
  await page.click('[aria-label="Navigate back"]')
  await expect(page).toHaveURL(`/typebots/${typebotId}/edit`)
  await page.click('text=Jump in Another typebot')
  await expect(page.locator('input[value="Another typebot"]')).toBeVisible()
  await page.click('input[placeholder="Select a block"]')
  await page.click('text=Block #2')

  await page.click('text=Preview')
  await expect(typebotViewer(page).locator('text=Second block')).toBeVisible()

  await page.click('[aria-label="Close"]')
  await page.click('text=Jump to Block #2 in Another typebot')
  await page.click('input[value="Block #2"]', { clickCount: 3 })
  await page.press('input[value="Block #2"]', 'Backspace')
  await page.click('button >> text=Start')

  await page.click('text=Preview')
  await typebotViewer(page).locator('input').fill('Hello there!')
  await typebotViewer(page).locator('input').press('Enter')
  await expect(typebotViewer(page).locator('text=Hello there!')).toBeVisible()

  await page.click('[aria-label="Close"]')
  await page.click('text=Jump to Start in Another typebot')
  await page.click('input[value="Another typebot"]', { clickCount: 3 })
  await page.press('input[value="Another typebot"]', 'Backspace')
  await page.click('button >> text=My typebot')
  await page.click('input[placeholder="Select a block"]', {
    clickCount: 3,
  })
  await page.press('input[placeholder="Select a block"]', 'Backspace')
  await page.click('button >> text=Hello')

  await page.click('text=Preview')
  await expect(typebotViewer(page).locator('text=Hello world')).toBeVisible()
})
