import { Theme } from './schema'

export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export const fontTypes = ['Google', 'Custom'] as const

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
  },
} as const satisfies Theme
