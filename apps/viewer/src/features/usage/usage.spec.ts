import test, { expect } from '@playwright/test'
import cuid from 'cuid'

// TODO: uncomment on 1st of November

// test('should not start if chat limit is reached', async ({ page }) => {
//   const typebotId = cuid()
//   await importTypebotInDatabase(
//     path.join(__dirname, '../fixtures/typebots/fileUpload.json'),
//     {
//       id: typebotId,
//       publicId: `${typebotId}-public`,
//       workspaceId: limitTestWorkspaceId,
//     }
//   )
//   await createResults({ typebotId, count: 320 })
//   await page.goto(`/${typebotId}-public`)
//   await expect(page.locator('text="This bot is now closed."')).toBeVisible()
// })
