import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  importSniperInDatabase,
  injectFakeResults,
} from '@sniper.io/playwright/databaseActions'
import { starterWorkspaceId } from '@sniper.io/playwright/databaseSetup'

test('analytics are not available for non-pro workspaces', async ({ page }) => {
  const sniperId = createId()
  await importSniperInDatabase(
    getTestAsset('snipers/results/submissionHeader.json'),
    {
      id: sniperId,
      workspaceId: starterWorkspaceId,
    }
  )
  await injectFakeResults({ sniperId, count: 10 })
  await page.goto(`/snipers/${sniperId}/results/analytics`)
  const firstDropoffBox = page.locator('text="%" >> nth=0')
  await firstDropoffBox.hover()
  await expect(
    page.locator('text="Upgrade your plan to PRO to reveal drop-off rate."')
  ).toBeVisible()
  await firstDropoffBox.click()
  await expect(
    page.locator(
      'text="You need to upgrade your plan in order to unlock in-depth analytics"'
    )
  ).toBeVisible()
})
