import { Theme } from './schema'

export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export const defaultTheme = {
  chat: {
    roundness: 'medium',
    hostBubbles: { backgroundColor: '#fafafa', color: '#111827' },
    guestBubbles: { backgroundColor: '#3171b5', color: '#FFFFFF' },
    buttons: { backgroundColor: '#eff9ff', color: '#0068b3' },
    inputs: {
      backgroundColor: '#FFFFFF',
      color: '#111827',
      placeholderColor: '#9095A0',
    },
    hostAvatar: {
      isEnabled: false,
    },
    guestAvatar: {
      isEnabled: false,
    },
  },
  general: {
    font: 'Open Sans',
    background: { type: BackgroundType.COLOR, content: '#ffffff' },
  },
} as const satisfies Theme
