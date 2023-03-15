import test from '@playwright/test'
import { createTypebots } from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'
import {
  defaultGoogleAnalyticsOptions,
  IntegrationBlockType,
} from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'

test.describe('Google Analytics block', () => {
  test('its configuration should work', async ({ page }) => {
    const typebotId = createId()
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
