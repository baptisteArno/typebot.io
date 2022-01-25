import { prepareDbAndSignIn, removePreventReload } from 'cypress/support'

describe('Typing emulation', () => {
  beforeEach(prepareDbAndSignIn)

  afterEach(removePreventReload)

  it('should reflect changes in real time', () => {
    cy.loadTypebotFixtureInDatabase('typebots/theme/theme.json')
    cy.visit('/typebots/typebot4/settings')
    cy.findByRole('button', { name: 'Typing emulation' }).click()
    cy.findByTestId('speed').clear().type('350')
    cy.findByTestId('max-delay').clear().type('1.5')
    cy.findByRole('checkbox', { name: 'Typing emulation' }).uncheck({
      force: true,
    })
    cy.findByTestId('speed').should('not.exist')
    cy.findByTestId('max-delay').should('not.exist')
  })
})
