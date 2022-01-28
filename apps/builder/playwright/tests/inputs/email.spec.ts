import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { defaultEmailInputOptions, InputStepType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'

const typebotId = 'email-input-step'

test.describe('Email input step', () => {
  test('options should work', async ({ page }) => {
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.EMAIL,
          options: defaultEmailInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator(
        `input[placeholder="${defaultEmailInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'email')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=${defaultEmailInputOptions.labels.placeholder}`)
    await page.fill('#placeholder', 'Your email...')
    await expect(page.locator('text=Your email...')).toBeVisible()
    await page.fill('#button', 'Go')

    await page.click('text=Restart')
    await expect(
      typebotViewer(page).locator(`input[placeholder="Your email..."]`)
    ).toBeVisible()
  })
})
