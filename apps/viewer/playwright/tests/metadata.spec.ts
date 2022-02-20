import test, { expect } from '@playwright/test'
import { createTypebots, parseDefaultBlockWithStep } from '../services/database'
import { generate } from 'short-uuid'
import {
  defaultSettings,
  defaultTextInputOptions,
  InputStepType,
  Metadata,
} from 'models'

test('Should correctly parse metadata', async ({ page }) => {
  const typebotId = generate()
  const customMetadata: Metadata = {
    description: 'My custom description',
    title: 'Custom title',
    favIconUrl: 'https://www.baptistearno.com/favicon.png',
    imageUrl: 'https://www.baptistearno.com/images/site-preview.png',
  }
  await createTypebots([
    {
      id: typebotId,
      settings: {
        ...defaultSettings,
        metadata: customMetadata,
      },
      ...parseDefaultBlockWithStep({
        type: InputStepType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])
  await page.goto(`/${typebotId}-public`)
  await expect(
    await page.evaluate(`document.querySelector('title').textContent`)
  ).toBe(customMetadata.title)
  await expect(
    await page.evaluate(
      () => (document.querySelector('meta[name="description"]') as any).content
    )
  ).toBe(customMetadata.description)
  await expect(
    await page.evaluate(
      () => (document.querySelector('meta[property="og:image"]') as any).content
    )
  ).toBe(customMetadata.imageUrl)
  await expect(
    await page.evaluate(() =>
      (document.querySelector('link[rel="icon"]') as any).getAttribute('href')
    )
  ).toBe(customMetadata.favIconUrl)
})
