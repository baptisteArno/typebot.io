export type Theme = {
  general?: GeneralTheme
  chat?: ChatTheme
}

export type GeneralTheme = {
  font?: string
  background?: Background
}

export type ChatTheme = {
  hostBubbles?: ContainerColors
  guestBubbles?: ContainerColors
  buttons?: ContainerColors
  inputs?: InputColors
}

export type ContainerColors = {
  backgroundColor?: string
  color?: string
}

export type InputColors = ContainerColors & {
  placeholderColor?: string
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
