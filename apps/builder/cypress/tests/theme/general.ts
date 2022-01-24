import { getIframeBody } from 'cypress/support'

describe('General theme settings', () => {
  beforeEach(() => {
    cy.task('seed')
    cy.signOut()
  })

  it('should reflect changes in real time', () => {
    cy.loadTypebotFixtureInDatabase('typebots/theme/theme.json')
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot4/theme')
    cy.findByRole('button', { name: 'General' }).click()

    // Font
    cy.findByDisplayValue('Open Sans').clear().type('Roboto')
    cy.findByRole('menuitem', { name: 'Roboto Slab' }).click()
    getIframeBody()
      .findByTestId('container')
      .should('have.css', 'font-family')
      .should('eq', '"Roboto Slab"')

    // BG color
    getIframeBody()
      .findByTestId('container')
      .should('have.css', 'background-color')
      .should('eq', 'rgba(0, 0, 0, 0)')
    cy.findByDisplayValue('Color').check({ force: true })
    cy.findByRole('button', { name: 'Pick a color' }).click()
    cy.findByRole('textbox', { name: 'Color value' }).clear().type('#2a9d8f')
    getIframeBody()
      .findByTestId('container')
      .should('have.css', 'background-color')
      .should('eq', 'rgb(42, 157, 143)')
  })
})
