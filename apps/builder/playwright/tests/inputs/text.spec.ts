import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { defaultTextInputOptions, InputStepType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import cuid from 'cuid'

test.describe.parallel('Text input step', () => {
  test('options should work', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator(
        `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'text')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=${defaultTextInputOptions.labels.placeholder}`)
    await page.fill('#placeholder', 'Your name...')
    await page.fill('#button', 'Go')
    await page.click('text=Long text?')

    await page.click('text=Restart')
    await expect(
      typebotViewer(page).locator(`textarea[placeholder="Your name..."]`)
    ).toBeVisible()
    await expect(typebotViewer(page).locator(`text=Go`)).toBeVisible()
  })

  test('variable in URL should prefill the input', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.TEXT,
          options: { ...defaultTextInputOptions, variableId: 'var1' },
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit?var1=My prefilled answer`)
    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator(
        `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('value', 'My prefilled answer')
    await expect(typebotViewer(page).locator(`button`)).toBeEnabled()
  })
})
