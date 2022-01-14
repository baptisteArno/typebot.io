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
    cy.findByTestId('step-number-step').click()
    createNewVar('Num')
    cy.findByTestId('step-set-var-1').click()
    createNewVar('Total')
    cy.findByRole('textbox', { name: 'Value / Expression:' }).type(
      '1000 * {{Num}}',
      { parseSpecialCharSequences: false }
    )
    cy.findByTestId('step-set-var-2').click()
    createNewVar('Custom var')
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

const createNewVar = (name: string) => {
  cy.findByTestId('variables-input').type(name)
  cy.findByRole('menuitem', { name: `Create "${name}"` }).click()
}
