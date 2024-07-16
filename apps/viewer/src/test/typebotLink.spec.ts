import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { env } from '@typebot.io/env'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'

const typebotId = 'cl0ibhi7s0018n21aarlmg0cm'
const typebotWithMergeDisabledId = 'cl0ibhi7s0018n21aarlag0cm'
const linkedTypebotId = 'cl0ibhv8d0130n21aw8doxhj5'

test.beforeAll(async () => {
  try {
    await importTypebotInDatabase(
      getTestAsset('typebots/linkTypebots/1.json'),
      { id: typebotId, publicId: `${typebotId}-public` }
    )
    await importTypebotInDatabase(
      getTestAsset('typebots/linkTypebots/1-merge-disabled.json'),
      {
        id: typebotWithMergeDisabledId,
        publicId: `${typebotWithMergeDisabledId}-public`,
      }
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
  await page.getByPlaceholder('Type your answer...').fill('Hello there!')
  await page.getByPlaceholder('Type your answer...').press('Enter')
  await expect(page.getByText('Cheers!')).toBeVisible()
  await page.goto(`${env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
  await expect(page.locator('text=Hello there!')).toBeVisible()
})

test.describe('Merge disabled', () => {
  test('should work as expected', async ({ page }) => {
    await page.goto(`/${typebotWithMergeDisabledId}-public`)
    await page.getByPlaceholder('Type your answer...').fill('Hello there!')
    await page.getByPlaceholder('Type your answer...').press('Enter')
    await expect(page.getByText('Cheers!')).toBeVisible()
    await page.goto(
      `${process.env.NEXTAUTH_URL}/typebots/${typebotWithMergeDisabledId}/results`
    )
    await expect(page.locator('text=Submitted at')).toBeVisible()
    await expect(page.locator('text=Hello there!')).toBeHidden()
    await page.goto(
      `${process.env.NEXTAUTH_URL}/typebots/${linkedTypebotId}/results`
    )
    await expect(page.locator('text=Hello there!')).toBeVisible()
  })
})
