import { Page } from '@playwright/test'

export const typebotViewer = (page: Page) =>
  page.frameLocator('#typebot-iframe')
