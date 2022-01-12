import { userIds } from 'cypress/plugins/data'
import {
  parseTestTypebot,
  preventUserFromRefreshing,
} from 'cypress/plugins/utils'
import { BubbleStepType } from 'models'

describe('Text bubbles', () => {
  beforeEach(() => {
    cy.task('seed')
    cy.task(
      'createTypebot',
      parseTestTypebot({
        id: 'typebot3',
        name: 'Typebot #3',
        ownerId: userIds[1],
        steps: {
          byId: {
            step1: {
              id: 'step1',
              blockId: 'block1',
              type: BubbleStepType.TEXT,
              content: { html: '', plainText: '', richText: [] },
            },
          },
          allIds: ['step1'],
        },
        blocks: {
          byId: {
            block1: {
              id: 'block1',
              graphCoordinates: { x: 400, y: 200 },
              title: 'Block #1',
              stepIds: ['step1'],
            },
          },
          allIds: ['block1'],
        },
      })
    )
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

const getIframeBody = () => {
  return cy
    .get('#typebot-iframe')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap)
}
