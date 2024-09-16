import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { parse } from 'papaparse'
import { readFileSync } from 'fs'
import { isDefined } from '@typebot.io/lib'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { getTestAsset } from '@/test/utils/playwright'
import { env } from '@typebot.io/env'

test('should work as expected', async ({ page, browser }) => {
  const typebotId = createId()
  await importTypebotInDatabase(getTestAsset('typebots/fileUpload.json'), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  })
  await page.goto(`/${typebotId}-public`)
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([
      getTestAsset('typebots/api.json'),
      getTestAsset('typebots/fileUpload.json'),
      getTestAsset('typebots/hugeGroup.json'),
    ])
  await page.locator('text="Upload 3 files"').click()
  await expect(page.locator(`text="3 files uploaded"`)).toBeVisible()
  await page.goto(`${env.NEXTAUTH_URL}/typebots/${typebotId}/results`)
  await expect(page.getByRole('link', { name: 'api.json' })).toHaveAttribute(
    'href',
    /.+\/api\.json/,
    {
      timeout: 10000,
    }
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
  const page3 = await browser.newPage()
  await page3.goto(urls[0])
  await expect(page3.locator('pre')).toBeHidden()
})
