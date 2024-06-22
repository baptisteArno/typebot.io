import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { createSnipers } from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { IntegrationBlockType } from '@sniper.io/schemas/features/blocks/integrations/constants'

const sniperId = createId()

const chatwootTestWebsiteToken = 'tueXiiqEmrWUCZ4NUyoR7nhE'

test('should work as expected', async ({ page }) => {
  await createSnipers([
    {
      id: sniperId,
      ...parseDefaultGroupWithBlock(
        {
          type: IntegrationBlockType.CHATWOOT,
          options: {
            websiteToken: chatwootTestWebsiteToken,
          },
        },
        { withGoButton: true }
      ),
    },
  ])
  await page.goto(`/${sniperId}-public`)
  await page.getByRole('button', { name: 'Go' }).click()
  await expect(page.locator('#chatwoot_live_chat_widget')).toBeVisible()
})
