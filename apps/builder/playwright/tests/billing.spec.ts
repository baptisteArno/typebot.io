import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import { Plan } from 'db'
import {
  addSubscriptionToWorkspace,
  createResults,
  createTypebots,
  createWorkspace,
  starterWorkspaceId,
} from '../services/database'

test('should display valid usage', async ({ page }) => {
  const starterTypebotId = cuid()
  createTypebots([{ id: starterTypebotId, workspaceId: starterWorkspaceId }])
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await expect(page.locator('text="/ 10,000"')).toBeVisible()
  await expect(page.locator('text="/ 10 GB"')).toBeVisible()
  await page.click('text=Pro workspace', { force: true })

  await page.click('text=Pro workspace')
  await page.click('text="Free workspace"')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await expect(page.locator('text="/ 300"')).toBeVisible()
  await page.click('text=Free workspace', { force: true })

  await createResults({
    idPrefix: 'usage',
    count: 10,
    typebotId: starterTypebotId,
    isChronological: false,
    fakeStorage: 1100 * 1024 * 1024,
  })
  await page.click('text=Free workspace')
  await page.click('text="Starter workspace"')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await expect(page.locator('text="/ 2,000"')).toBeVisible()
  await expect(page.locator('text="/ 2 GB"')).toBeVisible()
  await expect(page.locator('text="1.07 GB"')).toBeVisible()
  await expect(page.locator('text="200"')).toBeVisible()
  await expect(page.locator('[role="progressbar"] >> nth=0')).toHaveAttribute(
    'aria-valuenow',
    '10'
  )
  await expect(page.locator('[role="progressbar"] >> nth=1')).toHaveAttribute(
    'aria-valuenow',
    '54'
  )

  await createResults({
    idPrefix: 'usage2',
    typebotId: starterTypebotId,
    isChronological: false,
    count: 900,
    fakeStorage: 1200 * 1024 * 1024,
  })
  await page.click('text="Settings"')
  await page.click('text="Billing & Usage"')
  await expect(page.locator('text="/ 2,000"')).toBeVisible()
  await expect(page.locator('text="1,100"')).toBeVisible()
  await expect(page.locator('text="/ 2 GB"')).toBeVisible()
  await expect(page.locator('text="2.25 GB"')).toBeVisible()
  await expect(page.locator('[aria-valuenow="55"]')).toBeVisible()
  await expect(page.locator('[aria-valuenow="112"]')).toBeVisible()
})

test('plan changes should work', async ({ page }) => {
  const workspaceId = await createWorkspace({ name: 'Awesome workspace' })

  // Upgrade to STARTER
  await page.goto('/typebots')
  await page.click('text=Pro workspace')
  await page.click('text=Awesome workspace')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await page.click('button >> text="2,000"')
  await page.click('button >> text="3,500"')
  await page.click('button >> text="2"')
  await page.click('button >> text="4"')
  await expect(page.locator('text="$73"')).toBeVisible()
  await page.click('button >> text=Upgrade >> nth=0')
  await page.waitForNavigation()
  expect(page.url()).toContain('https://checkout.stripe.com')
  await expect(page.locator('text=$73.00 >> nth=0')).toBeVisible()
  await expect(page.locator('text=$30.00 >> nth=0')).toBeVisible()
  await expect(page.locator('text=$4.00 >> nth=0')).toBeVisible()
  await expect(page.locator('text=user@email.com')).toBeVisible()
  await addSubscriptionToWorkspace(
    workspaceId,
    [
      {
        price: process.env.STRIPE_STARTER_PRICE_ID,
        quantity: 1,
      },
    ],
    { plan: Plan.STARTER, additionalChatsIndex: 0, additionalStorageIndex: 0 }
  )

  // Update plan with additional quotas
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await expect(page.locator('text="/ 2,000"')).toBeVisible()
  await expect(page.locator('text="/ 2 GB"')).toBeVisible()
  await expect(page.locator('button >> text="2,000"')).toBeVisible()
  await expect(page.locator('button >> text="2"')).toBeVisible()
  await page.click('button >> text="2,000"')
  await page.click('button >> text="3,500"')
  await page.click('button >> text="2"')
  await page.click('button >> text="4"')
  await expect(page.locator('text="$73"')).toBeVisible()
  await page.click('button >> text=Update')
  await expect(
    page.locator(
      'text="Workspace STARTER plan successfully updated 🎉" >> nth=0'
    )
  ).toBeVisible()
  await page.click('text="Members"')
  await page.click('text="Billing & Usage"')
  await expect(page.locator('text="$73"')).toBeVisible()
  await expect(page.locator('text="/ 3,500"')).toBeVisible()
  await expect(page.locator('text="/ 4 GB"')).toBeVisible()
  await expect(page.locator('button >> text="3,500"')).toBeVisible()
  await expect(page.locator('button >> text="4"')).toBeVisible()

  // Upgrade to PRO
  await page.click('button >> text="10,000"')
  await page.click('button >> text="14,000"')
  await page.click('button >> text="10"')
  await page.click('button >> text="12"')
  await expect(page.locator('text="$133"')).toBeVisible()
  await page.click('button >> text=Upgrade')
  await expect(
    page.locator('text="Workspace PRO plan successfully updated 🎉" >> nth=0')
  ).toBeVisible()

  // Go to customer portal
  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Billing Portal"'),
  ])
  await expect(page.locator('text="Add payment method"')).toBeVisible()

  // Cancel subscription
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await expect(page.locator('[data-testid="plan-tag"]')).toHaveText('Pro')
  await page.click('button >> text="Cancel my subscription"')
  await expect(page.locator('[data-testid="plan-tag"]')).toHaveText('Free')
})

test('should display invoices', async ({ page }) => {
  await page.goto('/typebots')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await expect(
    page.locator('text="No invoices found for this workspace."')
  ).toBeVisible()
  await page.click('text=Pro workspace', { force: true })

  await page.click('text=Pro workspace')
  await page.click('text=Starter workspace')
  await page.click('text=Settings & Members')
  await page.click('text=Billing & Usage')
  await expect(page.locator('text="Invoices"')).toBeVisible()
  await expect(page.locator('text="Wed Jun 01 2022"')).toBeVisible()
  await expect(page.locator('text="74567541-0001"')).toBeVisible()
  await expect(page.locator('text="€30.00" >> nth=0')).toBeVisible()
})
