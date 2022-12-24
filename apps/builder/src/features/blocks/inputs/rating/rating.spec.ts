import test, { expect } from '@playwright/test'
import { createTypebots } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { defaultRatingInputOptions, InputBlockType } from 'models'
import { typebotViewer } from 'utils/playwright/testHelpers'
import cuid from 'cuid'

const boxSvg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>`

test('options should work', async ({ page }) => {
  const typebotId = cuid()
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.RATING,
        options: defaultRatingInputOptions,
      }),
    },
  ])

  await page.goto(`/typebots/${typebotId}/edit`)

  await page.click('text=Preview')
  await expect(typebotViewer(page).locator(`text=Send`)).toBeHidden()
  await typebotViewer(page).locator(`text=8`).click()
  await typebotViewer(page).locator(`text=Send`).click()
  await expect(typebotViewer(page).locator(`text=8`)).toBeVisible()
  await page.click('text=Rate from 0 to 10')
  await page.click('text="10"')
  await page.click('text="5"')
  await page.getByText('One click submit').click()
  await page.click('text=Numbers')
  await page.click('text=Icons')
  await page.click('text="Custom icon?"')
  await page.fill('[placeholder="<svg>...</svg>"]', boxSvg)
  await page.fill('[placeholder="Not likely at all"]', 'Not likely at all')
  await page.fill('[placeholder="Extremely likely"]', 'Extremely likely')
  await page.click('text="Restart"')
  await expect(typebotViewer(page).locator(`text=8`)).toBeHidden()
  await expect(typebotViewer(page).locator(`text=4`)).toBeHidden()
  await expect(
    typebotViewer(page).locator(`text=Not likely at all`)
  ).toBeVisible()
  await expect(
    typebotViewer(page).locator(`text=Extremely likely`)
  ).toBeVisible()
  await typebotViewer(page).locator(`svg >> nth=4`).click()
  await expect(typebotViewer(page).locator(`text=5`)).toBeVisible()
})
