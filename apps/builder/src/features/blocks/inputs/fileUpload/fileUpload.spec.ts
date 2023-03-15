import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'
import { defaultFileInputOptions, InputBlockType } from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'
import { freeWorkspaceId } from '@typebot.io/lib/playwright/databaseSetup'
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
  await expect(page.locator(`text=Click to upload`)).toBeVisible()
  await expect(page.locator(`text="Skip"`)).toBeHidden()
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([getTestAsset('avatar.jpg')])
  await expect(page.locator(`text=File uploaded`)).toBeVisible()
  await page.click('text="Collect file"')
  await page.click('text="Required?"')
  await page.click('text="Allow multiple files?"')
  await page.fill('div[contenteditable=true]', '<strong>Upload now!!</strong>')
  await page.fill('[value="Upload"]', 'Go')
  await page.fill('[value="Clear"]', 'Reset')
  await page.fill('[value="Skip"]', 'Pass')
  await page.fill('input[value="10"]', '20')
  await page.click('text="Restart"')
  await expect(page.locator(`text="Pass"`)).toBeVisible()
  await expect(page.locator(`text="Upload now!!"`)).toBeVisible()
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([
      getTestAsset('avatar.jpg'),
      getTestAsset('avatar.jpg'),
      getTestAsset('avatar.jpg'),
    ])
  await expect(page.locator(`text="3"`)).toBeVisible()
  await page.locator('text="Go"').click()
  await expect(page.locator(`text="3 files uploaded"`)).toBeVisible()
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
