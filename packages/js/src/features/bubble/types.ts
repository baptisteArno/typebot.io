export type BubbleParams = {
  theme?: BubbleTheme
  previewMessage?: PreviewMessageParams
}

export type BubbleTheme = {
  button?: ButtonTheme
  previewMessage?: PreviewMessageTheme
}

export type ButtonTheme = {
  backgroundColor?: string
  icon?: {
    color?: string
    url?: string
  }
}

export type PreviewMessageParams = {
  avatarUrl?: string
  message: string
  autoShowDelay?: number
}

export type PreviewMessageTheme = {
  backgroundColor?: string
  color?: string
  fontFamily?: string
  closeButtonBgColor?: string
  closeButtonColor?: string
}
