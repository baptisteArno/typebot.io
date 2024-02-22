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
      theme: {},
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
          hostBubbles: { color: '#ffffff', backgroundColor: '#1e293b' },
        },
        general: {
          background: { type: BackgroundType.COLOR, content: '#171923' },
        },
      },
    },
    {
      id: 'minimalist-black',
      name: 'Minimalist Black',
      theme: {
        chat: {
          buttons: { backgroundColor: '#303235' },
          hostAvatar: { isEnabled: false },
          guestBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
        },
        general: {
          font: {
            type: 'Google',
            family: 'Inter',
          },
        },
      },
    },
    {
      id: 'minimalist-teal',
      name: 'Minimalist Teal',
      theme: {
        chat: {
          buttons: { backgroundColor: '#0d9488' },
          hostAvatar: { isEnabled: false },
          guestBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
        },
        general: {
          font: {
            type: 'Google',
            family: 'Inter',
          },
        },
      },
    },

    {
      id: 'bright-rain',
      name: 'Bright Rain',
      theme: {
        chat: {
          buttons: { backgroundColor: '#D27A7D' },
          guestBubbles: { color: '#303235', backgroundColor: '#FDDDBF' },
        },
        general: {
          font: {
            type: 'Google',
            family: 'Montserrat',
          },
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
          buttons: { backgroundColor: '#1A2249' },
          guestBubbles: { backgroundColor: '#1A2249' },
        },
        general: {
          font: {
            type: 'Google',
            family: 'Raleway',
          },
          background: {
            type: BackgroundType.IMAGE,
            content: getOrigin() + '/images/backgrounds/rayOfLights.jpeg',
          },
        },
      },
    },
  ]
