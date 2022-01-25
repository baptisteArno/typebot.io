import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'

describe('General settings', () => {
  beforeEach(prepareDbAndSignIn)

  afterEach(removePreventReload)

  it('should reflect changes in real time', () => {
    cy.loadTypebotFixtureInDatabase('typebots/theme/theme.json')
    cy.visit('/typebots/typebot4/settings')
    getIframeBody()
      .findByRole('link', { name: 'Made with Typebot.' })
      .should('have.attr', 'href')
      .should('eq', 'https://www.typebot.io/?utm_source=litebadge')
    cy.findByRole('button', { name: 'General' }).click()
    cy.findByRole('checkbox', { name: 'Typebot.io branding' }).uncheck({
      force: true,
    })
    getIframeBody()
      .findByRole('link', { name: 'Made with Typebot.' })
      .should('not.exist')
  })
})
