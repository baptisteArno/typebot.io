import test, { expect } from '@playwright/test'
import { createTypebots, parseDefaultBlockWithStep } from '../services/database'
import cuid from 'cuid'
import { defaultSettings, defaultTextInputOptions, InputStepType } from 'models'

test('Result should be in storage by default', async ({ page }) => {
  const typebotId = cuid()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultBlockWithStep({
        type: InputStepType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])
  await page.goto(`/${typebotId}-public`)
  await page.waitForResponse(
    (resp) =>
      resp.request().url().includes(`/api/typebots/${typebotId}/results`) &&
      resp.status() === 200 &&
      resp.request().method() === 'POST'
  )
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
        ...parseDefaultBlockWithStep({
          type: InputStepType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])
    await page.goto(`/${typebotId}-public`)
    await page.waitForResponse(
      (resp) =>
        resp.request().url().includes(`/api/typebots/${typebotId}/results`) &&
        resp.status() === 200 &&
        resp.request().method() === 'POST'
    )
    await page.reload()
    await page.waitForResponse(
      (resp) =>
        resp.request().url().includes(`/api/typebots/${typebotId}/results`) &&
        resp.status() === 200 &&
        resp.request().method() === 'POST'
    )
    const resultId = await page.evaluate(() =>
      sessionStorage.getItem('resultId')
    )
    expect(resultId).toBe(null)
  })
})
