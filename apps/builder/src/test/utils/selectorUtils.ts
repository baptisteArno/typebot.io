import { Page } from '@playwright/test'

export const deleteButtonInConfirmDialog = (page: Page) =>
  page.locator('section[role="alertdialog"] button:has-text("Delete")')

export const stripePaymentForm = (page: Page) =>
  page.frameLocator('[title="Secure payment input frame"]')
