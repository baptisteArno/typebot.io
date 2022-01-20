import { createTypebotWithStep } from 'cypress/plugins/data'
import { preventUserFromRefreshing } from 'cypress/plugins/utils'
import { getIframeBody } from 'cypress/support'
import { BubbleStepType, Step } from 'models'

describe('Text bubbles', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({
      type: BubbleStepType.TEXT,
      content: { html: '', plainText: '', richText: [] },
    } as Omit<Step, 'id' | 'blockId'>)
    cy.signOut()
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.removeEventListener('beforeunload', preventUserFromRefreshing)
    })
  })

  it('rich text features should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
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
