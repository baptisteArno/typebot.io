import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'

describe('Custom CSS settings', () => {
  beforeEach(prepareDbAndSignIn)

  afterEach(removePreventReload)

  it('should reflect changes in real time', () => {
    cy.loadTypebotFixtureInDatabase('typebots/theme/theme.json')
    cy.visit('/typebots/typebot4/theme')
    cy.findByRole('button', { name: 'Custom CSS' }).click()

    cy.findByTestId('code-editor').type(
      '.typebot-button {background-color: green}',
      {
        parseSpecialCharSequences: false,
      }
    )
    getIframeBody()
      .findByTestId('button')
      .should('have.css', 'background-color')
      .should('eq', 'rgb(0, 128, 0)')
  })
})
