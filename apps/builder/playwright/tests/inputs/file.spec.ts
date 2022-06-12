import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultGroupWithBlock,
} from '../../services/database'
import { defaultFileInputOptions, InputBlockType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'
import path from 'path'

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
  await typebotViewer(page)
    .locator(`input[type="file"]`)
    .setInputFiles([path.join(__dirname, '../../fixtures/avatar.jpg')])
  await expect(typebotViewer(page).locator(`text=File uploaded`)).toBeVisible()
  await page.click('text="Collect file"')
  await page.click('text="Allow multiple files?"')
  await page.fill('div[contenteditable=true]', '<strong>Upload now!!</strong>')
  await page.fill('[value="Upload"]', 'Go')
  await page.click('text="Restart"')
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
