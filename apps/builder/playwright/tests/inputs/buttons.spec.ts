import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { defaultChoiceInputOptions, InputStepType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'

const typebotId = 'buttons-input-step'

test.describe.parallel('Buttons input step', () => {
  test('can edit button items', async ({ page }) => {
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.CHOICE,
          options: { ...defaultChoiceInputOptions, itemIds: ['choice1'] },
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.fill('input[value="Click to edit"]', 'Item 1')
    await page.press('input[value="Item 1"]', 'Enter')
    await page.locator('text=Item 1').hover()
    await page.click('[aria-label="Add item"]')
    await page.fill('input[value="Click to edit"]', 'Item 2')
    await page.press('input[value="Item 2"]', 'Enter')
    await page.locator('text=Item 2').hover()
    await page.click('[aria-label="Add item"]')
    await page.fill('input[value="Click to edit"]', 'Item 3')
    await page.press('input[value="Item 3"]', 'Enter')
    await page.click('text=Item 2', { button: 'right' })
    await page.click('text=Delete')
    await expect(page.locator('text=Item 2')).toBeHidden()

    await page.click('text=Preview')
    const item3Button = typebotViewer(page).locator('button >> text=Item 3')
    await item3Button.click()
    await expect(item3Button).toBeHidden()
    await expect(typebotViewer(page).locator('text=Item 3')).toBeVisible()
    await page.click('button[aria-label="Close"]')

    await page.click('[data-testid="step1-icon"]')
    await page.click('text=Multiple choice?')
    await page.fill('#button', 'Go')
    await page.click('[data-testid="step1-icon"]')

    await page.locator('text=Item 1').hover()
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
