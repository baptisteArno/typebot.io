import { Page } from '@playwright/test'

export const mockSessionResponsesToOtherUser = async (page: Page) =>
  page.route('/api/auth/session', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        body: '{"user":{"id":"otherUserId","name":"James Doe","email":"other-user@email.com","emailVerified":null,"image":"https://avatars.githubusercontent.com/u/16015833?v=4","stripeId":null,"graphNavigation": "TRACKPAD"}}',
      })
    }
    return route.continue()
  })
