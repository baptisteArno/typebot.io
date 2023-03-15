import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'
import { BubbleBlockType, defaultAudioBubbleContent } from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

const audioSampleUrl =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

test('should work as expected', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: BubbleBlockType.AUDIO,
        content: defaultAudioBubbleContent,
      }),
    },
  ])

  await page.goto(`/typebots/${typebotId}/edit`)
  await page.getByText('Click to edit...').click()
  await page
    .getByPlaceholder('Paste the audio file link...')
    .fill(audioSampleUrl)
  await expect(page.locator('audio')).toHaveAttribute('src', audioSampleUrl)
  await page.getByRole('button', { name: 'Upload' }).click()
  await page.setInputFiles('input[type="file"]', getTestAsset('sample.mp3'))
  await expect(page.locator('audio')).toHaveAttribute(
    'src',
    RegExp(`/public/typebots/${typebotId}/blocks`, 'gm')
  )
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(page.locator('audio')).toHaveAttribute(
    'src',
    RegExp(`/public/typebots/${typebotId}/blocks`, 'gm')
  )
})
