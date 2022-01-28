import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { defaultUrlInputOptions, InputStepType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'

const typebotId = 'url-input-step'

test.describe('Url input step', () => {
  test('options should work', async ({ page }) => {
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.URL,
          options: defaultUrlInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator(
        `input[placeholder="${defaultUrlInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'url')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=${defaultUrlInputOptions.labels.placeholder}`)
    await page.fill('#placeholder', 'Your URL...')
    await expect(page.locator('text=Your URL...')).toBeVisible()
    await page.fill('#button', 'Go')

    await page.click('text=Restart')
    await expect(
      typebotViewer(page).locator(`input[placeholder="Your URL..."]`)
    ).toBeVisible()
  })
})
