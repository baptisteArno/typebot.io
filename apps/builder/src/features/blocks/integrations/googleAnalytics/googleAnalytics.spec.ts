import test from '@playwright/test'
import { createSnipers } from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { createId } from '@paralleldrive/cuid2'
import { IntegrationBlockType } from '@sniper.io/schemas/features/blocks/integrations/constants'

test.describe('Google Analytics block', () => {
  test('its configuration should work', async ({ page }) => {
    const sniperId = createId()
    await createSnipers([
      {
        id: sniperId,
        ...parseDefaultGroupWithBlock({
          type: IntegrationBlockType.GOOGLE_ANALYTICS,
        }),
      },
    ])

    await page.goto(`/snipers/${sniperId}/edit`)
    await page.click('text=Configure...')
    await page.fill('input[placeholder="G-123456..."]', 'G-VWX9WG1TNS')
    await page.fill('input[placeholder="Example: conversion"]', 'conversion')
    await page.click('text=Advanced')
    await page.fill('input[placeholder="Example: Sniper"]', 'Sniper')
    await page.fill('input[placeholder="Example: Campaign Z"]', 'Campaign Z')
    await page.fill('input[placeholder="Example: 0"]', '0')
  })
})
