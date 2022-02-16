export type Theme = {
  general: GeneralTheme
  chat: ChatTheme
  customCss?: string
}

export type GeneralTheme = {
  font: string
  background: Background
}

export type AvatarProps = {
  isEnabled: boolean
  url?: string
}

export type ChatTheme = {
  hostAvatar?: AvatarProps
  guestAvatar?: AvatarProps
  hostBubbles: ContainerColors
  guestBubbles: ContainerColors
  buttons: ContainerColors
  inputs: InputColors
}

export type ContainerColors = {
  backgroundColor: string
  color: string
}

export type InputColors = ContainerColors & {
  placeholderColor: string
}

export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export type Background = {
  type: BackgroundType
  content?: string
}

export const defaultTheme: Theme = {
  chat: {
    hostBubbles: { backgroundColor: '#F7F8FF', color: '#303235' },
    guestBubbles: { backgroundColor: '#FF8E21', color: '#FFFFFF' },
    buttons: { backgroundColor: '#0042DA', color: '#FFFFFF' },
    inputs: {
      backgroundColor: '#FFFFFF',
      color: '#303235',
      placeholderColor: '#9095A0',
    },
  },
  general: { font: 'Open Sans', background: { type: BackgroundType.NONE } },
}
