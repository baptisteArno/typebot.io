import { Theme } from './schema'
export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export const defaultTheme = {
  chat: {
    roundness: 'medium',
    hostBubbles: { backgroundColor: '#F6F6F6', color: '#131316' },
    guestBubbles: { backgroundColor: '#0057FF', color: '#FFFFFF' },
    buttons: {
      backgroundColor: '#eff9ff',
      borderColor: '#0068b3',
      color: '#0068b3',
    },
    inputs: {
      backgroundColor: '#FFFFFF',
      color: '#111827',
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
    font: 'Open Sans',
    background: { type: BackgroundType.COLOR, content: '#fefefe' },
  },
} as const satisfies Theme
