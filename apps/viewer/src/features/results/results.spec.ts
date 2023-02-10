import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  importTypebotInDatabase,
  injectFakeResults,
} from 'utils/playwright/databaseActions'
import { apiToken } from 'utils/playwright/databaseSetup'
import { typebotViewer } from 'utils/playwright/testHelpers'

test('Big groups should work as expected', async ({ page }) => {
  const typebotId = createId()
  await importTypebotInDatabase(getTestAsset('typebots/hugeGroup.json'), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  })
  await page.goto(`/${typebotId}-public`)
  await typebotViewer(page).locator('input').fill('Baptiste')
  await typebotViewer(page).locator('input').press('Enter')
  await typebotViewer(page).locator('input').fill('26')
  await typebotViewer(page).locator('input').press('Enter')
  await typebotViewer(page).locator('button >> text=Yes').click()
  await page.goto(`${process.env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
  await expect(page.locator('text="Baptiste"')).toBeVisible()
  await expect(page.locator('text="26"')).toBeVisible()
  await expect(page.locator('text="Yes"')).toBeVisible()
  await page.hover('tbody > tr')
  await page.click('button >> text="Open"')
  await expect(page.locator('text="Baptiste" >> nth=1')).toBeVisible()
  await expect(page.locator('text="26" >> nth=1')).toBeVisible()
  await expect(page.locator('text="Yes" >> nth=1')).toBeVisible()
})

test('can list results with API', async ({ request }) => {
  const typebotId = createId()
  await importTypebotInDatabase(getTestAsset('typebots/api.json'), {
    id: typebotId,
  })
  await injectFakeResults({ typebotId, count: 20 })
  expect(
    (await request.get(`/api/typebots/${typebotId}/results`)).status()
  ).toBe(401)
  const response = await request.get(
    `/api/typebots/${typebotId}/results?limit=10`,
    {
      headers: { Authorization: `Bearer ${apiToken}` },
    }
  )
  const { results } = await response.json()
  expect(results).toHaveLength(10)
})
