import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import path from 'path'
import { parse } from 'papaparse'
import { readFileSync } from 'fs'
import { isDefined } from 'utils'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'

const THREE_GIGABYTES = 3 * 1024 * 1024 * 1024

test('should work as expected', async ({ page, browser }) => {
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
  await page.goto(`${process.env.BUILDER_URL}/typebots/${typebotId}/results`)
  await expect(page.locator('text="api.json"')).toHaveAttribute(
    'href',
    /.+\/api\.json/
  )
  await expect(page.locator('text="fileUpload.json"')).toHaveAttribute(
    'href',
    /.+\/fileUpload\.json/
  )
  await expect(page.locator('text="hugeGroup.json"')).toHaveAttribute(
    'href',
    /.+\/hugeGroup\.json/
  )

  await page.click('[data-testid="checkbox"] >> nth=0')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('text="Export"').click(),
  ])
  const downloadPath = await download.path()
  expect(downloadPath).toBeDefined()
  const file = readFileSync(downloadPath as string).toString()
  const { data } = parse(file)
  expect(data).toHaveLength(2)
  expect((data[1] as unknown[])[1]).toContain('http://localhost:9000')

  const urls = (
    await Promise.all(
      [
        page.locator('text="api.json"'),
        page.locator('text="fileUpload.json"'),
        page.locator('text="hugeGroup.json"'),
      ].map((elem) => elem.getAttribute('href'))
    )
  ).filter(isDefined)

  const page2 = await browser.newPage()
  await page2.goto(urls[0])
  await expect(page2.locator('pre')).toBeVisible()

  await page.locator('button >> text="Delete"').click()
  await page.locator('button >> text="Delete" >> nth=1').click()
  await expect(page.locator('text="api.json"')).toBeHidden()
  await page2.goto(urls[0])
  await expect(
    page2.locator('span:has-text("The specified key does not exist.")')
  ).toBeVisible()
  await page2.goto(urls[1])
  await expect(
    page2.locator('span:has-text("The specified key does not exist.")')
  ).toBeVisible()
  await page2.goto(urls[2])
  await expect(
    page2.locator('span:has-text("The specified key does not exist.")')
  ).toBeVisible()
})

// TODO: uncomment on 1st of November

// test.describe('Storage limit is reached', () => {
//   const typebotId = cuid()

//   test.beforeAll(async () => {
//     await importTypebotInDatabase(
//       path.join(__dirname, '../fixtures/typebots/fileUpload.json'),
//       {
//         id: typebotId,
//         publicId: `${typebotId}-public`,
//       }
//     )
//     await createResults({
//       typebotId,
//       count: 20,
//       fakeStorage: THREE_GIGABYTES,
//     })
//   })

//   test("shouldn't upload anything if limit has been reached", async ({
//     page,
//   }) => {
//     await page.goto(`/${typebotId}-public`)
//     await typebotViewer(page)
//       .locator(`input[type="file"]`)
//       .setInputFiles([
//         path.join(__dirname, '../fixtures/typebots/api.json'),
//         path.join(__dirname, '../fixtures/typebots/fileUpload.json'),
//         path.join(__dirname, '../fixtures/typebots/hugeGroup.json'),
//       ])
//     await expect(typebotViewer(page).locator(`text="3"`)).toBeVisible()
//     await typebotViewer(page).locator('text="Upload 3 files"').click()
//     await expect(
//       typebotViewer(page).locator(`text="3 files uploaded"`)
//     ).toBeVisible()
//     await page.evaluate(() =>
//       window.localStorage.setItem('workspaceId', 'starterWorkspace')
//     )
//     await page.goto(`${process.env.BUILDER_URL}/typebots/${typebotId}/results`)
//     await expect(page.locator('text="150%"')).toBeVisible()
//     await expect(page.locator('text="api.json"')).toBeHidden()
//   })
// })
