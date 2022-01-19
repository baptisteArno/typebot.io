import { preventUserFromRefreshing } from 'cypress/plugins/utils'
import { getIframeBody } from 'cypress/support'

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

    cy.findAllByText('Equal to').first().click()

    cy.findByTestId('variables-input').click()
    cy.findByRole('menuitem', { name: 'Age' }).click()
    cy.findByRole('button', { name: 'Equal to' }).click()
    cy.findByRole('menuitem', { name: 'Greater than' }).click()
    cy.findByPlaceholderText('Type a value...').type('80')

    cy.findByRole('button', { name: 'Add a comparison' }).click()
    cy.findAllByTestId('variables-input').last().click()
    cy.findByRole('menuitem', { name: 'Age' }).click()
    cy.findByRole('button', { name: 'Equal to' }).click()
    cy.findByRole('menuitem', { name: 'Less than' }).click()
    cy.findAllByPlaceholderText('Type a value...').last().type('100')

    cy.findAllByText('Equal to').last().click()

    cy.findByTestId('variables-input').click()
    cy.findByRole('menuitem', { name: 'Age' }).click()
    cy.findByRole('button', { name: 'Equal to' }).click()
    cy.findByRole('menuitem', { name: 'Greater than' }).click()
    cy.findByPlaceholderText('Type a value...').type('20')

    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .type('15{enter}')
    getIframeBody().findByText('You are younger than 20').should('exist')

    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .type('45{enter}')
    getIframeBody().findByText('You are older than 20').should('exist')

    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .type('90{enter}')
    getIframeBody().findByText('You are older than 80').should('exist')
  })
})
