import { createTypebotWithStep } from 'cypress/plugins/data'
import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'
import { BubbleStepType, defaultImageBubbleContent, Step } from 'models'

const unsplashImageSrc =
  'https://images.unsplash.com/photo-1504297050568-910d24c426d3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80'

describe('Image bubbles', () => {
  before(() => {
    cy.intercept({
      url: 'https://s3.eu-west-3.amazonaws.com/typebot',
      method: 'POST',
    }).as('postImage')
  })

  describe('Content settings', () => {
    beforeEach(() => {
      prepareDbAndSignIn()
      createTypebotWithStep({
        type: BubbleStepType.IMAGE,
        content: defaultImageBubbleContent,
      } as Step)
      cy.visit('/typebots/typebot3/edit')
      cy.findByText('Click to edit...').click()
    })

    it('upload image file correctly', () => {
      cy.findByTestId('file-upload-input').attachFile('avatar.jpg')
      cy.wait('@postImage')
      cy.findByRole('img')
        .should('have.attr', 'src')
        .should(
          'include',
          `https://s3.eu-west-3.amazonaws.com/typebot/typebots/typebot3/avatar.jpg`
        )
    })

    it('should import image links correctly', () => {
      cy.findByRole('button', { name: 'Embed link' }).click()
      cy.findByPlaceholderText('Paste the image link...')
        .clear()
        .type(unsplashImageSrc)
      cy.findByRole('img')
        .should('have.attr', 'src')
        .should('include', unsplashImageSrc)
    })

    it('should import giphy gifs correctly', () => {
      cy.findByRole('button', { name: 'Giphy' }).click()
      cy.findAllByRole('img').eq(3).click()
      cy.findAllByRole('img')
        .first()
        .should('have.attr', 'src')
        .should('contain', `giphy.com/media`)
    })
  })
  describe('Preview', () => {
    before(() => {
      prepareDbAndSignIn()
      createTypebotWithStep({
        type: BubbleStepType.IMAGE,
        content: {
          url: unsplashImageSrc,
        },
      } as Omit<Step, 'id' | 'blockId'>)
    })

    it('should display correctly', () => {
      cy.visit('/typebots/typebot3/edit')
      cy.findByRole('button', { name: 'Preview' }).click()
      getIframeBody()
        .findByRole('img')
        .should('have.attr', 'src')
        .should('eq', unsplashImageSrc)
    })
  })
})
