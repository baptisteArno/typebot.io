import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  importTypebotInDatabase,
  injectFakeResults,
} from '@typebot.io/playwright/databaseActions'
import { starterWorkspaceId } from '@typebot.io/playwright/databaseSetup'

test('analytics are not available for non-pro workspaces', async ({ page }) => {
  const typebotId = createId()
  await importTypebotInDatabase(
    getTestAsset('typebots/results/submissionHeader.json'),
    {
      id: typebotId,
      workspaceId: starterWorkspaceId,
    }
  )
  await injectFakeResults({ typebotId, count: 10 })
  await page.goto(`/typebots/${typebotId}/results/analytics`)
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
