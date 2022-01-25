import { prepareDbAndSignIn, removePreventReload } from 'cypress/support'

const favIconUrl = 'https://www.baptistearno.com/favicon.png'
const imageUrl = 'https://www.baptistearno.com/images/site-preview.png'

describe('Typing emulation', () => {
  beforeEach(prepareDbAndSignIn)

  afterEach(removePreventReload)

  it('should reflect changes in real time', () => {
    cy.loadTypebotFixtureInDatabase('typebots/theme/theme.json')
    cy.visit('/typebots/typebot4/settings')
    cy.findByRole('button', { name: 'Metadata' }).click()

    // Fav icon
    cy.findAllByRole('img', { name: 'Fav icon' })
      .click()
      .should('have.attr', 'src')
      .should('eq', '/favicon.png')
    cy.findByRole('button', { name: 'Giphy' }).should('not.exist')
    cy.findByRole('button', { name: 'Embed link' }).click()
    cy.findByPlaceholderText('Paste the image link...').type(favIconUrl)
    cy.findAllByRole('img', { name: 'Fav icon' })
      .should('have.attr', 'src')
      .should('eq', favIconUrl)

    // Image
    cy.findAllByRole('img', { name: 'Website image' })
      .click()
      .should('have.attr', 'src')
      .should('eq', '/viewer-preview.png')
    cy.findByRole('button', { name: 'Giphy' }).should('not.exist')
    cy.findByRole('button', { name: 'Embed link' }).click()
    cy.findByPlaceholderText('Paste the image link...').type(imageUrl)
    cy.findAllByRole('img', { name: 'Website image' })
      .should('have.attr', 'src')
      .should('eq', imageUrl)

    // Title
    cy.findByRole('textbox', { name: 'Title:' })
      .click({ force: true })
      .clear()
      .type('Awesome typebot')

    // Description
    cy.findByRole('textbox', { name: 'Description:' })
      .clear()
      .type('Lorem ipsum')
  })
})
