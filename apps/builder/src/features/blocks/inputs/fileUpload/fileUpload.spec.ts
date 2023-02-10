import test, { expect } from '@playwright/test'
import { createTypebots } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { defaultFileInputOptions, InputBlockType } from 'models'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { createId } from '@paralleldrive/cuid2'
import { freeWorkspaceId } from 'utils/playwright/databaseSetup'
import { getTestAsset } from '@/test/utils/playwright'

test.describe.configure({ mode: 'parallel' })

test('options should work', async ({ page }) => {
  const typebotId = createId()
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
    .setInputFiles([getTestAsset('avatar.jpg')])
  await expect(typebotViewer(page).locator(`text=File uploaded`)).toBeVisible()
  await page.click('text="Collect file"')
  await page.click('text="Required?"')
  await page.click('text="Allow multiple files?"')
  await page.fill('div[contenteditable=true]', '<strong>Upload now!!</strong>')
  await page.fill('[value="Upload"]', 'Go')
  await page.fill('[value="Clear"]', 'Reset')
  await page.fill('[value="Skip"]', 'Pass')
  await page.fill('input[value="10"]', '20')
  await page.click('text="Restart"')
  await expect(typebotViewer(page).locator(`text="Pass"`)).toBeVisible()
  await expect(typebotViewer(page).locator(`text="Upload now!!"`)).toBeVisible()
  await typebotViewer(page)
    .locator(`input[type="file"]`)
    .setInputFiles([
      getTestAsset('avatar.jpg'),
      getTestAsset('avatar.jpg'),
      getTestAsset('avatar.jpg'),
    ])
  await expect(typebotViewer(page).locator(`text="3"`)).toBeVisible()
  await typebotViewer(page).locator('text="Go"').click()
  await expect(
    typebotViewer(page).locator(`text="3 files uploaded"`)
  ).toBeVisible()
})

test.describe('Free workspace', () => {
  test("shouldn't be able to publish typebot", async ({ page }) => {
    const typebotId = createId()
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
