import { preventUserFromRefreshing } from 'cypress/plugins/utils'
import { getIframeBody } from 'cypress/support'

describe('Set variables', () => {
  beforeEach(() => {
    cy.task('seed')
    cy.signOut()
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.removeEventListener('beforeunload', preventUserFromRefreshing)
    })
  })

  it('options should work', () => {
    cy.loadTypebotFixtureInDatabase('typebots/logic/setVariable.json')
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot4/edit')
    cy.findByText('Type your answer...').click()
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
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .type('365{enter}')
    getIframeBody().findByText('Total: 365000').should('exist')
    getIframeBody().findByText('Custom var: Custom value')
  })
})
