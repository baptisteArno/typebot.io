import { createTypebotWithStep } from 'cypress/plugins/data'
import { preventUserFromRefreshing } from 'cypress/plugins/utils'
import { IntegrationStepType } from 'models'

describe('Google Analytics', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: IntegrationStepType.GOOGLE_ANALYTICS })
    cy.signOut()
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.removeEventListener('beforeunload', preventUserFromRefreshing)
    })
  })

  it('can be filled correctly', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.intercept({
      url: '/g/collect',
      method: 'POST',
    }).as('gaRequest')
    cy.findByTestId('step-step1').click()
    cy.findByRole('textbox', { name: 'Tracking ID:' }).type('G-VWX9WG1TNS')
    cy.findByRole('textbox', { name: 'Event category:' }).type('Typebot')
    cy.findByRole('textbox', { name: 'Event action:' }).type('Submit email')
    cy.findByRole('button', { name: 'Advanced' }).click()
    cy.findByRole('textbox', { name: 'Event label Optional :' }).type(
      'Campaign Z'
    )
    cy.findByRole('textbox', { name: 'Event value Optional :' }).type('20')
    // Not sure how to test if GA integration works correctly in the preview tab
  })
})
