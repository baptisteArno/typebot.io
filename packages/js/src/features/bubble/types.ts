export type BubbleParams = {
  button: ButtonParams
  previewMessage: PreviewMessageParams
}

export type ButtonParams = {
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
  style?: PreviewMessageStyle
}

type PreviewMessageStyle = Partial<{
  backgroundColor: string
  color: string
  fontFamily: string
  closeButtonBgColor: string
  closeButtonColor: string
}>
