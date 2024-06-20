import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  createSnipers,
  updateSniper,
} from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { Settings } from '@sniper.io/schemas'
import { defaultTextInputOptions } from '@sniper.io/schemas/features/blocks/inputs/text/constants'

test('Result should be overwritten on page refresh', async ({ page }) => {
  const sniperId = createId()
  await createSnipers([
    {
      id: sniperId,
      settings: {
        general: {
          rememberUser: {
            isEnabled: true,
            storage: 'session',
          },
        },
      },
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])

  const [, response] = await Promise.all([
    page.goto(`/${sniperId}-public`),
    page.waitForResponse(/startChat/),
  ])
  const { resultId } = await response.json()
  expect(resultId).toBeDefined()
  await expect(page.getByRole('textbox')).toBeVisible()

  const [, secondResponse] = await Promise.all([
    page.reload(),
    page.waitForResponse(/startChat/),
  ])
  const { resultId: secondResultId } = await secondResponse.json()
  expect(secondResultId).toBe(resultId)
})

test.describe('Create result on page refresh enabled', () => {
  test('should work', async ({ page }) => {
    const sniperId = createId()
    await createSnipers([
      {
        id: sniperId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
    ])
    const [, response] = await Promise.all([
      page.goto(`/${sniperId}-public`),
      page.waitForResponse(/startChat/),
    ])
    const { resultId } = await response.json()
    expect(resultId).toBeDefined()

    await expect(page.getByRole('textbox')).toBeVisible()
    const [, secondResponse] = await Promise.all([
      page.reload(),
      page.waitForResponse(/startChat/),
    ])
    const { resultId: secondResultId } = await secondResponse.json()
    expect(secondResultId).not.toBe(resultId)
  })
})

test('Hide query params', async ({ page }) => {
  const sniperId = createId()
  await createSnipers([
    {
      id: sniperId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])
  await page.goto(`/${sniperId}-public?Name=John`)
  await page.waitForTimeout(1000)
  expect(page.url()).toEqual(`http://localhost:3001/${sniperId}-public`)
  await updateSniper({
    id: sniperId,
    settings: {
      general: { isHideQueryParamsEnabled: false },
    },
  })
  await page.goto(`/${sniperId}-public?Name=John`)
  await page.waitForTimeout(1000)
  expect(page.url()).toEqual(
    `http://localhost:3001/${sniperId}-public?Name=John`
  )
})

test('Show close message', async ({ page }) => {
  const sniperId = createId()
  await createSnipers([
    {
      id: sniperId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
      isClosed: true,
    },
  ])
  await page.goto(`/${sniperId}-public`)
  await expect(page.locator('text=This bot is now closed')).toBeVisible()
})

test('Should correctly parse metadata', async ({ page }) => {
  const sniperId = createId()
  const customMetadata: Settings['metadata'] = {
    description: 'My custom description',
    title: 'Custom title',
    favIconUrl: 'https://www.baptistearno.com/favicon.png',
    imageUrl: 'https://www.baptistearno.com/images/site-preview.png',
    customHeadCode: '<meta name="author" content="John Doe">',
  }
  await createSnipers([
    {
      id: sniperId,
      settings: {
        metadata: customMetadata,
      },
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])
  await page.goto(`/${sniperId}-public`)
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
