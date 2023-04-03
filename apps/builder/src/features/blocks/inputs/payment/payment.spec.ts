import test, { expect } from '@playwright/test'
import { createTypebots } from '@typebot.io/lib/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from '@typebot.io/lib/playwright/databaseHelpers'
import { defaultPaymentInputOptions, InputBlockType } from '@typebot.io/schemas'
import { createId } from '@paralleldrive/cuid2'
import { stripePaymentForm } from '@/test/utils/selectorUtils'

test.describe('Payment input block', () => {
  test('Can configure Stripe account', async ({ page }) => {
    const typebotId = createId()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.PAYMENT,
          options: defaultPaymentInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)
    await page.click('text=Configure...')
    await page.getByRole('button', { name: 'Select an account' }).click()
    await page.click('text=Connect new')
    await page.fill('[placeholder="Typebot"]', 'My Stripe Account')
    await page.fill(
      '[placeholder="sk_test_..."]',
      process.env.STRIPE_SECRET_KEY ?? ''
    )
    await page.fill(
      '[placeholder="sk_live_..."]',
      process.env.STRIPE_SECRET_KEY ?? ''
    )
    await page.fill(
      '[placeholder="pk_test_..."]',
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? ''
    )
    await page.fill(
      '[placeholder="pk_live_..."]',
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? ''
    )
    await expect(page.locator('button >> text="Connect"')).toBeEnabled()
    await page.click('button >> text="Connect"')
    await expect(page.locator('text="Secret test key:"')).toBeHidden()
    await expect(page.locator('text="My Stripe Account"')).toBeVisible()
    await page.fill('[placeholder="30.00"] >> nth=-1', '30.00')
    await page.selectOption('select', 'EUR')
    await page.click('text=Additional information')
    await page.fill('[placeholder="John Smith"]', 'Baptiste')
    await page.fill('[placeholder="john@gmail.com"]', 'baptiste@typebot.io')
    await expect(page.locator('text="Phone number:"')).toBeVisible()

    await page.click('text=Preview')
    await stripePaymentForm(page)
      .locator(`[placeholder="1234 1234 1234 1234"]`)
      .fill('4000000000000002')
    await stripePaymentForm(page)
      .locator(`[placeholder="MM / YY"]`)
      .fill('12 / 25')
    await stripePaymentForm(page).locator(`[placeholder="CVC"]`).fill('240')
    await page.locator(`text="Pay 30€"`).click()
    await expect(
      page.locator(`text="Your card has been declined."`)
    ).toBeVisible()
    await stripePaymentForm(page)
      .locator(`[placeholder="1234 1234 1234 1234"]`)
      .fill('4242424242424242')
    const zipInput = stripePaymentForm(page).getByPlaceholder('90210')
    const isZipInputVisible = await zipInput.isVisible()
    if (isZipInputVisible) await zipInput.fill('12345')
    await page.locator(`text="Pay 30€"`).click()
    await expect(page.locator(`text="Success"`)).toBeVisible()
  })
})
