import test from '@playwright/test'
import {
  createTypebots,
  parseDefaultGroupWithBlock,
} from '../../services/database'
import { defaultGoogleAnalyticsOptions, IntegrationBlockType } from 'models'
import cuid from 'cuid'
import { mockSessionApiCalls } from 'playwright/services/browser'

test.beforeEach(({ page }) => mockSessionApiCalls(page))

test.describe('Google Analytics block', () => {
  test('its configuration should work', async ({ page }) => {
    const typebotId = cuid()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: IntegrationBlockType.GOOGLE_ANALYTICS,
          options: defaultGoogleAnalyticsOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.fill('input[placeholder="G-123456..."]', 'G-VWX9WG1TNS')
    await page.fill('input[placeholder="Example: Typebot"]', 'Typebot')
    await page.fill(
      'input[placeholder="Example: Submit email"]',
      'Submit email'
    )
    await page.click('text=Advanced')
    await page.fill('input[placeholder="Example: Campaign Z"]', 'Campaign Z')
    await page.fill('input[placeholder="Example: 0"]', '0')
  })
})
