import test, { expect } from '@playwright/test'
import {
  createTypebots,
  importTypebotInDatabase,
} from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { defaultChoiceInputOptions, InputBlockType, ItemType } from 'models'
import cuid from 'cuid'
import { typebotViewer } from 'utils/playwright/testHelpers'
import { getTestAsset } from '@/test/utils/playwright'

test.describe.parallel('Buttons input block', () => {
  test('can edit button items', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.CHOICE,
          items: [
            {
              id: 'choice1',
              blockId: 'block1',
              type: ItemType.BUTTON,
            },
          ],
          options: { ...defaultChoiceInputOptions },
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.fill('input[value="Click to edit"]', 'Item 1')
    await page.press('input[value="Item 1"]', 'Enter')
    await page.fill('input[value="Click to edit"]', 'Item 2')
    await page.press('input[value="Item 2"]', 'Enter')
    await page.fill('input[value="Click to edit"]', 'Item 3')
    await page.press('input[value="Item 3"]', 'Enter')
    await page.press('input[value="Click to edit"]', 'Escape')
    await page.click('text=Item 2', { button: 'right' })
    await page.click('text=Delete')
    await expect(page.locator('text=Item 2')).toBeHidden()

    await page.click('text=Preview')
    const item3Button = typebotViewer(page).locator('button >> text=Item 3')
    await item3Button.click()
    await expect(item3Button).toBeHidden()
    await expect(typebotViewer(page).locator('text=Item 3')).toBeVisible()
    await page.click('button[aria-label="Close"]')

    await page.click('[data-testid="block2-icon"]')
    await page.click('text=Multiple choice?')
    await page.fill('#button', 'Go')
    await page.getByPlaceholder('Select a variable').click()
    await page.getByText('var1').click()
    await expect(page.getByText('Collectsvar1')).toBeVisible()
    await page.click('[data-testid="block2-icon"]')

    await page.locator('text=Item 1').hover()
    await page.waitForTimeout(1000)
    await page.click('[aria-label="Add item"]')
    await page.fill('input[value="Click to edit"]', 'Item 2')
    await page.press('input[value="Item 2"]', 'Enter')

    await page.click('text=Preview')

    await typebotViewer(page).locator('button >> text="Item 3"').click()
    await typebotViewer(page).locator('button >> text="Item 1"').click()
    await typebotViewer(page).locator('text=Go').click()

    await expect(
      typebotViewer(page).locator('text="Item 3, Item 1"')
    ).toBeVisible()
  })
})

test('Variable buttons should work', async ({ page }) => {
  const typebotId = cuid()
  await importTypebotInDatabase(
    getTestAsset('typebots/inputs/variableButton.json'),
    {
      id: typebotId,
    }
  )

  await page.goto(`/typebots/${typebotId}/edit`)
  await page.click('text=Preview')
  await typebotViewer(page).locator('text=Variable item').click()
  await expect(typebotViewer(page).locator('text=Variable item')).toBeVisible()
  await expect(typebotViewer(page).locator('text=Ok great!')).toBeVisible()
  await page.click('text="Item 1"')
  await page.fill('input[value="Item 1"]', '{{Item 2}}')
  await page.click('[data-testid="block1-icon"]')
  await page.click('text=Multiple choice?')
  await page.click('text="Restart"')
  await typebotViewer(page).locator('text="Variable item" >> nth=0').click()
  await typebotViewer(page).locator('text="Variable item" >> nth=1').click()
  await typebotViewer(page).locator('text="Send"').click()
  await expect(
    typebotViewer(page).locator('text="Variable item, Variable item"')
  ).toBeVisible()
})
