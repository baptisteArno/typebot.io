import { Page } from '@playwright/test'

export const deleteButtonInConfirmDialog = (page: Page) =>
  page.locator('section[role="alertdialog"] button:has-text("Delete")')

export const typebotViewer = (page: Page) =>
  page.frameLocator('#typebot-iframe')
