import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { createTypebots } from '@typebot.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/playwright/databaseHelpers'
import { starterWorkspaceId } from '@typebot.io/playwright/databaseSetup'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'

test('should be able to connect custom domain', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])
  await page.goto(`/typebots/${typebotId}/share`)
  await page.click('text=Add my domain')
  await page.click('text=Connect new')
  await page.fill('input[placeholder="bot.my-domain.com"]', 'test')
  await expect(page.locator('text=Save')).toBeDisabled()
  await page.fill('input[placeholder="bot.my-domain.com"]', 'yolozeeer.com')
  await expect(page.locator('text="A"')).toBeVisible()
  await page.fill('input[placeholder="bot.my-domain.com"]', 'sub.yolozeeer.com')
  await expect(page.locator('text="CNAME"')).toBeVisible()
  await page.click('text=Save')
  await expect(page.locator('text="https://sub.yolozeeer.com/"')).toBeVisible()
  await page.click('text="Edit"')
  await page.fill('text=https://sub.yolozeeer.com/Copy >> input', 'custom-path')
  await page.press(
    'text=https://sub.yolozeeer.com/custom-path >> input',
    'Enter'
  )
  await expect(page.locator('text="custom-path"')).toBeVisible()
  await page.click('[aria-label="Remove custom URL"]')
  await expect(page.locator('text=sub.yolozeeer.com')).toBeHidden()
  await page.click('button >> text=Add my domain')
  await page.click('[aria-label="Remove domain"]')
  await expect(page.locator('[aria-label="Remove domain"]')).toBeHidden({
    timeout: 10000,
  })
})

test.describe('Starter workspace', () => {
  test("Add my domain shouldn't be available", async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        workspaceId: starterWorkspaceId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
    ])
    await page.goto(`/typebots/${typebotId}/share`)
    await expect(
      page.locator('[data-testid="pro-lock-tag"]').nth(0)
    ).toBeVisible()
    await page.click('text=Add my domain')
    await expect(
      page.locator(
        'text="You need to upgrade your plan in order to add custom domains"'
      )
    ).toBeVisible()
  })
})
