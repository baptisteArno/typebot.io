describe('SignIn page', () => {
  beforeEach(() => {
    cy.signOut()
  })

  it('can continue with Google', () => {
    cy.visit('/signin')
    const username = Cypress.env('GOOGLE_USER')
    const password = Cypress.env('GOOGLE_PW')
    const loginUrl = Cypress.env('SITE_NAME')
    const cookieName = Cypress.env('COOKIE_NAME')
    exectueSocialLogin(
      'GoogleSocialLogin',
      username,
      password,
      loginUrl,
      cookieName
    )
  })

  it('can continue with GitHub', () => {
    cy.visit('/signin')
    const username = Cypress.env('GITHUB_USER')
    const password = Cypress.env('GITHUB_PW')
    const loginUrl = Cypress.env('SITE_NAME')
    const cookieName = Cypress.env('COOKIE_NAME')
    exectueSocialLogin(
      'GitHubSocialLogin',
      username,
      password,
      loginUrl,
      cookieName
    )
  })

  it('can continue with Facebook', () => {
    cy.visit('/signin')
    const username = Cypress.env('FACEBOOK_USER')
    const password = Cypress.env('FACEBOOK_PW')
    const loginUrl = Cypress.env('SITE_NAME')
    const cookieName = Cypress.env('COOKIE_NAME')
    exectueSocialLogin(
      'FacebookSocialLogin',
      username,
      password,
      loginUrl,
      cookieName,
      [
        'button[data-testid="cookie-policy-dialog-manage-button"]',
        'button[data-testid="cookie-policy-manage-dialog-accept-button"]',
      ]
    )
  })

  // We don't test email sign in because disabling email sending is not straightforward
})

const exectueSocialLogin = (
  task: 'FacebookSocialLogin' | 'GoogleSocialLogin' | 'GitHubSocialLogin',
  username: string,
  password: string,
  loginUrl: string,
  cookieName: string,
  trackingConsentSelectors?: string[]
) => {
  const selectorId =
    task === 'FacebookSocialLogin'
      ? 'facebook'
      : task === 'GoogleSocialLogin'
      ? 'google'
      : 'github'
  const socialLoginOptions = {
    username,
    password,
    loginUrl,
    headless: true,
    logs: true,
    isPopup: false,
    loginSelector: `[data-testid="${selectorId}"]`,
    postLoginSelector: `[data-testid="authenticated"]`,
    trackingConsentSelectors,
  }

  cy.task(task, socialLoginOptions).then(({ cookies }: any) => {
    const cookie = cookies
      .filter((cookie: any) => cookie.name === cookieName)
      .pop()
    if (cookie) {
      cy.setCookie(cookie.name, cookie.value, {
        domain: cookie.domain,
        expiry: cookie.expires,
        httpOnly: cookie.httpOnly,
        path: cookie.path,
        secure: cookie.secure,
      })

      Cypress.Cookies.defaults({
        preserve: cookieName,
      })
    }
    cy.visit('/typebots')
    cy.findByRole('button', { name: 'Create a folder' }).should('exist')
  })
}
