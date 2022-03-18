import test, { expect } from '@playwright/test'
import path from 'path'
import { typebotViewer } from '../../services/selectorUtils'
import { importTypebotInDatabase } from '../../services/database'
import cuid from 'cuid'

const typebotId = cuid()

test.describe('Code step', () => {
  test('code should trigger', async ({ page }) => {
    await importTypebotInDatabase(
      path.join(__dirname, '../../fixtures/typebots/logic/code.json'),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.fill(
      'div[role="textbox"]',
      'window.location.href = "https://www.google.com"'
    )

    await page.click('text=Preview')
    await typebotViewer(page).locator('text=Trigger code').click()
    await expect(page).toHaveURL('https://www.google.com')
  })
})
