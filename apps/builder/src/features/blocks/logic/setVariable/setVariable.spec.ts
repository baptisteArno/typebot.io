import test, { expect } from '@playwright/test'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { createId } from '@paralleldrive/cuid2'
import { getTestAsset } from '@/test/utils/playwright'

test.describe.configure({ mode: 'parallel' })

test.describe('Set variable block', () => {
  test('its configuration should work', async ({ page }) => {
    const typebotId = createId()
    await importTypebotInDatabase(
      getTestAsset('typebots/logic/setVariable.json'),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Type a number...')
    await page.fill('input[placeholder="Select a variable"] >> nth=-1', 'Num')
    await page.getByRole('menuitem', { name: 'Create Num' }).click()

    await page.click('text=Click to edit... >> nth = 0')
    await page.fill('input[placeholder="Select a variable"] >> nth=-1', 'Total')
    await page.getByRole('menuitem', { name: 'Create Total' }).click()
    await page.locator('textarea').fill('1000 * {{Num}}')

    await page.click('text=Click to edit...', { force: true })
    await expect(page.getByText('Save in results?')).toBeHidden()
    await page.fill(
      'input[placeholder="Select a variable"] >> nth=-1',
      'Custom var'
    )
    await page.getByRole('menuitem', { name: 'Create Custom var' }).click()
    await expect(page.getByText('Save in results?')).toBeVisible()
    await expect(
      page.getByRole('group').nth(1).locator('.chakra-switch')
    ).not.toHaveAttribute('data-checked')
    await page.locator('textarea').fill('Custom value')

    await page.click('text=Click to edit...', { force: true })
    await page.fill(
      'input[placeholder="Select a variable"] >> nth=-1',
      'Addition'
    )
    await page.getByRole('menuitem', { name: 'Create Addition' }).click()
    await page.locator('textarea').fill('1000 + {{Total}}')

    await page.click('text=Test')
    await page
      .locator('typebot-standard')
      .locator('input[placeholder="Type a number..."]')
      .fill('365')
    await page.locator('typebot-standard').locator('text=Send').click()
    await expect(
      page.locator('typebot-standard').locator('text=Multiplication: 365000')
    ).toBeVisible()
    await expect(
      page.locator('typebot-standard').locator('text=Custom var: Custom value')
    ).toBeVisible()
    await expect(
      page.locator('typebot-standard').locator('text=Addition: 366000')
    ).toBeVisible()
  })

  test('Transcription variable setting should work in preview', async ({
    page,
  }) => {
    const typebotId = createId()
    await importTypebotInDatabase(
      getTestAsset('typebots/logic/setVariable2.json'),
      {
        id: typebotId,
      }
    )

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.getByText('Transcription =').click()
    await expect(page.getByText('Save in results?')).toBeVisible()
    await page.locator('input[type="text"]').click()
    await page.getByRole('menuitem', { name: 'Transcript' }).click()
    await expect(page.getByText('Save in results?')).toBeHidden()
    await expect(page.getByText('System.Transcript')).toBeVisible()

    await page.getByRole('button', { name: 'Test' }).click()
    await page.getByRole('button', { name: 'There is a bug 🐛' }).click()
    await page.getByTestId('textarea').fill('Hello!!')
    await page.getByLabel('Send').click()
    await page
      .locator('typebot-standard')
      .getByRole('button', { name: 'Restart' })
      .click()
    await page.getByRole('button', { name: 'I have a question 💭' }).click()
    await page.getByTestId('textarea').fill('How are you?')
    await page.getByLabel('Send').click()
    await page.getByRole('button', { name: 'Transcription' }).click()

    await expect(
      page.getByText('Assistant: "Hey friend 👋 How').first()
    ).toBeVisible()
    await expect(
      page.getByText(
        'Assistant: "https://media0.giphy.com/media/rhgwg4qBu97ISgbfni/giphy-downsized.gif?cid=fe3852a3wimy48e55djt23j44uto7gdlu8ksytylafisvr0q&rid=giphy-downsized.gif&ct=g"'
      )
    ).toBeVisible()
    await expect(page.getByText('User: "How are you?"')).toBeVisible()
  })
})
