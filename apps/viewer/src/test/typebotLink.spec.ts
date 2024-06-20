import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { env } from '@sniper.io/env'
import { importSniperInDatabase } from '@sniper.io/playwright/databaseActions'

const sniperId = 'cl0ibhi7s0018n21aarlmg0cm'
const sniperWithMergeDisabledId = 'cl0ibhi7s0018n21aarlag0cm'
const linkedSniperId = 'cl0ibhv8d0130n21aw8doxhj5'

test.beforeAll(async () => {
  try {
    await importSniperInDatabase(getTestAsset('snipers/linkSnipers/1.json'), {
      id: sniperId,
      publicId: `${sniperId}-public`,
    })
    await importSniperInDatabase(
      getTestAsset('snipers/linkSnipers/1-merge-disabled.json'),
      {
        id: sniperWithMergeDisabledId,
        publicId: `${sniperWithMergeDisabledId}-public`,
      }
    )
    await importSniperInDatabase(getTestAsset('snipers/linkSnipers/2.json'), {
      id: linkedSniperId,
      publicId: `${linkedSniperId}-public`,
    })
  } catch (err) {
    console.error(err)
  }
})

test('should work as expected', async ({ page }) => {
  await page.goto(`/${sniperId}-public`)
  await page.locator('input').fill('Hello there!')
  await page.locator('input').press('Enter')
  await expect(page.getByText('Cheers!')).toBeVisible()
  await page.goto(`${env.NEXTAUTH_URL}/snipers/${sniperId}/results`)
  await expect(page.locator('text=Hello there!')).toBeVisible()
})

test.describe('Merge disabled', () => {
  test('should work as expected', async ({ page }) => {
    await page.goto(`/${sniperWithMergeDisabledId}-public`)
    await page.locator('input').fill('Hello there!')
    await page.locator('input').press('Enter')
    await expect(page.getByText('Cheers!')).toBeVisible()
    await page.goto(
      `${process.env.NEXTAUTH_URL}/snipers/${sniperWithMergeDisabledId}/results`
    )
    await expect(page.locator('text=Submitted at')).toBeVisible()
    await expect(page.locator('text=Hello there!')).toBeHidden()
    await page.goto(
      `${process.env.NEXTAUTH_URL}/snipers/${linkedSniperId}/results`
    )
    await expect(page.locator('text=Hello there!')).toBeVisible()
  })
})
