import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { CollaborationType, Plan, WorkspaceRole } from '@sniper.io/prisma'
import prisma from '@sniper.io/lib/prisma'
import {
  createSnipers,
  injectFakeResults,
} from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { userId } from '@sniper.io/playwright/databaseSetup'
import { createFolder } from '@/test/utils/databaseActions'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'

test.describe('Sniper owner', () => {
  test('Can invite collaborators', async ({ page }) => {
    const sniperId = createId()
    const guestWorkspaceId = createId()
    await prisma.workspace.create({
      data: {
        id: guestWorkspaceId,
        name: 'Guest Workspace',
        plan: Plan.FREE,
        members: {
          createMany: {
            data: [{ role: WorkspaceRole.ADMIN, userId }],
          },
        },
      },
    })
    await createSnipers([
      {
        id: sniperId,
        name: 'Guest sniper',
        workspaceId: guestWorkspaceId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
    ])
    await page.goto(`/snipers/${sniperId}/edit`)
    await page.click('button[aria-label="Open share popover"]')
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
      'other-user@email.com'
    )
    await page.click('text=Can edit')
    await page.click('text=Can view')
    await page.click('text=Invite')
    await expect(page.locator('text=James Doe')).toBeVisible()
    await page.click('text="guest@email.com"')
    await page.click('text="Remove"')
    await expect(page.locator('text="guest@email.com"')).toBeHidden()
  })
})

test.describe('Guest with read access', () => {
  test('should have shared snipers displayed', async ({ page }) => {
    const sniperId = createId()
    const guestWorkspaceId = createId()
    await prisma.workspace.create({
      data: {
        id: guestWorkspaceId,
        name: 'Guest Workspace #2',
        plan: Plan.FREE,
        members: {
          createMany: {
            data: [{ role: WorkspaceRole.GUEST, userId }],
          },
        },
      },
    })
    await createSnipers([
      {
        id: sniperId,
        name: 'Guest sniper',
        workspaceId: guestWorkspaceId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
      {
        name: 'Another sniper',
        workspaceId: guestWorkspaceId,
      },
    ])
    await prisma.collaboratorsOnSnipers.create({
      data: {
        sniperId,
        userId,
        type: CollaborationType.READ,
      },
    })
    await createFolder(guestWorkspaceId, 'Guest folder')
    await injectFakeResults({ sniperId, count: 10 })
    await page.goto(`/snipers`)
    await page.click('text=Pro workspace')
    await page.click('text=Guest workspace #2')
    await expect(page.locator('text=Guest sniper')).toBeVisible()
    await expect(page.locator('text=Another sniper')).toBeHidden()
    await expect(page.locator('text=Guest folder')).toBeHidden()
    await page.click('text=Guest sniper')
    await page.click('button[aria-label="Open share popover"]')
    await page.click('text=Everyone at Guest workspace')
    await expect(page.locator('text="Remove"')).toBeHidden()
    await expect(page.locator('text=John Doe')).toBeVisible()
    await page.click('text=Group #1', { force: true })
    await expect(page.locator('input[value="Group #1"]')).toBeHidden()
    await page.goto(`/snipers/${sniperId}/results`)
    await expect(page.locator('text="See logs" >> nth=9')).toBeVisible()
  })
})

test.describe('Guest with write access', () => {
  test('should have shared snipers displayed', async ({ page }) => {
    const sniperId = createId()
    const guestWorkspaceId = createId()
    await prisma.workspace.create({
      data: {
        id: guestWorkspaceId,
        name: 'Guest Workspace #3',
        plan: Plan.FREE,
        members: {
          createMany: {
            data: [{ role: WorkspaceRole.GUEST, userId }],
          },
        },
      },
    })
    await createSnipers([
      {
        id: sniperId,
        name: 'Guest sniper',
        workspaceId: guestWorkspaceId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
      {
        name: 'Another sniper',
        workspaceId: guestWorkspaceId,
      },
    ])
    await prisma.collaboratorsOnSnipers.create({
      data: {
        sniperId,
        userId,
        type: CollaborationType.WRITE,
      },
    })
    await createFolder(guestWorkspaceId, 'Guest folder')
    await page.goto(`/snipers`)
    await page.click('text=Pro workspace')
    await page.click('text=Guest workspace #3')
    await expect(page.locator('text=Guest sniper')).toBeVisible()
    await expect(page.locator('text=Another sniper')).toBeHidden()
    await expect(page.locator('text=Guest folder')).toBeHidden()
    await page.click('text=Guest sniper')
    await page.click('button[aria-label="Open share popover"]')
    await page.click('text=Everyone at Guest workspace')
    await expect(page.locator('text="Remove"')).toBeHidden()
    await expect(page.locator('text=John Doe')).toBeVisible()
    await page.click('text=Group #1', { force: true })
    await expect(page.getByText('Group #1')).toBeVisible()
  })
})

test.describe('Guest on public sniper', () => {
  test('should have shared snipers displayed', async ({ page }) => {
    const sniperId = createId()
    const guestWorkspaceId = createId()
    await prisma.workspace.create({
      data: {
        id: guestWorkspaceId,
        name: 'Guest Workspace #4',
        plan: Plan.FREE,
      },
    })
    await createSnipers([
      {
        id: sniperId,
        name: 'Guest sniper',
        workspaceId: guestWorkspaceId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
        settings: {
          publicShare: { isEnabled: true },
        },
      },
    ])
    await page.goto(`/snipers/${sniperId}/edit`)
    await expect(page.getByText('Guest sniper')).toBeVisible()
    await expect(page.getByText('Duplicate')).toBeVisible()
    await expect(page.getByText('Group #1')).toBeVisible()
  })
})
