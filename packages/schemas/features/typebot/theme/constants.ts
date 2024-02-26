import { Theme } from './schema'

export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export const fontTypes = ['Google', 'Custom'] as const

export const progressBarPlacements = ['Top', 'Bottom'] as const
export const progressBarPositions = ['fixed', 'absolute'] as const

export const defaultTheme = {
  chat: {
    roundness: 'medium',
    hostBubbles: { backgroundColor: '#F7F8FF', color: '#303235' },
    guestBubbles: { backgroundColor: '#FF8E21', color: '#FFFFFF' },
    buttons: { backgroundColor: '#0042DA', color: '#FFFFFF' },
    inputs: {
      backgroundColor: '#FFFFFF',
      color: '#303235',
      placeholderColor: '#9095A0',
    },
    hostAvatar: {
      isEnabled: true,
    },
    guestAvatar: {
      isEnabled: false,
    },
  },
  general: {
    font: {
      type: 'Google',
      family: 'Open Sans',
    },
    background: { type: BackgroundType.COLOR, content: '#ffffff' },
    progressBar: {
      isEnabled: false,
      color: '#0042DA',
      backgroundColor: '#e0edff',
      thickness: 4,
      position: 'fixed',
      placement: 'Top',
    },
  },
} as const satisfies Theme
