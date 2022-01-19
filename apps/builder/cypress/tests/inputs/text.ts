import { createTypebotWithStep } from 'cypress/plugins/data'
import { preventUserFromRefreshing } from 'cypress/plugins/utils'
import { getIframeBody } from 'cypress/support'
import { InputStepType } from 'models'

describe('Text input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.TEXT })
    cy.signOut()
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.removeEventListener('beforeunload', preventUserFromRefreshing)
    })
  })

  it('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .should('have.attr', 'type')
      .should('equal', 'text')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('Your name...')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('button', { name: 'Restart' }).click()
    cy.findByTestId('step-step1').should('contain.text', 'Your name...')
    getIframeBody().findByPlaceholderText('Your name...').should('exist')
    getIframeBody().findByRole('button', { name: 'Go' })
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('checkbox', { name: 'Long text?' }).check({ force: true })
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByTestId('textarea').should('exist')
  })
})
