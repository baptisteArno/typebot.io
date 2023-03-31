export type BubbleParams = {
  theme?: BubbleTheme
  previewMessage?: PreviewMessageParams
}

export type BubbleTheme = {
  chatWindow?: ChatWindowTheme
  button?: ButtonTheme
  previewMessage?: PreviewMessageTheme
}

export type ChatWindowTheme = {
  backgroundColor?: string
}

export type ButtonTheme = {
  size?: 'medium' | 'large'
  backgroundColor?: string
  iconColor?: string
  customIconSrc?: string
}

export type PreviewMessageParams = {
  avatarUrl?: string
  message: string
  autoShowDelay?: number
}

export type PreviewMessageTheme = {
  backgroundColor?: string
  textColor?: string
  closeButtonBackgroundColor?: string
  closeButtonIconColor?: string
}
