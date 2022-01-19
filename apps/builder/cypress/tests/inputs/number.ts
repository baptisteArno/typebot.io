import { createTypebotWithStep } from 'cypress/plugins/data'
import { getIframeBody } from 'cypress/support'
import { InputStepType } from 'models'

describe('Number input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.NUMBER })
    cy.signOut()
  })

  it('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .should('have.attr', 'type')
      .should('equal', 'number')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('Your name...')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('spinbutton', { name: 'Min:' }).type('0')
    cy.findByRole('spinbutton', { name: 'Max:' }).type('100')
    cy.findByRole('spinbutton', { name: 'Step:' }).type('10')
    cy.findByRole('button', { name: 'Restart' }).click()
    cy.findByTestId('step-step1').should('contain.text', 'Your name...')
    getIframeBody()
      .findByPlaceholderText('Your name...')
      .should('exist')
      .type('-1{enter}')
      .clear()
      .type('150{enter}')
    getIframeBody().findByRole('button', { name: 'Go' })
    cy.findByTestId('step-step1').click({ force: true })
  })
})
