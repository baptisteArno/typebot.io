import test, { expect } from '@playwright/test'
import { createSnipers } from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'
import { proWorkspaceId } from '@sniper.io/playwright/databaseSetup'
import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'

const audioSampleUrl =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

test('should work as expected', async ({ page }) => {
  const sniperId = createId()
  await createSnipers([
    {
      id: sniperId,
      ...parseDefaultGroupWithBlock({
        type: BubbleBlockType.AUDIO,
      }),
    },
  ])

  await page.goto(`/snipers/${sniperId}/edit`)
  await page.getByText('Click to edit...').click()
  await page
    .getByPlaceholder('Paste the audio file link...')
    .fill(audioSampleUrl)
  await expect(page.locator('audio')).toHaveAttribute('src', audioSampleUrl)
  await page.getByRole('button', { name: 'Upload' }).click()
  await page.setInputFiles('input[type="file"]', getTestAsset('sample.mp3'))
  await expect(page.locator('audio')).toHaveAttribute(
    'src',
    RegExp(
      `/public/workspaces/${proWorkspaceId}/snipers/${sniperId}/blocks`,
      'gm'
    )
  )
  await page.getByRole('button', { name: 'Test', exact: true }).click()
  await expect(page.locator('audio')).toHaveAttribute(
    'src',
    RegExp(
      `/public/workspaces/${proWorkspaceId}/snipers/${sniperId}/blocks`,
      'gm'
    )
  )
})
