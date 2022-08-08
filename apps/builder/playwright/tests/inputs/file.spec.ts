import test, { expect } from '@playwright/test'
import {
  createTypebots,
  freeWorkspaceId,
  parseDefaultGroupWithBlock,
} from '../../services/database'
import { defaultFileInputOptions, InputBlockType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'
import path from 'path'
import { mockSessionApiCalls } from 'playwright/services/browser'

test.beforeEach(({ page }) => mockSessionApiCalls(page))

test.describe.configure({ mode: 'parallel' })

test('options should work', async ({ page }) => {
  const typebotId = cuid()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.FILE,
        options: defaultFileInputOptions,
      }),
    },
  ])

  await page.goto(`/typebots/${typebotId}/edit`)

  await page.click('text=Preview')
  await expect(
    typebotViewer(page).locator(`text=Click to upload`)
  ).toBeVisible()
  await expect(typebotViewer(page).locator(`text="Skip"`)).toBeHidden()
  await typebotViewer(page)
    .locator(`input[type="file"]`)
    .setInputFiles([path.join(__dirname, '../../fixtures/avatar.jpg')])
  await expect(typebotViewer(page).locator(`text=File uploaded`)).toBeVisible()
  await page.click('text="Collect file"')
  await page.click('text="Required?"')
  await page.click('text="Allow multiple files?"')
  await page.fill('div[contenteditable=true]', '<strong>Upload now!!</strong>')
  await page.fill('[value="Upload"]', 'Go')
  await page.fill('input[value="10"]', '20')
  await page.click('text="Restart"')
  await expect(typebotViewer(page).locator(`text="Skip"`)).toBeVisible()
  await expect(typebotViewer(page).locator(`text="Upload now!!"`)).toBeVisible()
  await typebotViewer(page)
    .locator(`input[type="file"]`)
    .setInputFiles([
      path.join(__dirname, '../../fixtures/avatar.jpg'),
      path.join(__dirname, '../../fixtures/avatar.jpg'),
      path.join(__dirname, '../../fixtures/avatar.jpg'),
    ])
  await expect(typebotViewer(page).locator(`text="3"`)).toBeVisible()
  await typebotViewer(page).locator('text="Go 3 files"').click()
  await expect(
    typebotViewer(page).locator(`text="3 files uploaded"`)
  ).toBeVisible()
})

test.describe('Free workspace', () => {
  test.use({
    storageState: path.join(__dirname, '../../freeUser.json'),
  })
  test("shouldn't be able to publish typebot", async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.FILE,
          options: defaultFileInputOptions,
        }),
        workspaceId: freeWorkspaceId,
      },
    ])
    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text="Collect file"')
    await page.click('text="Allow multiple files?"')
    await page.click('text="Publish"')
    await expect(
      page.locator(
        'text="You need to upgrade your plan in order to use file input blocks"'
      )
    ).toBeVisible()
  })
})
