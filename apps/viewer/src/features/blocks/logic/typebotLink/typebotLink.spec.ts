import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/lib/playwright/databaseActions'

const typebotId = 'cl0ibhi7s0018n21aarlmg0cm'
const linkedTypebotId = 'cl0ibhv8d0130n21aw8doxhj5'

test.beforeAll(async () => {
  try {
    await importTypebotInDatabase(
      getTestAsset('typebots/linkTypebots/1.json'),
      { id: typebotId, publicId: `${typebotId}-public` }
    )
    await importTypebotInDatabase(
      getTestAsset('typebots/linkTypebots/2.json'),
      { id: linkedTypebotId, publicId: `${linkedTypebotId}-public` }
    )
  } catch (err) {
    console.error(err)
  }
})

test('should work as expected', async ({ page }) => {
  await page.goto(`/${typebotId}-public`)
  await page.locator('input').fill('Hello there!')
  await page.locator('input').press('Enter')
  await expect(page.getByText('Cheers!')).toBeVisible()
  await page.goto(`${process.env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
  await expect(page.locator('text=Hello there!')).toBeVisible()
})
