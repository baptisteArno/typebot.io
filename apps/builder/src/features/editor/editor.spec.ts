import test, { expect } from '@playwright/test'
import { defaultTextInputOptions, InputBlockType } from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'
import {
  createTypebots,
  importTypebotInDatabase,
} from '@typebot.io/lib/playwright/databaseActions'
import {
  waitForSuccessfulDeleteRequest,
  waitForSuccessfulPostRequest,
  waitForSuccessfulPutRequest,
} from '@typebot.io/lib/playwright/testHelpers'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'
import { getTestAsset } from '@/test/utils/playwright'

test.describe.configure({ mode: 'parallel' })

test('Edges connection should work', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
    },
  ])
  await page.goto(`/typebots/${typebotId}/edit`)
  await expect(page.locator("text='Start'")).toBeVisible()
  await page.dragAndDrop('text=Button', '#editor-container', {
    targetPosition: { x: 1000, y: 400 },
  })
  await page.dragAndDrop(
    'text=Text >> nth=0',
    '[data-testid="group"] >> nth=1',
    {
      targetPosition: { x: 100, y: 50 },
    }
  )
  await page.dragAndDrop(
    '[data-testid="endpoint"]',
    '[data-testid="group"] >> nth=1',
    { targetPosition: { x: 100, y: 10 } }
  )
  await expect(page.locator('[data-testid="edge"]')).toBeVisible()
  await page.dragAndDrop(
    '[data-testid="endpoint"]',
    '[data-testid="group"] >> nth=1'
  )
  await expect(page.locator('[data-testid="edge"]')).toBeVisible()
  await page.dragAndDrop('text=Date', '#editor-container', {
    targetPosition: { x: 1000, y: 800 },
  })
  await page.dragAndDrop(
    '[data-testid="endpoint"] >> nth=2',
    '[data-testid="group"] >> nth=2',
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
test('Drag and drop blocks and items should work', async ({ page }) => {
  const typebotId = createId()
  await importTypebotInDatabase(
    getTestAsset('typebots/editor/buttonsDnd.json'),
    {
      id: typebotId,
    }
  )

  // Blocks dnd
  await page.goto(`/typebots/${typebotId}/edit`)
  await expect(page.locator('[data-testid="block"] >> nth=1')).toHaveText(
    'Hello!'
  )
  await page.dragAndDrop('text=Hello', '[data-testid="block"] >> nth=3', {
    targetPosition: { x: 100, y: 0 },
  })
  await expect(page.locator('[data-testid="block"] >> nth=2')).toHaveText(
    'Hello!'
  )
  await page.dragAndDrop('text=Hello', 'text=Group #2')
  await expect(page.locator('[data-testid="block"] >> nth=3')).toHaveText(
    'Hello!'
  )

  // Items dnd
  await expect(page.locator('[data-testid="item"] >> nth=0')).toHaveText(
    'Item 1'
  )
  await page.dragAndDrop('text=Item 1', 'text=Item 3')
  await expect(page.locator('[data-testid="item"] >> nth=2')).toHaveText(
    'Item 1'
  )
  await expect(page.locator('[data-testid="item"] >> nth=1')).toHaveText(
    'Item 3'
  )
  await page.dragAndDrop('text=Item 3', 'text=Item 2-3')
  await expect(page.locator('[data-testid="item"] >> nth=7')).toHaveText(
    'Item 3'
  )

  await expect(page.locator('[data-testid="item"] >> nth=2')).toHaveText(
    'Name=John'
  )
  await page.dragAndDrop(
    '[data-testid="item"] >> nth=2',
    '[data-testid="item"] >> nth=3'
  )
  await expect(page.locator('[data-testid="item"] >> nth=3')).toHaveText(
    'Name=John'
  )
})
test('Undo / Redo and Zoom buttons should work', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])

  await page.goto(`/typebots/${typebotId}/edit`)
  await page.click('text=Group #1', { button: 'right' })
  await page.click('text=Duplicate')
  await expect(page.locator('text="Group #1"')).toBeVisible()
  await expect(page.locator('text="Group #1 copy"')).toBeVisible()
  await page.click('text="Group #1"', { button: 'right' })
  await page.click('text=Delete')
  await expect(page.locator('text="Group #1"')).toBeHidden()
  await page.click('button[aria-label="Undo"]')
  await expect(page.locator('text="Group #1"')).toBeVisible()
  await page.click('button[aria-label="Redo"]')
  await expect(page.locator('text="Group #1"')).toBeHidden()
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(page.getByTestId('graph')).toHaveAttribute(
    'style',
    /scale\(1\.2\);$/
  )
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(page.getByTestId('graph')).toHaveAttribute(
    'style',
    /scale\(1\.4\);$/
  )
  await page.getByRole('button', { name: 'Zoom out' }).dblclick()
  await page.getByRole('button', { name: 'Zoom out' }).dblclick()
  await expect(page.getByTestId('graph')).toHaveAttribute(
    'style',
    /scale\(0\.6\);$/
  )
})

test('Rename and icon change should work', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      name: 'My awesome typebot',
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])

  await page.goto(`/typebots/${typebotId}/edit`)

  await page.click('[data-testid="editable-icon"]')
  await expect(page.locator('text="My awesome typebot"')).toBeVisible()
  await page.fill('input[placeholder="Search..."]', 'love')
  await page.click('text="😍"')
  await page.click('text="My awesome typebot"')
  await page.fill('input[value="My awesome typebot"]', 'My superb typebot')
  await page.press('input[value="My superb typebot"]', 'Enter')
  await page.click('[aria-label="Navigate back"]')
  await expect(page.locator('text="😍"')).toBeVisible()
  await expect(page.locator('text="My superb typebot"')).toBeVisible()
})

test('Preview from group should work', async ({ page }) => {
  const typebotId = createId()
  await importTypebotInDatabase(
    getTestAsset('typebots/editor/previewFromGroup.json'),
    {
      id: typebotId,
    }
  )

  await page.goto(`/typebots/${typebotId}/edit`)
  await page
    .getByTestId('group')
    .nth(1)
    .click({ position: { x: 100, y: 10 } })
  await page.click('[aria-label="Preview bot from this group"]')
  await expect(
    page.locator('typebot-standard').locator('text="Hello this is group 1"')
  ).toBeVisible()
  await page
    .getByTestId('group')
    .nth(2)
    .click({ position: { x: 100, y: 10 } })
  await page.click('[aria-label="Preview bot from this group"]')
  await expect(
    page.locator('typebot-standard').locator('text="Hello this is group 2"')
  ).toBeVisible()
  await page.click('[aria-label="Close"]')
  await page.click('text="Preview"')
  await expect(
    page.locator('typebot-standard').locator('text="Hello this is group 1"')
  ).toBeVisible()
})

test('Published typebot menu should work', async ({ page }) => {
  const typebotId = createId()
  await createTypebots([
    {
      id: typebotId,
      name: 'My awesome typebot',
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: defaultTextInputOptions,
      }),
    },
  ])
  await page.goto(`/typebots/${typebotId}/edit`)
  await expect(page.locator("text='Start'")).toBeVisible()
  await expect(page.locator('button >> text="Published"')).toBeVisible()
  await page.click('[aria-label="Show published typebot menu"]')
  await Promise.all([
    waitForSuccessfulPutRequest(page),
    page.click('text="Close typebot to new responses"'),
  ])
  await expect(page.locator('button >> text="Closed"')).toBeDisabled()
  await page.click('[aria-label="Show published typebot menu"]')
  await Promise.all([
    waitForSuccessfulPutRequest(page),
    page.click('text="Reopen typebot to new responses"'),
  ])
  await expect(page.locator('button >> text="Published"')).toBeDisabled()
  await page.click('[aria-label="Show published typebot menu"]')
  await Promise.all([
    waitForSuccessfulDeleteRequest(page),
    page.click('button >> text="Unpublish typebot"'),
  ])
  await Promise.all([
    waitForSuccessfulPostRequest(page),
    page.click('button >> text="Publish"'),
  ])
  await expect(page.locator('button >> text="Published"')).toBeVisible()
})
