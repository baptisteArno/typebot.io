import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import {
  defaultSettings,
  defaultTextInputOptions,
  InputBlockType,
} from 'models'
import { createTypebots, updateTypebot } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'

test('Result should be in storage by default', async ({ page }) => {
  const typebotId = cuid()
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
    const typebotId = cuid()
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
  const typebotId = cuid()
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
  const typebotId = cuid()
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
