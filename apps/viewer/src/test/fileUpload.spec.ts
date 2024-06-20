import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { parse } from 'papaparse'
import { readFileSync } from 'fs'
import { isDefined } from '@sniper.io/lib'
import { importSniperInDatabase } from '@sniper.io/playwright/databaseActions'
import { getTestAsset } from '@/test/utils/playwright'
import { env } from '@sniper.io/env'

test('should work as expected', async ({ page, browser }) => {
  const sniperId = createId()
  await importSniperInDatabase(getTestAsset('snipers/fileUpload.json'), {
    id: sniperId,
    publicId: `${sniperId}-public`,
  })
  await page.goto(`/${sniperId}-public`)
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([
      getTestAsset('snipers/api.json'),
      getTestAsset('snipers/fileUpload.json'),
      getTestAsset('snipers/hugeGroup.json'),
    ])
  await expect(page.locator(`text="3"`)).toBeVisible()
  await page.locator('text="Upload 3 files"').click()
  await expect(page.locator(`text="3 files uploaded"`)).toBeVisible()
  await page.goto(`${env.NEXTAUTH_URL}/snipers/${sniperId}/results`)
  await expect(page.getByRole('link', { name: 'api.json' })).toHaveAttribute(
    'href',
    /.+\/api\.json/
  )
  await expect(
    page.getByRole('link', { name: 'fileUpload.json' })
  ).toHaveAttribute('href', /.+\/fileUpload\.json/)
  await expect(
    page.getByRole('link', { name: 'hugeGroup.json' })
  ).toHaveAttribute('href', /.+\/hugeGroup\.json/)

  await page.click('[data-testid="checkbox"] >> nth=0')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ])
  const downloadPath = await download.path()
  expect(downloadPath).toBeDefined()
  const file = readFileSync(downloadPath as string).toString()
  const { data } = parse(file)
  expect(data).toHaveLength(2)
  expect((data[1] as unknown[])[1]).toContain(env.S3_ENDPOINT)

  const urls = (
    await Promise.all(
      [
        page.getByRole('link', { name: 'api.json' }),
        page.getByRole('link', { name: 'fileUpload.json' }),
        page.getByRole('link', { name: 'hugeGroup.json' }),
      ].map((elem) => elem.getAttribute('href'))
    )
  ).filter(isDefined)

  const page2 = await browser.newPage()
  await page2.goto(urls[0])
  await expect(page2.locator('pre')).toBeVisible()

  page.getByRole('button', { name: 'Delete' }).click()
  await page.locator('button >> text="Delete"').click()
  await expect(page.locator('text="api.json"')).toBeHidden()
  await page2.goto(urls[0])
  await expect(page2.locator('pre')).toBeHidden()
})
