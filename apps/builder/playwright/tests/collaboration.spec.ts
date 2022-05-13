import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { CollaborationType, Plan, WorkspaceRole } from 'db'
import prisma from 'libs/prisma'
import { InputStepType, defaultTextInputOptions } from 'models'
import {
  createResults,
  createTypebots,
  parseDefaultBlockWithStep,
} from '../services/database'

test.describe('Typebot owner', () => {
  test('Can invite collaborators', async ({ page }) => {
    const typebotId = cuid()
    const guestWorkspaceId = cuid()
    await prisma.workspace.create({
      data: {
        id: guestWorkspaceId,
        name: 'Guest Workspace',
        plan: Plan.FREE,
        members: {
          createMany: {
            data: [{ role: WorkspaceRole.ADMIN, userId: 'proUser' }],
          },
        },
      },
    })
    await createTypebots([
      {
        id: typebotId,
        name: 'Guest typebot',
        workspaceId: guestWorkspaceId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])
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
      'free-user@email.com'
    )
    await page.click('text=Can edit')
    await page.click('text=Can view')
    await page.click('text=Invite')
    await expect(page.locator('text=Free user')).toBeVisible()
    await page.click('text="guest@email.com"')
    await page.click('text="Remove"')
    await expect(page.locator('text="guest@email.com"')).toBeHidden()
  })
})

test.describe('Collaborator', () => {
  test('should display shared typebots', async ({ page }) => {
    const typebotId = cuid()
    const guestWorkspaceId = cuid()
    await prisma.workspace.create({
      data: {
        id: guestWorkspaceId,
        name: 'Guest Workspace #2',
        plan: Plan.FREE,
        members: {
          createMany: {
            data: [{ role: WorkspaceRole.GUEST, userId: 'proUser' }],
          },
        },
      },
    })
    await createTypebots([
      {
        id: typebotId,
        name: 'Guest typebot',
        workspaceId: guestWorkspaceId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])
    await prisma.collaboratorsOnTypebots.create({
      data: {
        typebotId,
        userId: 'proUser',
        type: CollaborationType.READ,
      },
    })
    await createResults({ typebotId })
    await page.goto(`/typebots`)
    await page.click("text=Pro user's workspace")
    await page.click('text=Guest workspace #2')
    await page.click('text=Guest typebot')
    await page.click('button[aria-label="Show collaboration menu"]')
    await page.click('text=Everyone at Guest workspace')
    await expect(page.locator('text="Remove"')).toBeHidden()
    await expect(page.locator('text=Pro user')).toBeVisible()
    await page.click('text=Block #1', { force: true })
    await expect(page.locator('input[value="Block #1"]')).toBeHidden()
    await page.goto(`/typebots/${typebotId}/results`)
    await expect(page.locator('text="content199"')).toBeVisible()
  })
})
