import { env } from '@typebot.io/env'
import { ThemeTemplate } from '@typebot.io/schemas'
import { BackgroundType } from '@typebot.io/schemas/features/typebot/theme/constants'

const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return env.NEXTAUTH_URL
}

export const galleryTemplates: Pick<ThemeTemplate, 'id' | 'name' | 'theme'>[] =
  [
    {
      id: 'typebot-light',
      name: 'Typebot Light',
      theme: {
        chat: {
          inputs: {
            color: '#303235',
            backgroundColor: '#FFFFFF',
            placeholderColor: '#9095A0',
          },
          buttons: { color: '#FFFFFF', backgroundColor: '#0042DA' },
          hostAvatar: {
            isEnabled: true,
          },
          hostBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
          guestBubbles: { color: '#FFFFFF', backgroundColor: '#FF8E21' },
        },
        general: {
          font: 'Open Sans',
          background: { type: BackgroundType.COLOR, content: '#ffffff' },
        },
      },
    },
    {
      id: 'typebot-dark',
      name: 'Typebot Dark',
      theme: {
        chat: {
          inputs: {
            color: '#ffffff',
            backgroundColor: '#1e293b',
            placeholderColor: '#9095A0',
          },
          buttons: { color: '#ffffff', backgroundColor: '#1a5fff' },
          hostAvatar: {
            isEnabled: true,
          },
          hostBubbles: { color: '#ffffff', backgroundColor: '#1e293b' },
          guestBubbles: { color: '#FFFFFF', backgroundColor: '#FF8E21' },
        },
        general: {
          font: 'Open Sans',
          background: { type: BackgroundType.COLOR, content: '#171923' },
        },
      },
    },
    {
      id: 'minimalist-black',
      name: 'Minimalist Black',
      theme: {
        chat: {
          inputs: {
            color: '#303235',
            backgroundColor: '#FFFFFF',
            placeholderColor: '#9095A0',
          },
          buttons: { color: '#FFFFFF', backgroundColor: '#303235' },
          hostAvatar: { isEnabled: false },
          hostBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
          guestBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
        },
        general: {
          font: 'Inter',
          background: { type: BackgroundType.COLOR, content: '#ffffff' },
        },
      },
    },
    {
      id: 'minimalist-teal',
      name: 'Minimalist Teal',
      theme: {
        chat: {
          inputs: {
            color: '#303235',
            backgroundColor: '#FFFFFF',
            placeholderColor: '#9095A0',
          },
          buttons: { color: '#FFFFFF', backgroundColor: '#0d9488' },
          hostAvatar: { isEnabled: false },
          hostBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
          guestBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
        },
        general: {
          font: 'Inter',
          background: { type: BackgroundType.COLOR, content: '#ffffff' },
        },
      },
    },

    {
      id: 'bright-rain',
      name: 'Bright Rain',
      theme: {
        chat: {
          inputs: {
            color: '#303235',
            backgroundColor: '#FFFFFF',
            placeholderColor: '#9095A0',
          },
          buttons: { color: '#fff', backgroundColor: '#D27A7D' },
          hostAvatar: { isEnabled: true },
          hostBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
          guestBubbles: { color: '#303235', backgroundColor: '#FDDDBF' },
        },
        general: {
          font: 'Montserrat',
          background: {
            type: BackgroundType.IMAGE,
            content: getOrigin() + '/images/backgrounds/brightRain.jpeg',
          },
        },
      },
    },
    {
      id: 'ray-of-lights',
      name: 'Ray of Lights',
      theme: {
        chat: {
          inputs: {
            color: '#303235',
            backgroundColor: '#FFFFFF',
            placeholderColor: '#9095A0',
          },
          buttons: { color: '#fff', backgroundColor: '#1A2249' },
          hostAvatar: { isEnabled: true },
          hostBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
          guestBubbles: { color: '#fff', backgroundColor: '#1A2249' },
        },
        general: {
          font: 'Raleway',
          background: {
            type: BackgroundType.IMAGE,
            content: getOrigin() + '/images/backgrounds/rayOfLights.jpeg',
          },
        },
      },
    },
  ]
