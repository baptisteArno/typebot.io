import { parseTestTypebot } from 'cypress/plugins/utils'
import { StepType } from 'models'

describe('Text input', () => {
  beforeEach(() => {
    cy.task('seed')
    cy.task(
      'createTypebot',
      parseTestTypebot({
        id: 'typebot3',
        name: 'Typebot #3',
        ownerId: 'test2',
        steps: {
          byId: {
            step1: {
              id: 'step1',
              blockId: 'block1',
              type: StepType.TEXT_INPUT,
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

  it('text input options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody().findByPlaceholderText('Type your answer...').should('exist')
    getIframeBody().findByRole('button', { name: 'Send' })
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('Your name...')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByPlaceholderText('Your name...').should('exist')
    getIframeBody().findByRole('button', { name: 'Go' })
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('checkbox', { name: 'Long text?' }).check({ force: true })
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByTestId('textarea').should('exist')
  })
})

const getIframeBody = () => {
  return cy
    .get('#typebot-iframe')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap)
}
