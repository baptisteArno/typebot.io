import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

test('should be configurable', async ({ page }) => {
  const typebotId = createId()
  const linkedTypebotId = createId()
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
  await expect(page.getByTestId('selected-item-label').first()).toHaveText(
    'My link typebot 2'
  )
  await page.click('input[placeholder="Select a group"]')
  await page.click('text=Group #2')

  await page.click('text=Test')
  await expect(
    page.locator('typebot-standard').locator('text=Second block')
  ).toBeVisible()

  await page.click('[aria-label="Close"]')
  await page.click('text=Jump to Group #2 in My link typebot 2')
  await page.getByTestId('selected-item-label').nth(1).click({ force: true })
  await page.getByLabel('Clear').click()

  await page.click('text=Test')
  await page.getByPlaceholder('Type your answer...').fill('Hello there!')
  await page.getByPlaceholder('Type your answer...').press('Enter')
  await expect(
    page.locator('typebot-standard').locator('text=Hello there!')
  ).toBeVisible()

  await page.click('[aria-label="Close"]')
  await page.click('text=Jump in My link typebot 2')
  await page.waitForTimeout(1000)
  await page.getByTestId('selected-item-label').first().click({ force: true })
  await page.click('button >> text=Current typebot')
  await page.getByRole('textbox').nth(2).click()
  await page.click('button >> text=Hello')

  await page.click('text=Test')
  await expect(
    page.locator('typebot-standard').locator('text=Hello world')
  ).toBeVisible()
})
