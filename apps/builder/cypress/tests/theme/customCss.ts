import { getIframeBody } from 'cypress/support'

describe('Custom CSS settings', () => {
  beforeEach(() => {
    cy.task('seed')
    cy.signOut()
  })

  it('should reflect changes in real time', () => {
    cy.loadTypebotFixtureInDatabase('typebots/theme/theme.json')
    cy.signIn('test2@gmail.com')
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
