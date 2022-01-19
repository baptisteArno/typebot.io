import { createTypebotWithStep } from 'cypress/plugins/data'
import { getIframeBody } from 'cypress/support'
import { InputStepType } from 'models'

describe('Button input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.CHOICE })
    cy.signOut()
  })

  it('Can edit choice items', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByDisplayValue('Click to edit').type('Item 1{enter}')
    cy.findByText('Item 1').trigger('mouseover')
    cy.findByRole('button', { name: 'Add item' }).click()
    cy.findByDisplayValue('Click to edit').type('Item 2{enter}')
    cy.findByRole('button', { name: 'Add item' }).click()
    cy.findByDisplayValue('Click to edit').type('Item 3{enter}')
    cy.findByText('Item 2').rightclick()
    cy.findByRole('menuitem', { name: 'Delete' }).click()
    cy.findByText('Item 2').should('not.exist')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody().findByRole('button', { name: 'Item 3' }).click()
    getIframeBody().findByRole('button', { name: 'Item 3' }).should('not.exist')
    getIframeBody().findByText('Item 3')
    cy.findByRole('button', { name: 'Close' }).click()
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('checkbox', { name: 'Multiple choice?' }).check({
      force: true,
    })
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.wait(200)
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByText('Item 1').trigger('mouseover')
    cy.findByRole('button', { name: 'Add item' }).click()
    cy.findByDisplayValue('Click to edit').type('Item 2{enter}')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody().findByRole('checkbox', { name: 'Item 3' }).click()
    getIframeBody().findByRole('checkbox', { name: 'Item 1' }).click()
    getIframeBody().findByRole('button', { name: 'Go' }).click()
    getIframeBody().findByText('Item 3, Item 1').should('exist')
  })

  it('Single choice targets should work', () => {
    cy.loadTypebotFixtureInDatabase('typebots/singleChoiceTarget.json')
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot4/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody().findByRole('button', { name: 'Burgers' }).click()
    getIframeBody().findByText('I love burgers!').should('exist')
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByRole('button', { name: 'Carpaccio' }).click()
    getIframeBody().findByText('Cool!').should('exist')
  })
})
