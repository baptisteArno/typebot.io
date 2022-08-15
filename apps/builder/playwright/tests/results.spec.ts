// import test, { expect, Page } from '@playwright/test'
// import cuid from 'cuid'
// import { readFileSync } from 'fs'
// import prisma from 'libs/prisma'
// import { defaultTextInputOptions, InputStepType } from 'models'
// import { parse } from 'papaparse'
// import path from 'path'
// import {
//   createResults,
//   createTypebots,
//   importTypebotInDatabase,
//   parseDefaultBlockWithStep,
// } from '../services/database'
// import { deleteButtonInConfirmDialog } from '../services/selectorUtils'

// const typebotId = cuid()

// test.describe('Results page', () => {
//   test('Submission table header should be parsed correctly', async ({
//     page,
//   }) => {
//     const typebotId = cuid()
//     await importTypebotInDatabase(
//       path.join(
//         __dirname,
//         '../fixtures/typebots/results/submissionHeader.json'
//       ),
//       {
//         id: typebotId,
//       }
//     )
//     await page.goto(`/typebots/${typebotId}/results`)
//     await expect(page.locator('text=Submitted at')).toBeVisible()
//     await expect(page.locator('text=Welcome')).toBeVisible()
//     await expect(page.locator('text=Email')).toBeVisible()
//     await expect(page.locator('text=Name')).toBeVisible()
//     await expect(page.locator('text=Services')).toBeVisible()
//     await expect(page.locator('text=Additional information')).toBeVisible()
//     await expect(page.locator('text=utm_source')).toBeVisible()
//     await expect(page.locator('text=utm_userid')).toBeVisible()
//   })

//   test('results should be deletable', async ({ page }) => {
//     await createTypebots([
//       {
//         id: typebotId,
//         ...parseDefaultBlockWithStep({
//           type: InputStepType.TEXT,
//           options: defaultTextInputOptions,
//         }),
//       },
//     ])
//     await createResults({ typebotId })
//     await page.goto(`/typebots/${typebotId}/results`)
//     await selectFirstResults(page)
//     await page.click('button:has-text("Delete2")')
//     await deleteButtonInConfirmDialog(page).click()
//     await expect(page.locator('text=content199')).toBeHidden()
//     await expect(page.locator('text=content198')).toBeHidden()
//     await page.click('[data-testid="checkbox"] >> nth=0')
//     await page.click('button:has-text("Delete198")')
//     await deleteButtonInConfirmDialog(page).click()
//     await expect(page.locator(':nth-match(tr, 2)')).toBeHidden()
//   })

//   test('submissions table should have infinite scroll', async ({ page }) => {
//     const scrollToBottom = () =>
//       page.evaluate(() => {
//         const tableWrapper = document.querySelector('.table-wrapper')
//         if (!tableWrapper) return
//         tableWrapper.scrollTo(0, tableWrapper.scrollHeight)
//       })

//     await createResults({ typebotId })
//     await page.goto(`/typebots/${typebotId}/results`)
//     await expect(page.locator('text=content199')).toBeVisible()

//     await expect(page.locator('text=content149')).toBeHidden()
//     await scrollToBottom()
//     await expect(page.locator('text=content149')).toBeVisible()

//     await expect(page.locator('text=content99')).toBeHidden()
//     await scrollToBottom()
//     await expect(page.locator('text=content99')).toBeVisible()

//     await expect(page.locator('text=content49')).toBeHidden()
//     await scrollToBottom()
//     await expect(page.locator('text=content49')).toBeVisible()
//     await expect(page.locator('text=content0')).toBeVisible()
//   })

//   test('should correctly export selection in CSV', async ({ page }) => {
//     await page.goto(`/typebots/${typebotId}/results`)
//     await selectFirstResults(page)
//     const [download] = await Promise.all([
//       page.waitForEvent('download'),
//       page.locator('button:has-text("Export2")').click(),
//     ])
//     const path = await download.path()
//     expect(path).toBeDefined()
//     const file = readFileSync(path as string).toString()
//     const { data } = parse(file)
//     validateExportSelection(data)

//     await page.click('[data-testid="checkbox"] >> nth=0')
//     const [downloadAll] = await Promise.all([
//       page.waitForEvent('download'),
//       page.locator('button:has-text("Export200")').click(),
//     ])
//     const pathAll = await downloadAll.path()
//     expect(pathAll).toBeDefined()
//     const fileAll = readFileSync(pathAll as string).toString()
//     const { data: dataAll } = parse(fileAll)
//     validateExportAll(dataAll)
//   })

//   test.describe('Free user', async () => {
//     test.use({
//       storageState: path.join(__dirname, '../freeUser.json'),
//     })
//     test("Incomplete results shouldn't be displayed", async ({ page }) => {
//       await prisma.typebot.update({
//         where: { id: typebotId },
//         data: { workspaceId: 'free' },
//       })
//       await page.goto(`/typebots/${typebotId}/results`)
//       await page.click('text=Unlock')
//       await expect(page.locator('text=For solo creator')).toBeVisible()
//     })
//   })
// })

// const validateExportSelection = (data: unknown[]) => {
//   expect(data).toHaveLength(3)
//   expect((data[1] as unknown[])[1]).toBe('content199')
//   expect((data[2] as unknown[])[1]).toBe('content198')
// }

// const validateExportAll = (data: unknown[]) => {
//   expect(data).toHaveLength(201)
//   expect((data[1] as unknown[])[1]).toBe('content199')
//   expect((data[200] as unknown[])[1]).toBe('content0')
// }

// const selectFirstResults = async (page: Page) => {
//   await page.click('[data-testid="checkbox"] >> nth=1')
//   return page.click('[data-testid="checkbox"] >> nth=2')
// }
