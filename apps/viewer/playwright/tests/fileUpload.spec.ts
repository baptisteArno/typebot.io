import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import path from 'path'
import { parse } from 'papaparse'
import { typebotViewer } from '../services/selectorUtils'
import { importTypebotInDatabase } from '../services/database'
import { readFileSync } from 'fs'

test('should work as expected', async ({ page, context }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/fileUpload.json'),
    { id: typebotId, publicId: `${typebotId}-public` }
  )
  await page.goto(`/${typebotId}-public`)
  await typebotViewer(page)
    .locator(`input[type="file"]`)
    .setInputFiles([
      path.join(__dirname, '../fixtures/typebots/api.json'),
      path.join(__dirname, '../fixtures/typebots/fileUpload.json'),
      path.join(__dirname, '../fixtures/typebots/hugeGroup.json'),
    ])
  await expect(typebotViewer(page).locator(`text="3"`)).toBeVisible()
  await typebotViewer(page).locator('text="Upload 3 files"').click()
  await expect(
    typebotViewer(page).locator(`text="3 files uploaded"`)
  ).toBeVisible()
  await page.goto(`http://localhost:3000/typebots/${typebotId}/results`)
  await expect(page.locator('text="api.json"')).toHaveAttribute(
    'href',
    /.+\/api\.json/
  )
  await expect(page.locator('text="fileUpload.json"')).toHaveAttribute(
    'href',
    /.+\/fileUpload\.json/
  )
  await expect(page.locator('text="api.json"')).toHaveAttribute(
    'href',
    /.+\/api\.json/
  )

  await page.click('[data-testid="checkbox"] >> nth=0')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button:has-text("Export1")').click(),
  ])
  const downloadPath = await download.path()
  expect(path).toBeDefined()
  const file = readFileSync(downloadPath as string).toString()
  const { data } = parse(file)
  expect(data).toHaveLength(2)
  expect((data[1] as unknown[])[1]).toContain('http://localhost:9000')
})
