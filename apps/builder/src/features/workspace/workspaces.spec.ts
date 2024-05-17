import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import {
  proWorkspaceId,
  starterWorkspaceId,
} from '@typebot.io/playwright/databaseSetup'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { mockSessionResponsesToOtherUser } from '@typebot.io/playwright/testHelpers'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'

const proTypebotId = createId()
const starterTypebotId = createId()

test.beforeAll(async () => {
  await createTypebots([
    {
      id: proTypebotId,
      name: 'Pro typebot',
      workspaceId: proWorkspaceId,
    },
  ])
  await createTypebots([
    {
      id: starterTypebotId,
      name: 'Starter typebot',
      workspaceId: starterWorkspaceId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: {
          labels: {
            placeholder: 'Hey there',
          },
        },
      }),
    },
  ])
})

test('can switch between workspaces and access typebot', async ({ page }) => {
  await page.goto('/typebots')
  await expect(page.locator('text="Pro typebot"')).toBeVisible({
    timeout: 20000,
  })
  await page.click('text=Pro workspace')
  await page.click('text="Starter workspace"')
  await expect(page.locator('text="Pro typebot"')).toBeHidden()
  await page.click('text="Starter typebot"')
  await expect(page.locator('text="Hey there"')).toBeVisible()
})

test('can create and delete a new workspace', async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text=Pro workspace')
  await expect(page.locator('text="Pro workspace" >> nth=1')).toBeHidden()
  await page.click('text=New workspace')
  await expect(page.locator('text="Pro typebot"')).toBeHidden()
  await page.click("text=John Doe's workspace")
  await expect(page.locator('text="Pro workspace"')).toBeVisible()
  await page.click('text=Settings & Members')
  await page.click('text="Settings"')
  await page.click('text="Delete workspace"')
  await expect(
    page.locator(
      "text=Are you sure you want to delete John Doe's workspace workspace?"
    )
  ).toBeVisible()
  await page.click('text="Delete"')
  await expect(page.locator('text="John Doe\'s workspace"')).toBeHidden()
})

test('can update workspace info', async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text="Settings"')
  await page.click('[data-testid="editable-icon"]')
  await page.getByRole('button', { name: 'Emoji' }).click()
  await page.fill('input[placeholder="Search..."]', 'building')
  await page.click('text="🏦"')
  await page.waitForTimeout(500)
  await page.fill('input[value="Pro workspace"]', 'My awesome workspace')
  await page.getByTestId('typebot-logo').click({ force: true })
  await expect(
    page.getByRole('button', { name: 'My awesome workspace Pro' })
  ).toBeVisible()
})

test('can manage members', async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text="Members"')
  await expect(
    page.getByRole('heading', { name: 'Members (1/5)' })
  ).toBeVisible()
  await expect(page.locator('text="user@email.com"').nth(1)).toBeVisible()
  await expect(page.locator('button >> text="Invite"')).toBeDisabled()
  await page.fill(
    'input[placeholder="colleague@company.com"]',
    'guest@email.com'
  )
  await page.click('button >> text="Invite"')
  await expect(page.locator('button >> text="Invite"')).toBeVisible()
  await expect(
    page.locator('input[placeholder="colleague@company.com"]')
  ).toHaveAttribute('value', '')
  await expect(page.locator('text="guest@email.com"')).toBeVisible()
  await expect(page.locator('text="Pending"')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Members (2/5)' })
  ).toBeVisible()
  await page.fill(
    'input[placeholder="colleague@company.com"]',
    'other-user@email.com'
  )
  await page.click('text="Member" >> nth=0')
  await page.click('text="Admin"')
  await page.click('button >> text="Invite"')
  await expect(
    page.locator('input[placeholder="colleague@company.com"]')
  ).toHaveAttribute('value', '')
  await expect(page.locator('text="other-user@email.com"')).toBeVisible()
  await expect(page.locator('text="James Doe"')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Members (3/5)' })
  ).toBeVisible()

  await page.click('text="other-user@email.com"')
  await page.click('button >> text="Member"')
  await expect(page.locator('[data-testid="tag"] >> text="Admin"')).toHaveCount(
    1
  )
  await page.click('text="other-user@email.com"')

  await page.click('text="guest@email.com"')
  await page.click('text="Admin" >> nth=-1')
  await expect(page.locator('[data-testid="tag"] >> text="Admin"')).toHaveCount(
    2
  )
  await page.click('text="guest@email.com"')
  await page.click('button >> text="Remove"')
  await expect(page.locator('text="guest@email.com"')).toBeHidden()

  await mockSessionResponsesToOtherUser(page)
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await expect(page.locator('text="Settings"')).toBeHidden()
  await page.click('text="Members"')
  await expect(page.locator('text="other-user@email.com"')).toBeVisible()
  await expect(
    page.locator('input[placeholder="colleague@company.com"]')
  ).toBeHidden()
  await page.click('text="other-user@email.com"')
  await expect(page.locator('button >> text="Remove"')).toBeHidden()
})

test("can't add new members when limit is reached", async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text="My awesome workspace"')
  await page.click('text="Free workspace"')
  await page.click('text=Settings & Members')
  await page.click('text="Members"')
  await expect(page.locator('button >> text="Invite"')).toBeDisabled()
  await expect(
    page.locator(
      'text="Upgrade your plan to work with more team members, and unlock awesome power features"'
    )
  ).toBeVisible()
  await page.click('text="Free workspace"', { force: true })
  await page.click('text="Free workspace"')
  await page.click('text="Starter workspace"')
  await page.click('text=Settings & Members')
  await page.click('text="Members"')
  await page.fill(
    'input[placeholder="colleague@company.com"]',
    'guest@email.com'
  )
  await page.click('button >> text="Invite"')
  await expect(
    page.locator(
      'text="Upgrade your plan to work with more team members, and unlock awesome power features"'
    )
  ).toBeVisible()
  await expect(page.locator('button >> text="Invite"')).toBeDisabled()
})
