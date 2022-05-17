import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { defaultTextInputOptions, InputStepType } from 'models'
import {
  createTypebots,
  parseDefaultBlockWithStep,
  sharedWorkspaceId,
} from '../services/database'

const proTypebotId = cuid()
const freeTypebotId = cuid()

test.beforeAll(async () => {
  await createTypebots([{ id: proTypebotId, name: 'Pro typebot' }])
  await createTypebots([
    {
      id: freeTypebotId,
      name: 'Shared typebot',
      workspaceId: sharedWorkspaceId,
      ...parseDefaultBlockWithStep({
        type: InputStepType.TEXT,
        options: {
          ...defaultTextInputOptions,
          labels: {
            ...defaultTextInputOptions.labels,
            placeholder: 'Hey there',
          },
        },
      }),
    },
  ])
})

test('can switch between workspaces and access typebot', async ({ page }) => {
  await page.goto('/typebots')
  await expect(page.locator('text="Pro typebot"')).toBeVisible()
  await page.click("text=Pro user's workspace")
  await page.click('text=Shared workspace')
  await expect(page.locator('text="Pro typebot"')).toBeHidden()
  await page.click('text="Shared typebot"')
  await expect(page.locator('text="Hey there"')).toBeVisible()
})

test('can create and delete a new workspace', async ({ page }) => {
  await page.goto('/typebots')
  await page.click("text=Pro user's workspace")
  await expect(
    page.locator('text="Pro user\'s workspace" >> nth=1')
  ).toBeHidden()
  await page.click('text=New workspace')
  await expect(page.locator('text="Pro typebot"')).toBeHidden()
  await page.click("text=Pro user's workspace")
  await expect(
    page.locator('text="Pro user\'s workspace" >> nth=1')
  ).toBeVisible()
  await page.click('text=Settings & Members')
  await page.click('text="Settings"')
  await page.click('text="Delete workspace"')
  await expect(
    page.locator(
      "text=Are you sure you want to delete Pro user's workspace workspace?"
    )
  ).toBeVisible()
  await page.click('text="Delete"')
  await expect(page.locator('text=Pro typebot')).toBeVisible()
  await page.click("text=Pro user's workspace")
  await expect(
    page.locator('text="Pro user\'s workspace" >> nth=1')
  ).toBeHidden()
})

test('can update workspace info', async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text="Settings"')
  await page.click('[data-testid="editable-icon"]')
  await page.fill('input[placeholder="Search..."]', 'building')
  await page.click('text="🏦"')
  await page.fill(
    'input[value="Pro user\'s workspace"]',
    'My awesome workspace'
  )
})

test('can manage members', async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text="Members"')
  await expect(page.locator('text="pro-user@email.com"')).toBeVisible()
  await expect(page.locator('button >> text="Invite"')).toBeEnabled()
  await page.fill(
    'input[placeholder="colleague@company.com"]',
    'guest@email.com'
  )
  await page.click('button >> text="Invite"')
  await expect(page.locator('button >> text="Invite"')).toBeEnabled()
  await expect(
    page.locator('input[placeholder="colleague@company.com"]')
  ).toHaveAttribute('value', '')
  await expect(page.locator('text="guest@email.com"')).toBeVisible()
  await expect(page.locator('text="Pending"')).toBeVisible()
  await page.fill(
    'input[placeholder="colleague@company.com"]',
    'free-user@email.com'
  )
  await page.click('text="Member" >> nth=0')
  await page.click('text="Admin"')
  await page.click('button >> text="Invite"')
  await expect(
    page.locator('input[placeholder="colleague@company.com"]')
  ).toHaveAttribute('value', '')
  await expect(page.locator('text="free-user@email.com"')).toBeVisible()
  await expect(page.locator('text="Free user"')).toBeVisible()

  // Downgrade admin to member
  await page.click('text="free-user@email.com"')
  await page.click('button >> text="Member"')
  await expect(page.locator('[data-testid="tag"] >> text="Admin"')).toHaveCount(
    1
  )
  await page.click('text="free-user@email.com"')
  await page.click('button >> text="Remove"')
  await expect(page.locator('text="free-user@email.com"')).toBeHidden()

  await page.click('text="guest@email.com"')
  await page.click('text="Admin" >> nth=-1')
  await expect(page.locator('[data-testid="tag"] >> text="Admin"')).toHaveCount(
    2
  )
  await page.click('text="guest@email.com"')
  await page.click('button >> text="Remove"')
  await expect(page.locator('text="guest@email.com"')).toBeHidden()
})

test("can't edit workspace as a member", async ({ page }) => {
  await page.goto('/typebots')
  await page.click("text=Pro user's workspace")
  await page.click('text=Shared workspace')
  await page.click('text=Settings & Members')
  await expect(page.locator('text="Settings"')).toBeHidden()
  await page.click('text="Members"')
  await expect(page.locator('text="free-user@email.com"')).toBeVisible()
  await expect(
    page.locator('input[placeholder="colleague@company.com"]')
  ).toBeHidden()
  await page.click('text="free-user@email.com"')
  await expect(page.locator('button >> text="Remove"')).toBeHidden()
})
