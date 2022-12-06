import test, { expect, Page } from '@playwright/test'
import { importTypebotInDatabase } from 'utils/playwright/databaseActions'
import { typebotViewer } from 'utils/playwright/testHelpers'
import cuid from 'cuid'
import { getTestAsset } from '@/test/utils/playwright'

test.describe.parallel('Google sheets integration', () => {
  test('Insert row should work', async ({ page }) => {
    const typebotId = cuid()
    await importTypebotInDatabase(
      getTestAsset('typebots/integrations/googleSheets.json'),
      {
        id: typebotId,
      }
    )
    await page.goto(`/typebots/${typebotId}/edit`)
    await fillInSpreadsheetInfo(page)
    await page.click('text=Select an operation')
    await page.click('text=Insert a row')

    await page.click('text=Add a value')
    await page.click('text=Select a column')
    await page.click('button >> text="Email"')
    await page.click('[aria-label="Insert a variable"]')
    await page.click('button >> text="Email" >> nth=1')

    await page.click('text=Add a value')
    await page.click('text=Select a column')
    await page.click('text=First name')
    await page.fill(
      'input[placeholder="Type a value..."] >> nth = 1',
      'Georges'
    )

    await page.click('text=Preview')
    await typebotViewer(page)
      .locator('input[placeholder="Type your email..."]')
      .fill('georges@gmail.com')
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp
            .request()
            .url()
            .includes(
              '/api/integrations/google-sheets/spreadsheets/1k_pIDw3YHl9tlZusbBVSBRY0PeRPd2H6t4Nj7rwnOtM/sheets/0'
            ) &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      typebotViewer(page)
        .locator('input[placeholder="Type your email..."]')
        .press('Enter'),
    ])
  })

  test('Update row should work', async ({ page }) => {
    const typebotId = cuid()
    await importTypebotInDatabase(
      getTestAsset('typebots/integrations/googleSheets.json'),
      {
        id: typebotId,
      }
    )
    await page.goto(`/typebots/${typebotId}/edit`)
    await fillInSpreadsheetInfo(page)
    await page.click('text=Select an operation')
    await page.click('text=Update a row')

    await page.click('text=Add a value')
    await page.click('text=Select a column')
    await page.click('button >> text="Email"')
    await page.click('[aria-label="Insert a variable"]')
    await page.click('button >> text="Email" >> nth=1')

    await page.click('text=Add a value')
    await page.click('text=Select a column')
    await page.click('text=Last name')
    await page.fill(
      'input[placeholder="Type a value..."] >> nth = 1',
      'Last name'
    )

    await page.click('text=Preview')
    await typebotViewer(page)
      .locator('input[placeholder="Type your email..."]')
      .fill('test@test.com')
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp
            .request()
            .url()
            .includes(
              '/api/integrations/google-sheets/spreadsheets/1k_pIDw3YHl9tlZusbBVSBRY0PeRPd2H6t4Nj7rwnOtM/sheets/0'
            ) &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      typebotViewer(page)
        .locator('input[placeholder="Type your email..."]')
        .press('Enter'),
    ])
  })

  test('Get row should work', async ({ page }) => {
    const typebotId = cuid()
    await importTypebotInDatabase(
      getTestAsset('typebots/integrations/googleSheetsGet.json'),
      {
        id: typebotId,
      }
    )
    await page.goto(`/typebots/${typebotId}/edit`)
    await fillInSpreadsheetInfo(page)
    await page.click('text=Select an operation')
    await page.click('text=Get data from sheet')

    await page.click('text=Select a column')
    await page.click('button >> text="Email"')
    await page.getByRole('button', { name: 'Select an operator' }).click()
    await page.getByRole('menuitem', { name: 'Equal to' }).click()
    await page.click('[aria-label="Insert a variable"]')
    await page.click('button >> text="Email" >> nth=1')

    await page.getByRole('button', { name: 'Add filter rule' }).click()
    await page.getByRole('button', { name: 'AND', exact: true }).click()
    await page.getByRole('menuitem', { name: 'OR' }).click()

    await page.click('text=Select a column')
    await page.getByRole('menuitem', { name: 'Email' }).click()
    await page.getByRole('button', { name: 'Select an operator' }).click()
    await page.getByRole('menuitem', { name: 'Equal to' }).click()
    await page.getByPlaceholder('Type a value...').nth(-1).fill('test@test.com')

    await page.click('text=Select a column')
    await page.click('text="First name"')
    await createNewVar(page, 'First name')

    await page.click('text=Add a value')
    await page.click('text=Select a column')
    await page.click('text="Last name"')
    await createNewVar(page, 'Last name')

    await page.click('text=Preview')
    await typebotViewer(page)
      .locator('input[placeholder="Type your email..."]')
      .fill('test2@test.com')
    await typebotViewer(page)
      .locator('input[placeholder="Type your email..."]')
      .press('Enter')
    await expect(typebotViewer(page).locator('text=Your name is:')).toHaveText(
      /John|Fred|Georges/
    )
  })
})

const fillInSpreadsheetInfo = async (page: Page) => {
  await page.click('text=Configure...')
  await page.click('text=Select an account')
  await page.click('text=pro-user@email.com')

  await page.fill('input[placeholder="Search for spreadsheet"]', 'CR')
  await page.click('text=CRM')

  await page.fill('input[placeholder="Select the sheet"]', 'Sh')
  await page.click('text=Sheet1')
}

const createNewVar = async (page: Page, name: string) => {
  await page.fill('input[placeholder="Select a variable"] >> nth=-1', name)
  await page.click(`text=Create "${name}"`)
}
