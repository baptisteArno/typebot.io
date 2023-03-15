import { getTestAsset } from '@/test/utils/playwright'
import { deleteButtonInConfirmDialog } from '@/test/utils/selectorUtils'
import test, { expect, Page } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { readFileSync } from 'fs'
import { parse } from 'papaparse'
import {
  importTypebotInDatabase,
  injectFakeResults,
} from '@typebot.io/lib/playwright/databaseActions'

const typebotId = createId()

test.beforeEach(async () => {
  await importTypebotInDatabase(
    getTestAsset('typebots/results/submissionHeader.json'),
    {
      id: typebotId,
    }
  )
  await injectFakeResults({ typebotId, count: 200, isChronological: true })
})

test('table features should work', async ({ page }) => {
  await page.goto(`/typebots/${typebotId}/results`)

  await test.step('Check header format', async () => {
    await expect(page.locator('text=Submitted at')).toBeVisible()
    await expect(page.locator('text=Welcome')).toBeVisible()
    await expect(page.locator('text=Email')).toBeVisible()
    await expect(page.locator('text=Name')).toBeVisible()
    await expect(page.locator('text=Services')).toBeVisible()
    await expect(page.locator('text=Additional information')).toBeVisible()
    await expect(page.locator('text=utm_source')).toBeVisible()
    await expect(page.locator('text=utm_userid')).toBeVisible()
  })

  await test.step('Resize columns', async () => {
    expect((await page.locator('th >> nth=4').boundingBox())?.width).toBe(200)
    await page.waitForTimeout(500)
    await page.dragAndDrop(
      '[data-testid="resize-handle"] >> nth=3',
      '[data-testid="resize-handle"] >> nth=3',
      { targetPosition: { x: 150, y: 0 }, force: true }
    )
    await page.waitForTimeout(500)
    expect((await page.locator('th >> nth=4').boundingBox())?.width).toBe(345)
  })

  await test.step('Hide columns', async () => {
    await expect(
      page.locator('[data-testid="Submitted at header"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="Email header"]')).toBeVisible()
    await page.getByRole('button', { name: 'Open table settings' }).click()
    await page.getByRole('button', { name: 'Column settings' }).click()
    await page.click('[aria-label="Hide column"] >> nth=0')
    await page.click('[aria-label="Hide column"] >> nth=2')
    await expect(
      page.locator('[data-testid="Submitted at header"]')
    ).toBeHidden()
    await expect(page.locator('[data-testid="Email header"]')).toBeHidden()
  })

  await test.step('Reorder columns', async () => {
    await expect(page.locator('th >> nth=1')).toHaveText('Welcome')
    await expect(page.locator('th >> nth=2')).toHaveText('Name')
    await page.dragAndDrop(
      '[aria-label="Drag"] >> nth=3',
      '[aria-label="Drag"] >> nth=3',
      { targetPosition: { x: 0, y: 80 }, force: true }
    )
    await expect(page.locator('th >> nth=3')).toHaveText('Name')
    await expect(page.locator('th >> nth=1')).toHaveText('Welcome')
  })

  await test.step('Preferences should be persisted', async () => {
    await saveAndReload(page)
    expect((await page.locator('th >> nth=3').boundingBox())?.width).toBe(345)
    await expect(
      page.locator('[data-testid="Submitted at header"]')
    ).toBeHidden()
    await expect(page.locator('[data-testid="Email header"]')).toBeHidden()
    await expect(page.locator('th >> nth=1')).toHaveText('Welcome')
    await expect(page.locator('th >> nth=3')).toHaveText('Name')
  })

  await test.step('Infinite scroll', async () => {
    await expect(page.locator('text=content199')).toBeVisible()

    await expect(page.locator('text=content149')).toBeHidden()
    await scrollToBottom(page)
    await expect(page.locator('text=content149')).toBeVisible()

    await expect(page.locator('text=content99')).toBeHidden()
    await scrollToBottom(page)
    await expect(page.locator('text=content99')).toBeVisible()

    await expect(page.locator('text=content49')).toBeHidden()
    await scrollToBottom(page)
    await expect(page.locator('text=content49')).toBeVisible()
    await expect(page.locator('text=content0')).toBeVisible()
  })

  await test.step('Export', async () => {
    // For some reason, we need to double click on checkboxes to check them
    await getNthCheckbox(page, 1).dblclick()
    await getNthCheckbox(page, 2).dblclick()
    await expect(page.getByRole('button', { name: '2 selected' })).toBeVisible()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export' }).click(),
    ])
    const path = await download.path()
    expect(path).toBeDefined()
    const file = readFileSync(path as string).toString()
    const { data } = parse(file)
    validateExportSelection(data)

    await getNthCheckbox(page, 0).click()
    await expect(
      page.getByRole('button', { name: '200 selected' })
    ).toBeVisible()
    const [downloadAll] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export' }).click(),
    ])
    const pathAll = await downloadAll.path()
    expect(pathAll).toBeDefined()
    const fileAll = readFileSync(pathAll as string).toString()
    const { data: dataAll } = parse(fileAll)
    validateExportAll(dataAll)
    await getNthCheckbox(page, 0).click()
    await page.getByRole('button', { name: 'Open table settings' }).click()
    await page.getByRole('button', { name: 'Export all' }).click()
    const [downloadAllFromMenu] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export' }).click(),
    ])
    const pathAllFromMenu = await downloadAllFromMenu.path()
    expect(pathAllFromMenu).toBeDefined()
    const fileAllFromMenu = readFileSync(pathAllFromMenu as string).toString()
    const { data: dataAllFromMenu } = parse(fileAllFromMenu)
    validateExportAll(dataAllFromMenu)
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  await test.step('Delete', async () => {
    await getNthCheckbox(page, 1).click()
    await getNthCheckbox(page, 2).click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await deleteButtonInConfirmDialog(page).click()
    await expect(page.locator('text=content199')).toBeHidden()
    await expect(page.locator('text=content198')).toBeHidden()
    await page.waitForTimeout(1000)
    await page.click('[data-testid="checkbox"] >> nth=0')
    await page.getByRole('button', { name: 'Delete' }).click()
    await deleteButtonInConfirmDialog(page).click()
    await page.waitForTimeout(1000)
    expect(await page.locator('tr').count()).toBe(1)
    await expect(page.locator('text="Delete"')).toBeHidden()
  })
})

const validateExportSelection = (data: unknown[]) => {
  expect(data).toHaveLength(3)
  expect((data[1] as unknown[])[2]).toBe('content199')
  expect((data[2] as unknown[])[2]).toBe('content198')
}

const validateExportAll = (data: unknown[]) => {
  expect(data).toHaveLength(201)
  expect((data[1] as unknown[])[2]).toBe('content199')
  expect((data[200] as unknown[])[2]).toBe('content0')
}

const scrollToBottom = (page: Page) =>
  page.evaluate(() => {
    const tableWrapper = document.querySelector('[data-testid="results-table"]')
    if (!tableWrapper) return
    tableWrapper.scrollTo(0, tableWrapper.scrollHeight)
  })

const saveAndReload = async (page: Page) => {
  await page.click('text="Theme"')
  await page.waitForTimeout(2000)
  await page.goto(`/typebots/${typebotId}/results`)
}

const getNthCheckbox = (page: Page, n: number) =>
  page.getByTestId('checkbox').nth(n)
