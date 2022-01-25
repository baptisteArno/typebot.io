import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'

describe('Webhook step', () => {
  beforeEach(prepareDbAndSignIn)

  afterEach(removePreventReload)

  describe('Configuration', () => {
    it('configuration is working', () => {
      cy.loadTypebotFixtureInDatabase('typebots/integrations/webhook.json')
      cy.visit('/typebots/typebot4/edit')
      cy.findByText('Configure...').click()
      cy.findByRole('button', { name: 'GET' }).click()
      cy.findByRole('menuitem', { name: 'POST' }).click({ force: true })
      cy.findByPlaceholderText('Your Webhook URL...').type(
        `${Cypress.env('SITE_NAME')}/api/mock/webhook`
      )

      cy.findByRole('button', { name: 'Query params' }).click()
      cy.findByRole('textbox', { name: 'Key:' }).type('firstParam')
      cy.findByRole('textbox', { name: 'Value:' }).type('{{secret 1}}', {
        parseSpecialCharSequences: false,
      })
      cy.findByRole('button', { name: 'Add a param' }).click()
      cy.findAllByRole('textbox', { name: 'Key:' }).last().type('secondParam')
      cy.findAllByRole('textbox', { name: 'Value:' })
        .last()
        .type('{{secret 2}}', {
          parseSpecialCharSequences: false,
        })

      cy.findByRole('button', { name: 'Headers' }).click()
      cy.findAllByRole('textbox', { name: 'Key:' })
        .last()
        .type('Custom-Typebot')
      cy.findAllByRole('textbox', { name: 'Value:' })
        .last()
        .type('{{secret 3}}', {
          parseSpecialCharSequences: false,
        })

      cy.findByRole('button', { name: 'Body' }).click()
      cy.findByTestId('code-editor').type('{ "customField": "{{secret 4}}" }', {
        parseSpecialCharSequences: false,
        waitForAnimations: false,
      })

      cy.findByRole('button', { name: 'Variable values for test' }).click()
      addTestVariable('secret 1', 'secret1')
      cy.findByRole('button', { name: 'Add an entry' }).click()
      addTestVariable('secret 2', 'secret2')
      cy.findByRole('button', { name: 'Add an entry' }).click()
      addTestVariable('secret 3', 'secret3')
      cy.findByRole('button', { name: 'Add an entry' }).click()
      addTestVariable('secret 4', 'secret4')

      cy.findByRole('button', { name: 'Test the request' }).click()

      cy.findAllByTestId('code-editor')
        .should('have.length', 2)
        .last()
        .should('contain.text', '"statusCode": 200')

      cy.findByRole('button', { name: 'Save in variables' }).click()
      cy.findByPlaceholderText('Select the data').click()
      cy.findByRole('menuitem', { name: 'data[0].name' }).click()
    })
  })
  describe('Preview', () => {
    it('should correctly send the request', () => {
      cy.loadTypebotFixtureInDatabase(
        'typebots/integrations/webhookPreview.json'
      )
      cy.visit('/typebots/typebot4/edit')
      cy.findByRole('button', { name: 'Preview' }).click()
      getIframeBody().findByRole('button', { name: 'Go' }).click()
      getIframeBody().findByText('His name is John').should('exist')
    })
  })
})

const addTestVariable = (name: string, value: string) => {
  cy.findAllByTestId('variables-input').last().click()
  cy.findByRole('menuitem', { name }).click()
  cy.findAllByRole('textbox', { name: 'Test value:' }).last().type(value)
}
