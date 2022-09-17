import test, { expect } from '@playwright/test'
import {
  createResults,
  freeWorkspaceId,
  importTypebotInDatabase,
} from '../services/database'
import cuid from 'cuid'
import path from 'path'

test('should not start if chat limit is reached', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/fileUpload.json'),
    {
      id: typebotId,
      publicId: `${typebotId}-public`,
      workspaceId: freeWorkspaceId,
    }
  )
  await createResults({ typebotId, count: 320 })
  await page.goto(`/${typebotId}-public`)
  await expect(page.locator('text="This bot is now closed."')).toBeVisible()
})
