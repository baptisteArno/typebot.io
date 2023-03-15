import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  defaultSettings,
  defaultTextInputOptions,
  InputBlockType,
  Metadata,
} from '@typebot.io/schemas'
import {
  createTypebots,
  updateTypebot,
} from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'

test('Result should be overwritten on page refresh', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      settings: {
        ...defaultSettings,
        general: {
          ...defaultSettings.general,
          isNewResultOnRefreshEnabled: false,
        },
      },
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])

  const [, response] = await Promise.all([
    page.goto(`/${typebotId}-public`),
    page.waitForResponse(/sendMessage/),
  ])
  const { resultId } = await response.json()
  expect(resultId).toBeDefined()
  await expect(page.getByRole('textbox')).toBeVisible()

  const [, secondResponse] = await Promise.all([
    page.reload(),
    page.waitForResponse(/sendMessage/),
  ])
  const { resultId: secondResultId } = await secondResponse.json()
  expect(secondResultId).toBe(resultId)
})

test.describe('Create result on page refresh enabled', () => {
  test('should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])
    const [, response] = await Promise.all([
      page.goto(`/${typebotId}-public`),
      page.waitForResponse(/sendMessage/),
    ])
    const { resultId } = await response.json()
    expect(resultId).toBeDefined()

    await expect(page.getByRole('textbox')).toBeVisible()
    const [, secondResponse] = await Promise.all([
      page.reload(),
      page.waitForResponse(/sendMessage/),
    ])
    const { resultId: secondResultId } = await secondResponse.json()
    expect(secondResultId).not.toBe(resultId)
  })
})

test('Hide query params', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])
  await page.goto(`/${typebotId}-public?Name=John`)
  await page.waitForTimeout(1000)
  expect(page.url()).toEqual(`http://localhost:3001/${typebotId}-public`)
  await updateTypebot({
    id: typebotId,
    settings: {
      ...defaultSettings,
      general: { ...defaultSettings.general, isHideQueryParamsEnabled: false },
    },
  })
  await page.goto(`/${typebotId}-public?Name=John`)
  await page.waitForTimeout(1000)
  expect(page.url()).toEqual(
    `http://localhost:3001/${typebotId}-public?Name=John`
  )
})

test('Show close message', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
      isClosed: true,
    },
  ])
  await page.goto(`/${typebotId}-public`)
  await expect(page.locator('text=This bot is now closed')).toBeVisible()
})

test('Should correctly parse metadata', async ({ page }) => {
  const typebotId = createId()
  const customMetadata: Metadata = {
    description: 'My custom description',
    title: 'Custom title',
    favIconUrl: 'https://www.baptistearno.com/favicon.png',
    imageUrl: 'https://www.baptistearno.com/images/site-preview.png',
    customHeadCode: '<meta name="author" content="John Doe">',
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
  expect(
    await page.evaluate(`document.querySelector('title').textContent`)
  ).toBe(customMetadata.title)
  expect(
    await page.evaluate(
      () =>
        (document.querySelector('meta[name="description"]') as HTMLMetaElement)
          .content
    )
  ).toBe(customMetadata.description)
  expect(
    await page.evaluate(
      () =>
        (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)
          .content
    )
  ).toBe(customMetadata.imageUrl)
  expect(
    await page.evaluate(() =>
      (
        document.querySelector('link[rel="icon"]') as HTMLLinkElement
      ).getAttribute('href')
    )
  ).toBe(customMetadata.favIconUrl)
  await expect(
    page.locator(
      `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
    )
  ).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        (document.querySelector('meta[name="author"]') as HTMLMetaElement)
          .content
    )
  ).toBe('John Doe')
})
