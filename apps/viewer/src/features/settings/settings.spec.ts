import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  defaultSettings,
  defaultTextInputOptions,
  InputBlockType,
  Metadata,
} from 'models'
import { createTypebots, updateTypebot } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { typebotViewer } from 'utils/playwright/testHelpers'

test('Result should be in storage by default', async ({ page }) => {
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
  await Promise.all([
    page.goto(`/${typebotId}-public`),
    page.waitForResponse(
      (resp) =>
        resp.request().url().includes(`/api/typebots/${typebotId}/results`) &&
        resp.status() === 200 &&
        resp.request().method() === 'POST'
    ),
  ])
  await page.reload()
  const resultId = await page.evaluate(() => sessionStorage.getItem('resultId'))
  expect(resultId).toBeDefined()
})

test.describe('Create result on page refresh enabled', () => {
  test('should work', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        settings: {
          ...defaultSettings,
          general: {
            ...defaultSettings.general,
            isNewResultOnRefreshEnabled: true,
          },
        },
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])
    await Promise.all([
      page.goto(`/${typebotId}-public`),
      page.waitForResponse(
        (resp) =>
          resp.request().url().includes(`/api/typebots/${typebotId}/results`) &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
    ])
    await Promise.all([
      page.reload(),
      page.waitForResponse(
        (resp) =>
          resp.request().url().includes(`/api/typebots/${typebotId}/results`) &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
    ])
    const resultId = await page.evaluate(() =>
      sessionStorage.getItem('resultId')
    )
    expect(resultId).toBe(null)
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
  const googleTagManagerId = 'GTM-M72NXKB'
  const customMetadata: Metadata = {
    description: 'My custom description',
    title: 'Custom title',
    favIconUrl: 'https://www.baptistearno.com/favicon.png',
    imageUrl: 'https://www.baptistearno.com/images/site-preview.png',
    customHeadCode: '<meta name="author" content="John Doe">',
    googleTagManagerId,
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
    typebotViewer(page).locator(
      `input[placeholder="${defaultTextInputOptions.labels.placeholder}"]`
    )
  ).toBeVisible()
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
  expect(
    await page.evaluate(
      () =>
        (document.querySelector('meta[name="author"]') as HTMLMetaElement)
          .content
    )
  ).toBe('John Doe')
  expect(
    await page.evaluate(
      (googleTagManagerId) =>
        document.querySelector(
          `iframe[src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}"]`
        ) as HTMLMetaElement
    )
  ).toBeDefined()
})
