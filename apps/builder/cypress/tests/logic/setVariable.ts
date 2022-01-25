import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'

describe('Set variables', () => {
  beforeEach(prepareDbAndSignIn)

  afterEach(removePreventReload)

  it.only('options should work', () => {
    cy.loadTypebotFixtureInDatabase('typebots/logic/setVariable.json')
    cy.visit('/typebots/typebot4/edit')
    cy.findByText('Type a number...').click()
    cy.createVariable('Num')
    cy.findAllByText('Click to edit...').first().click()
    cy.createVariable('Total')
    cy.findByRole('textbox', { name: 'Value / Expression:' }).type(
      '1000 * {{Num}}',
      { parseSpecialCharSequences: false }
    )
    cy.findAllByText('Click to edit...').last().click()
    cy.createVariable('Custom var')
    cy.findByRole('textbox', { name: 'Value / Expression:' }).type(
      'Custom value'
    )
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody().findByPlaceholderText('Type a number...').type('365{enter}')
    getIframeBody().findByText('Total: 365000').should('exist')
    getIframeBody().findByText('Custom var: Custom value')
  })
})
