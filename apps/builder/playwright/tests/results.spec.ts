import test, { expect, Page } from '@playwright/test'
import cuid from 'cuid'
import { readFileSync } from 'fs'
import { defaultTextInputOptions, InputBlockType } from 'models'
import { parse } from 'papaparse'
import path from 'path'
import { mockSessionApiCalls } from 'playwright/services/browser'
import {
  createResults,
  createTypebots,
  importTypebotInDatabase,
  parseDefaultGroupWithBlock,
} from '../services/database'
import { deleteButtonInConfirmDialog } from '../services/selectorUtils'

const typebotId = cuid()

test.beforeEach(({ page }) => mockSessionApiCalls(page))

test('Submission table header should be parsed correctly', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/results/submissionHeader.json'),
    {
      id: typebotId,
    }
  )
  await page.goto(`/typebots/${typebotId}/results`)
  await expect(page.locator('text=Submitted at')).toBeVisible()
  await expect(page.locator('text=Welcome')).toBeVisible()
  await expect(page.locator('text=Email')).toBeVisible()
  await expect(page.locator('text=Name')).toBeVisible()
  await expect(page.locator('text=Services')).toBeVisible()
  await expect(page.locator('text=Additional information')).toBeVisible()
  await expect(page.locator('text=utm_source')).toBeVisible()
  await expect(page.locator('text=utm_userid')).toBeVisible()
})

test('results should be deletable', async ({ page }) => {
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])
  await createResults({ typebotId })
  await page.goto(`/typebots/${typebotId}/results`)
  await selectFirstResults(page)
  await page.click('text="Delete"')
  await deleteButtonInConfirmDialog(page).click()
  await expect(page.locator('text=content199')).toBeHidden()
  await expect(page.locator('text=content198')).toBeHidden()
  await page.waitForTimeout(1000)
  await page.click('[data-testid="checkbox"] >> nth=0')
  await page.click('text="Delete"')
  await deleteButtonInConfirmDialog(page).click()
  await page.waitForTimeout(1000)
  expect(await page.locator('tr').count()).toBe(1)
  await expect(page.locator('text="Delete"')).toBeHidden()
})

test('submissions table should have infinite scroll', async ({ page }) => {
  const scrollToBottom = () =>
    page.evaluate(() => {
      const tableWrapper = document.querySelector('.table-wrapper')
      if (!tableWrapper) return
      tableWrapper.scrollTo(0, tableWrapper.scrollHeight)
    })

  await createResults({ typebotId })
  await page.goto(`/typebots/${typebotId}/results`)
  await expect(page.locator('text=content199')).toBeVisible()

  await expect(page.locator('text=content149')).toBeHidden()
  await scrollToBottom()
  await expect(page.locator('text=content149')).toBeVisible()

  await expect(page.locator('text=content99')).toBeHidden()
  await scrollToBottom()
  await expect(page.locator('text=content99')).toBeVisible()

  await expect(page.locator('text=content49')).toBeHidden()
  await scrollToBottom()
  await expect(page.locator('text=content49')).toBeVisible()
  await expect(page.locator('text=content0')).toBeVisible()
})

test('should correctly export selection in CSV', async ({ page }) => {
  await page.goto(`/typebots/${typebotId}/results`)
  await selectFirstResults(page)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('text="Export"').click(),
  ])
  const path = await download.path()
  expect(path).toBeDefined()
  const file = readFileSync(path as string).toString()
  const { data } = parse(file)
  validateExportSelection(data)

  await page.click('[data-testid="checkbox"] >> nth=0')
  const [downloadAll] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('text="Export"').click(),
  ])
  const pathAll = await downloadAll.path()
  expect(pathAll).toBeDefined()
  const fileAll = readFileSync(pathAll as string).toString()
  const { data: dataAll } = parse(fileAll)
  validateExportAll(dataAll)
})

test('Can resize, hide and reorder columns', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    path.join(__dirname, '../fixtures/typebots/results/submissionHeader.json'),
    {
      id: typebotId,
    }
  )
  await page.goto(`/typebots/${typebotId}/results`)

  // Resize
  expect((await page.locator('th >> nth=4').boundingBox())?.width).toBe(200)
  await page.waitForTimeout(500)
  await page.dragAndDrop(
    '[data-testid="resize-handle"] >> nth=3',
    '[data-testid="resize-handle"] >> nth=3',
    { targetPosition: { x: 150, y: 0 }, force: true }
  )
  await page.waitForTimeout(500)
  expect((await page.locator('th >> nth=4').boundingBox())?.width).toBe(345)

  // Hide
  await expect(
    page.locator('[data-testid="Submitted at header"]')
  ).toBeVisible()
  await expect(page.locator('[data-testid="Email header"]')).toBeVisible()
  await page.click('button >> text="Columns"')
  await page.click('[aria-label="Hide column"] >> nth=0')
  await page.click('[aria-label="Hide column"] >> nth=1')
  await expect(page.locator('[data-testid="Submitted at header"]')).toBeHidden()
  await expect(page.locator('[data-testid="Email header"]')).toBeHidden()

  // Reorder
  await expect(page.locator('th >> nth=1')).toHaveText('Welcome')
  await expect(page.locator('th >> nth=2')).toHaveText('Name')
  await page.dragAndDrop(
    '[aria-label="Drag"] >> nth=0',
    '[aria-label="Drag"] >> nth=0',
    { targetPosition: { x: 0, y: 80 }, force: true }
  )
  await expect(page.locator('th >> nth=1')).toHaveText('Name')
  await expect(page.locator('th >> nth=2')).toHaveText('Welcome')

  // Preferences should be persisted
  const saveAndReload = async (page: Page) => {
    await page.click('text="Theme"')
    await page.waitForTimeout(2000)
    await page.goto(`/typebots/${typebotId}/results`)
  }
  await saveAndReload(page)
  expect((await page.locator('th >> nth=1').boundingBox())?.width).toBe(345)
  await expect(page.locator('[data-testid="Submitted at header"]')).toBeHidden()
  await expect(page.locator('[data-testid="Email header"]')).toBeHidden()
  await expect(page.locator('th >> nth=1')).toHaveText('Name')
  await expect(page.locator('th >> nth=2')).toHaveText('Welcome')
})

const validateExportSelection = (data: unknown[]) => {
  expect(data).toHaveLength(3)
  expect((data[1] as unknown[])[1]).toBe('content199')
  expect((data[2] as unknown[])[1]).toBe('content198')
}

const validateExportAll = (data: unknown[]) => {
  expect(data).toHaveLength(201)
  expect((data[1] as unknown[])[1]).toBe('content199')
  expect((data[200] as unknown[])[1]).toBe('content0')
}

const selectFirstResults = async (page: Page) => {
  await page.click('[data-testid="checkbox"] >> nth=1')
  return page.click('[data-testid="checkbox"] >> nth=2')
}
