export type InputSubmitContent = {
  label?: string
  value: string
}

export type BotContext = {
  typebotId: string
  resultId: string
  isPreview: boolean
  apiHost?: string
}
