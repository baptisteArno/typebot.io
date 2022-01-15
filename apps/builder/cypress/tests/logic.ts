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

describe('Condition step', () => {
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
    cy.loadTypebotFixtureInDatabase('typebots/logic/condition.json')
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot4/edit')

    cy.findByTestId('step-condition1').click()

    cy.findByTestId('variables-input').click()
    cy.findByRole('menuitem', { name: 'Age' }).click()
    cy.findByRole('button', { name: 'Equal to' }).click()
    cy.findByRole('menuitem', { name: 'Greater than' }).click()
    cy.findByPlaceholderText('Type a value...').type('80')

    cy.findByRole('button', { name: 'Add' }).click()
    cy.findAllByTestId('variables-input').last().click()
    cy.findByRole('menuitem', { name: 'Age' }).click()
    cy.findByRole('button', { name: 'Equal to' }).click()
    cy.findByRole('menuitem', { name: 'Less than' }).click()
    cy.findAllByPlaceholderText('Type a value...').last().type('100')

    cy.findByTestId('step-condition2').click()

    cy.findByTestId('variables-input').click()
    cy.findByRole('menuitem', { name: 'Age' }).click()
    cy.findByRole('button', { name: 'Equal to' }).click()
    cy.findByRole('menuitem', { name: 'Greater than' }).click()
    cy.findByPlaceholderText('Type a value...').type('20')

    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody().findByPlaceholderText('Type your age...').type('15{enter}')
    getIframeBody().findByText('You are younger than 20').should('exist')

    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByPlaceholderText('Type your age...').type('45{enter}')
    getIframeBody().findByText('Wow you are older than 20').should('exist')

    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByPlaceholderText('Type your age...').type('90{enter}')
    getIframeBody().findByText('Wow you are older than 80').should('exist')
  })
})

const createNewVar = (name: string) => {
  cy.findByTestId('variables-input').type(name)
  cy.findByRole('menuitem', { name: `Create "${name}"` }).click()
}
