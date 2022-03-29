import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { InputStepType, defaultTextInputOptions } from 'models'
import path from 'path'
import {
  createResults,
  createTypebots,
  parseDefaultBlockWithStep,
} from '../services/database'

const typebotId = cuid()

test.beforeAll(async () => {
  await createTypebots([
    {
      id: typebotId,
      name: 'Shared typebot',
      ownerId: 'freeUser',
      ...parseDefaultBlockWithStep({
        type: InputStepType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])
  await createResults({ typebotId })
})

test.describe('Typebot owner', () => {
  test.use({
    storageState: path.join(__dirname, '../freeUser.json'),
  })
  test('Can invite collaborators', async ({ page }) => {
    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('button[aria-label="Show collaboration menu"]')
    await expect(page.locator('text=Free user')).toBeHidden()
    await page.fill(
      'input[placeholder="colleague@company.com"]',
      'guest@email.com'
    )
    await page.click('text=Can view')
    await page.click('text=Can edit')
    await page.click('text=Invite')
    await expect(page.locator('text=Pending')).toBeVisible()
    await expect(page.locator('text=Free user')).toBeHidden()
    await page.fill(
      'input[placeholder="colleague@company.com"]',
      'pro-user@email.com'
    )
    await page.click('text=Can edit')
    await page.click('text=Can view')
    await page.click('text=Invite')
    await expect(page.locator('text=Free user')).toBeVisible()
    await expect(page.locator('text=Pro user')).toBeVisible()
    await page.click('text="guest@email.com"')
    await page.click('text="Remove"')
    await expect(page.locator('text="guest@email.com"')).toBeHidden()
  })
})

test.describe('Collaborator', () => {
  test('should display shared typebots', async ({ page }) => {
    await page.goto('/typebots')
    await expect(page.locator('text=Shared')).toBeVisible()
    await page.click('text=Shared')
    await page.waitForNavigation()
    expect(page.url()).toMatch('/typebots/shared')
    await expect(page.locator('text="Shared typebot"')).toBeVisible()
    await page.click('text=Shared typebot')
    await page.click('button[aria-label="Show collaboration menu"]')
    await page.click('text=Pro user')
    await expect(page.locator('text="Remove"')).toBeHidden()
    await expect(page.locator('text=Free user')).toBeVisible()
    await page.click('text=Block #1', { force: true })
    await expect(page.locator('input[value="Block #1"]')).toBeHidden()
    await page.goto(`/typebots/${typebotId}/results`)
    await expect(page.locator('text="content199"')).toBeVisible()
  })
})
