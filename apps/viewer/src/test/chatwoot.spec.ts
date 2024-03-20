import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'

const typebotId = createId()

const chatwootTestWebsiteToken = 'tueXiiqEmrWUCZ4NUyoR7nhE'

test('should work as expected', async ({ page }) => {
  await createTypebots([
    {
      id: typebotId,
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
  await page.goto(`/${typebotId}-public`)
  await page.getByRole('button', { name: 'Go' }).click()
  await expect(page.locator('#chatwoot_live_chat_widget')).toBeVisible()
})
