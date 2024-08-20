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
    await page.getByLabel('Placeholder:').fill('Your name...')
    await page.getByLabel('Button label:').fill('Go')
    await page.click('text=Long text?')

    await page.click('text=Restart')
    await expect(
      page.locator(`textarea[placeholder="Your name..."]`)
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Go' })).toBeVisible()
  })

  test('attachments should work', async ({ page }) => {
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

    await page.click(`text=${defaultTextInputOptions.labels.placeholder}`)
    await page.getByText('Allow attachments').click()
    await page.locator('[data-testid="variables-input"]').first().click()
    await page.getByText('var1').click()
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

  test('audio clips should work', async ({ page }) => {
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

    await page.click(`text=${defaultTextInputOptions.labels.placeholder}`)
    await page.getByText('Allow audio clip').click()
    await page.locator('[data-testid="variables-input"]').first().click()
    await page.getByText('var1').click()
    await page.getByRole('button', { name: 'Test' }).click()
    await page.getByRole('button', { name: 'Record voice' }).click()
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.locator('audio')).toHaveAttribute(
      'src',
      /http:\/\/localhost:9000/
    )
  })
})
