import { users } from 'cypress/plugins/data'
import { prepareDbAndSignIn, removePreventReload } from 'cypress/support'

describe('Account page', () => {
  before(() => {
    cy.intercept({
      url: 'https://s3.eu-west-3.amazonaws.com/typebot',
      method: 'POST',
    }).as('postImage')
    cy.intercept({ url: '/api/auth/session?update', method: 'GET' }).as(
      'getUpdatedSession'
    )
  })

  beforeEach(prepareDbAndSignIn)

  afterEach(removePreventReload)

  it('should edit user info properly', () => {
    cy.signIn(users[0].email)
    cy.visit('/account')
    cy.findByRole('button', { name: 'Save' }).should('not.exist')
    cy.findByRole('textbox', { name: 'Email address' }).should(
      'have.attr',
      'disabled'
    )
    cy.findByRole('textbox', { name: 'Name' })
      .should('have.value', '')
      .type('John Doe')

    cy.findByRole('img').should('not.have.attr', 'src')
    cy.findByLabelText('Change photo').attachFile('avatar.jpg')
    cy.wait('@postImage')
    cy.findByRole('img')
      .should('have.attr', 'src')
      .should(
        'include',
        `https://s3.eu-west-3.amazonaws.com/typebot/users/${users[0].id}/avatar`
      )
    cy.findByRole('button', { name: 'Save' }).should('exist').click()
    cy.wait('@getUpdatedSession')
      .then((interception) => {
        return interception.response?.statusCode
      })
      .should('eq', 200)
    cy.findByRole('button', { name: 'Save' }).should('not.exist')
  })

  it('should display valid plans', () => {
    cy.signIn(users[0].email)
    cy.visit('/account')
    cy.findByText('Free plan').should('exist')
    cy.findByRole('link', { name: 'Manage my subscription' }).should(
      'not.exist'
    )
    cy.findByRole('button', { name: 'Upgrade' }).should('exist')
    cy.signOut()
    cy.signIn(users[1].email)
    cy.visit('/account')
    cy.findByText('Pro plan').should('exist')
    cy.findByRole('link', { name: 'Manage my subscription' })
      .should('have.attr', 'href')
      .should('include', 'customer-portal')
  })
})
