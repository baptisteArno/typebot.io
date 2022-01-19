import { createTypebotWithStep } from 'cypress/plugins/data'
import { getIframeBody } from 'cypress/support'
import { InputStepType } from 'models'

describe('Phone number input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.PHONE })
    cy.signOut()
  })

  it('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Your phone number...')
      .should('have.attr', 'type')
      .should('eq', 'tel')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('+33 XX XX XX XX')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody()
      .findByPlaceholderText('+33 XX XX XX XX')
      .type('+33 6 73 18 45 36')
    getIframeBody()
      .findByRole('img')
      .should('have.attr', 'alt')
      .should('eq', 'France')
    getIframeBody().findByRole('button', { name: 'Go' }).click()
    getIframeBody().findByText('+33673184536').should('exist')
  })
})
