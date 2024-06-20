import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import {
  createSnipers,
  importSniperInDatabase,
} from '@sniper.io/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@sniper.io/playwright/databaseHelpers'
import { getTestAsset } from '@/test/utils/playwright'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'

test.describe.configure({ mode: 'parallel' })

test('Edges connection should work', async ({ page }) => {
  const sniperId = createId()
  await createSnipers([
    {
      id: sniperId,
    },
  ])
  await page.goto(`/snipers/${sniperId}/edit`)
  await expect(page.locator("text='Start'")).toBeVisible()
  await page.dragAndDrop('text=Button', '#editor-container', {
    targetPosition: { x: 1000, y: 400 },
  })
  await page.dragAndDrop(
    'text=Text >> nth=0',
    '[data-testid="group"] >> nth=0',
    {
      targetPosition: { x: 100, y: 50 },
    }
  )
  await page.dragAndDrop(
    '[data-testid="endpoint"]',
    '[data-testid="group"] >> nth=0',
    { targetPosition: { x: 100, y: 10 } }
  )
  await expect(page.locator('[data-testid="edge"]')).toBeVisible()
  await page.dragAndDrop(
    '[data-testid="endpoint"]',
    '[data-testid="group"] >> nth=0'
  )
  await expect(page.locator('[data-testid="edge"]')).toBeVisible()
  await page.dragAndDrop('text=Date', '#editor-container', {
    targetPosition: { x: 1000, y: 800 },
  })
  await page.dragAndDrop(
    '[data-testid="endpoint"] >> nth=2',
    '[data-testid="group"] >> nth=1',
    {
      targetPosition: { x: 100, y: 10 },
    }
  )
  await expect(page.locator('[data-testid="edge"] >> nth=0')).toBeVisible()
  await expect(page.locator('[data-testid="edge"] >> nth=1')).toBeVisible()

  await page.click('[data-testid="clickable-edge"] >> nth=0', {
    force: true,
    button: 'right',
  })
  await page.click('text=Delete')
  const total = await page.locator('[data-testid="edge"]').count()
  expect(total).toBe(1)
})

test('Rename and icon change should work', async ({ page }) => {
  const sniperId = createId()
  await createSnipers([
    {
      id: sniperId,
      name: 'My awesome sniper',
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])

  await page.goto(`/snipers/${sniperId}/edit`)
  await page.click('[data-testid="editable-icon"]')
  await page.getByRole('button', { name: 'Emoji' }).click()
  await expect(page.locator('text="My awesome sniper"')).toBeVisible()
  await page.fill('input[placeholder="Search..."]', 'love')
  await page.click('text="😍"')
  await page.click('text="My awesome sniper"')
  await page.fill('input[value="My awesome sniper"]', 'My superb sniper')
  await page.press('input[value="My superb sniper"]', 'Enter')
  await page.click('[aria-label="Navigate back"]')
  await expect(page.locator('text="😍"')).toBeVisible()
  await expect(page.locator('text="My superb sniper"')).toBeVisible()
})

test('Preview from group should work', async ({ page }) => {
  const sniperId = createId()
  await importSniperInDatabase(
    getTestAsset('snipers/editor/previewFromGroup.json'),
    {
      id: sniperId,
    }
  )

  await page.goto(`/snipers/${sniperId}/edit`)
  await page
    .getByTestId('group')
    .nth(0)
    .click({ position: { x: 100, y: 10 } })
  await page.click('[aria-label="Preview bot from this group"]')
  await expect(
    page.locator('sniper-standard').locator('text="Hello this is group 1"')
  ).toBeVisible()
  await page
    .getByTestId('group')
    .nth(1)
    .click({ position: { x: 100, y: 10 } })
  await page.click('[aria-label="Preview bot from this group"]')
  await expect(
    page.locator('sniper-standard').locator('text="Hello this is group 2"')
  ).toBeVisible()
  await page.click('[aria-label="Close"]')
  await page.click('text="Test"')
  await expect(
    page.locator('sniper-standard').locator('text="Hello this is group 1"')
  ).toBeVisible()
})

test('Published sniper menu should work', async ({ page }) => {
  const sniperId = createId()
  await createSnipers([
    {
      id: sniperId,
      name: 'My awesome sniper',
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
      version: '6',
    },
  ])
  await page.goto(`/snipers/${sniperId}/edit`)
  await expect(page.locator("text='Start'")).toBeVisible()
  await expect(page.locator('button >> text="Published"')).toBeVisible()
  await page.click('[aria-label="Show published sniper menu"]')
  await page.click('text="Close sniper to new responses"')
  await expect(page.locator('button >> text="Closed"')).toBeDisabled()
  await page.click('[aria-label="Show published sniper menu"]')
  await page.click('text="Reopen sniper to new responses"')
  await expect(page.locator('button >> text="Published"')).toBeDisabled()
  await page.click('[aria-label="Show published sniper menu"]')
  await page.click('button >> text="Unpublish sniper"')
  await page.click('button >> text="Publish"')
  await expect(page.locator('button >> text="Published"')).toBeVisible()
})
