import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { defaultPhoneInputOptions, InputStepType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'

const typebotId = 'phone-input-step'

test.describe('Phone input step', () => {
  test('options should work', async ({ page }) => {
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.PHONE,
          options: defaultPhoneInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator(
        `input[placeholder="${defaultPhoneInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'tel')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=${defaultPhoneInputOptions.labels.placeholder}`)
    await page.fill('#placeholder', '+33 XX XX XX XX')
    await page.fill('#button', 'Go')

    await page.click('text=Restart')
    await typebotViewer(page)
      .locator(`input[placeholder="+33 XX XX XX XX"]`)
      .fill('+33 6 73 18 45 36')
    await expect(typebotViewer(page).locator(`img`)).toHaveAttribute(
      'alt',
      'France'
    )
    await typebotViewer(page).locator('text="Go"').click()
    await expect(typebotViewer(page).locator('text=+33673184536')).toBeVisible()
  })
})
