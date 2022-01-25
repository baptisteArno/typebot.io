import { createTypebotWithStep } from 'cypress/plugins/data'
import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'
import { BubbleStepType, defaultTextBubbleContent, Step } from 'models'

describe('Text bubbles', () => {
  beforeEach(() => {
    prepareDbAndSignIn()
    createTypebotWithStep({
      type: BubbleStepType.TEXT,
      content: defaultTextBubbleContent,
    } as Omit<Step, 'id' | 'blockId'>)
    cy.visit('/typebots/typebot3/edit')
  })
  afterEach(removePreventReload)

  it('rich text features should work', () => {
    cy.findByTestId('bold-button').click()
    cy.findByRole('textbox', { name: 'Text editor' }).type('Bold text{enter}')
    cy.findByTestId('bold-button').click()
    cy.findByTestId('italic-button').click()
    cy.findByRole('textbox', { name: 'Text editor' }).type('Italic text{enter}')
    cy.findByTestId('italic-button').click()
    cy.findByTestId('underline-button').click()
    cy.findByRole('textbox', { name: 'Text editor' }).type(
      'Underlined text{enter}'
    )
    cy.findByTestId('bold-button').click()
    cy.findByTestId('italic-button').click()
    cy.findByRole('textbox', { name: 'Text editor' }).type('Everything text')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .get('span.slate-bold')
      .should('exist')
      .should('contain.text', 'Bold text')
    getIframeBody()
      .get('span.slate-italic')
      .should('exist')
      .should('contain.text', 'Italic text')
    getIframeBody()
      .get('span.slate-underline')
      .should('exist')
      .should('contain.text', 'Underlined text')
  })
})
