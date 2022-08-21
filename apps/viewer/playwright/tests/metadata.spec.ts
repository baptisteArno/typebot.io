import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultGroupWithBlock,
} from '../services/database'
import {
  defaultSettings,
  defaultTextInputOptions,
  InputBlockType,
  Metadata,
} from 'models'
import { typebotViewer } from '../services/selectorUtils'
import cuid from 'cuid'
import { mockSessionApiCalls } from 'playwright/services/browser'

test.beforeEach(({ page }) => mockSessionApiCalls(page))

test('Should correctly parse metadata', async ({ page }) => {
  const typebotId = cuid()
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
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
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
  await expect(
    typebotViewer(page).locator(
      `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
    )
  ).toBeVisible()
})
