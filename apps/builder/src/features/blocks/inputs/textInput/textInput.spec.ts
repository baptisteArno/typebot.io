import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'
import { getTestAsset } from '@/test/utils/playwright'

test.describe.parallel('Text input block', () => {
  test('options should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Test')
    await expect(
      page.locator(
        `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'text')

    await page.click(`text=${defaultTextInputOptions.labels.placeholder}`)

    await expect(page.getByText('Long text?')).toHaveCount(0)
    await expect(page.getByLabel('Button label:')).toHaveCount(0)
    await expect(page.getByText('Allow attachments')).toHaveCount(0)

    const editor = page.getByLabel('Caption editor')
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('Your name...')
    await page.keyboard.press('ControlOrMeta+a')
    await page.getByLabel('Toggle bold').click()
    await page.getByLabel('Toggle italic').click()
    await page.getByLabel('Toggle underline').click()

    await page.click('text=Restart')
    await expect(
      page.locator(`input[placeholder="Your name..."]`)
    ).toBeVisible()
  })

  test('existing attachments flows keep working', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
          options: {
            attachments: { isEnabled: true, saveVariableId: 'var1' },
          },
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.getByRole('button', { name: 'Test' }).click()
    await page
      .getByPlaceholder('Type your answer...')
      .fill('Help me with these')
    await page.getByLabel('Add attachments').click()
    await expect(page.getByRole('menuitem', { name: 'Document' })).toBeVisible()
    await expect(
      page.getByRole('menuitem', { name: 'Photos & videos' })
    ).toBeVisible()
    await page
      .locator('#document-upload')
      .setInputFiles(getTestAsset('typebots/theme.json'))
    await expect(page.getByText('theme.json')).toBeVisible()
    await page
      .locator('#photos-upload')
      .setInputFiles([getTestAsset('avatar.jpg'), getTestAsset('avatar.jpg')])
    await expect(page.getByRole('img', { name: 'avatar.jpg' })).toHaveCount(2)
    await page.getByRole('img', { name: 'avatar.jpg' }).first().hover()
    await page.getByLabel('Remove attachment').first().click()
    await expect(page.getByRole('img', { name: 'avatar.jpg' })).toHaveCount(1)
    await page.getByLabel('Send').click()
    await expect(
      page.getByRole('img', { name: 'Attached image 1' })
    ).toBeVisible()
    await expect(page.getByText('Help me with these')).toBeVisible()
  })
})
