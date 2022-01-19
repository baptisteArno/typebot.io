import { preventUserFromRefreshing } from 'cypress/plugins/utils'
import { getIframeBody } from 'cypress/support'

describe('Google sheets', () => {
  beforeEach(() => {
    cy.task('seed', Cypress.env('GOOGLE_SHEETS_REFRESH_TOKEN'))
    cy.signOut()
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.removeEventListener('beforeunload', preventUserFromRefreshing)
    })
  })

  it('Insert row should work', () => {
    cy.intercept({
      url: '/api/integrations/google-sheets/spreadsheets/1k_pIDw3YHl9tlZusbBVSBRY0PeRPd2H6t4Nj7rwnOtM/sheets/0',
      method: 'POST',
    }).as('insertRowInGoogleSheets')
    cy.loadTypebotFixtureInDatabase('typebots/integrations/googleSheets.json')
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot4/edit')

    fillInSpreadsheetInfo()

    cy.findByRole('button', { name: 'Select an operation' }).click()
    cy.findByRole('menuitem', { name: 'Insert a row' }).click({ force: true })

    cy.findByRole('button', { name: 'Select a column' }).click()
    cy.findByRole('menuitem', { name: 'Email' }).click()
    cy.findByRole('button', { name: 'Insert a variable' }).click()
    cy.findByRole('menuitem', { name: 'Email' }).click()

    cy.findByRole('button', { name: 'Add a value' }).click()

    cy.findByRole('button', { name: 'Select a column' }).click()
    cy.findByRole('menuitem', { name: 'First name' }).click()
    cy.findAllByPlaceholderText('Type a value...').last().type('Georges')

    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your email...')
      .type('georges@gmail.com{enter}')
    cy.wait('@insertRowInGoogleSheets')
      .then((interception) => {
        return interception.response?.statusCode
      })
      .should('eq', 200)
  })

  it('Update row should work', () => {
    cy.intercept({
      url: '/api/integrations/google-sheets/spreadsheets/1k_pIDw3YHl9tlZusbBVSBRY0PeRPd2H6t4Nj7rwnOtM/sheets/0',
      method: 'PATCH',
    }).as('updateRowInGoogleSheets')
    cy.loadTypebotFixtureInDatabase('typebots/integrations/googleSheets.json')
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot4/edit')

    fillInSpreadsheetInfo()

    cy.findByRole('button', { name: 'Select an operation' }).click()
    cy.findByRole('menuitem', { name: 'Update a row' }).click({ force: true })

    cy.findAllByRole('button', { name: 'Select a column' }).first().click()
    cy.findByRole('menuitem', { name: 'Email' }).click()
    cy.findAllByRole('button', { name: 'Insert a variable' }).first().click()
    cy.findByRole('menuitem', { name: 'Email' }).click()

    cy.findByRole('button', { name: 'Select a column' }).click()
    cy.findByRole('menuitem', { name: 'Last name' }).click()
    cy.findAllByPlaceholderText('Type a value...').last().type('Last name')

    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your email...')
      .type('test@test.com{enter}')
    cy.wait('@updateRowInGoogleSheets')
      .then((interception) => {
        return interception.response?.statusCode
      })
      .should('eq', 200)
  })

  it('Get row should work', () => {
    cy.loadTypebotFixtureInDatabase(
      'typebots/integrations/googleSheetsGet.json'
    )
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot4/edit')

    fillInSpreadsheetInfo()

    cy.findByRole('button', { name: 'Select an operation' }).click()
    cy.findByRole('menuitem', { name: 'Get data from sheet' }).click({
      force: true,
    })

    cy.findAllByRole('button', { name: 'Select a column' }).first().click()
    cy.findByRole('menuitem', { name: 'Email' }).click()
    cy.findByRole('button', { name: 'Insert a variable' }).click()
    cy.findByRole('menuitem', { name: 'Email' }).click()

    cy.findByRole('button', { name: 'Select a column' }).click()
    cy.findByRole('menuitem', { name: 'First name' }).click()
    createNewVar('First name')

    cy.findByRole('button', { name: 'Add a value' }).click()

    cy.findByRole('button', { name: 'Select a column' }).click()
    cy.findByRole('menuitem', { name: 'Last name' }).click()
    createNewVar('Last name')

    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your email...')
      .type('test2@test.com{enter}')
    getIframeBody().findByText('Your name is: John Smith').should('exist')
  })
})

const fillInSpreadsheetInfo = () => {
  cy.findByTestId('step-step1').click()

  cy.findByRole('button', { name: 'Select an account' }).click()
  cy.findByRole('menuitem', { name: 'test2@gmail.com' }).click()

  cy.findByPlaceholderText('Search for spreadsheet').type('CR')
  cy.findByRole('menuitem', { name: 'CRM' }).click()

  cy.findByPlaceholderText('Select the sheet').type('Sh')
  cy.findByRole('menuitem', { name: 'Sheet1' }).click()
}

const createNewVar = (name: string) => {
  cy.findAllByTestId('variables-input').last().type(name)
  cy.findByRole('menuitem', { name: `Create "${name}"` }).click()
}
