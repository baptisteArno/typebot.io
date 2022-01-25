import { createTypebotWithStep } from 'cypress/plugins/data'
import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'
import { defaultPhoneInputOptions, InputStepType, Step } from 'models'

describe('Phone number input', () => {
  beforeEach(() => {
    prepareDbAndSignIn()
    createTypebotWithStep({
      type: InputStepType.PHONE,
      options: defaultPhoneInputOptions,
    } as Step)
  })
  afterEach(removePreventReload)

  it('options should work', () => {
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText(defaultPhoneInputOptions.labels.placeholder)
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
