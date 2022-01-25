import { createTypebotWithStep } from 'cypress/plugins/data'
import {
  getIframeBody,
  prepareDbAndSignIn,
  removePreventReload,
} from 'cypress/support'
import {
  BubbleStepType,
  defaultVideoBubbleContent,
  Step,
  VideoBubbleContentType,
} from 'models'

const videoSrc =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
const youtubeVideoSrc = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const vimeoVideoSrc = 'https://vimeo.com/649301125'

describe('Video bubbles', () => {
  describe('Content settings', () => {
    beforeEach(() => {
      prepareDbAndSignIn()
      createTypebotWithStep({
        type: BubbleStepType.VIDEO,
        content: defaultVideoBubbleContent,
      } as Omit<Step, 'id' | 'blockId'>)
    })
    afterEach(removePreventReload)

    it('upload image file correctly', () => {
      cy.visit('/typebots/typebot3/edit')
      cy.findByText('Click to edit...').click()
      cy.findByPlaceholderText('Paste the video link...').type(videoSrc, {
        waitForAnimations: false,
      })
      cy.get('video > source').should('have.attr', 'src').should('eq', videoSrc)

      cy.findByPlaceholderText('Paste the video link...')
        .clear()
        .type(youtubeVideoSrc, {
          waitForAnimations: false,
        })
      cy.get('iframe')
        .should('have.attr', 'src')
        .should('eq', 'https://www.youtube.com/embed/dQw4w9WgXcQ')

      cy.findByPlaceholderText('Paste the video link...')
        .clear()
        .type(vimeoVideoSrc, {
          waitForAnimations: false,
        })
      cy.get('iframe')
        .should('have.attr', 'src')
        .should('eq', 'https://player.vimeo.com/video/649301125')
    })
  })

  describe('Preview', () => {
    beforeEach(prepareDbAndSignIn)
    afterEach(removePreventReload)

    it('should display video correctly', () => {
      createTypebotWithStep({
        type: BubbleStepType.VIDEO,
        content: {
          type: VideoBubbleContentType.URL,
          url: videoSrc,
        },
      } as Omit<Step, 'id' | 'blockId'>)
      cy.visit('/typebots/typebot3/edit')
      cy.findByRole('button', { name: 'Preview' }).click()
      getIframeBody()
        .get('video > source')
        .should('have.attr', 'src')
        .should('eq', videoSrc)
    })

    it('should display youtube iframe correctly', () => {
      createTypebotWithStep({
        type: BubbleStepType.VIDEO,
        content: {
          type: VideoBubbleContentType.YOUTUBE,
          url: youtubeVideoSrc,
          id: 'dQw4w9WgXcQ',
        },
      } as Omit<Step, 'id' | 'blockId'>)
      cy.visit('/typebots/typebot3/edit')
      cy.findByRole('button', { name: 'Preview' }).click()
      getIframeBody()
        .get('iframe')
        .first()
        .should('have.attr', 'src')
        .should('eq', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
    })

    it('should display vimeo iframe correctly', () => {
      createTypebotWithStep({
        type: BubbleStepType.VIDEO,
        content: {
          type: VideoBubbleContentType.VIMEO,
          url: vimeoVideoSrc,
          id: '649301125',
        },
      } as Omit<Step, 'id' | 'blockId'>)
      cy.visit('/typebots/typebot3/edit')
      cy.findByRole('button', { name: 'Preview' }).click()
      getIframeBody()
        .get('iframe')
        .first()
        .should('have.attr', 'src')
        .should('eq', 'https://player.vimeo.com/video/649301125')
    })
  })
})
