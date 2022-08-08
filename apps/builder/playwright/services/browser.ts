import { Page } from '@playwright/test'

export const refreshUser = async () => {
  await fetch('/api/auth/session?update')
  const event = new Event('visibilitychange')
  document.dispatchEvent(event)
}

export const mockSessionApiCalls = (page: Page) =>
  page.route('/api/auth/session', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        body: '{"user":{"id":"proUser","name":"Pro user","email":"pro-user@email.com","emailVerified":null,"image":"https://avatars.githubusercontent.com/u/16015833?v=4","stripeId":null,"graphNavigation": "TRACKPAD"}}',
      })
    }
    return route.continue()
  })
