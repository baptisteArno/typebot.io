import { createTypebotWithStep } from 'cypress/plugins/data'
import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'
import { defaultDateInputOptions, InputStepType, Step } from 'models'

describe('Date input', () => {
  beforeEach(() => {
    prepareDbAndSignIn()
    createTypebotWithStep({
      type: InputStepType.DATE,
      options: defaultDateInputOptions,
    } as Step)
  })
  afterEach(removePreventReload)

  it('options should work', () => {
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByTestId('from-date')
      .should('have.attr', 'type')
      .should('eq', 'date')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('checkbox', { name: 'Is range?' }).check({ force: true })
    cy.findByRole('textbox', { name: 'From label:' }).clear().type('Previous:')
    cy.findByRole('textbox', { name: 'To label:' }).clear().type('After:')
    cy.findByRole('checkbox', { name: 'With time?' }).check({ force: true })
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody()
      .findByTestId('from-date')
      .should('have.attr', 'type')
      .should('eq', 'datetime-local')
    getIframeBody()
      .findByTestId('to-date')
      .should('have.attr', 'type')
      .should('eq', 'datetime-local')
    getIframeBody().findByRole('button', { name: 'Go' })
  })
})
