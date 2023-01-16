import { ChatReply } from 'models'

export type InputSubmitContent = {
  label?: string
  value: string
}

export type BotContext = {
  typebotId: string
  resultId?: string
  isPreview: boolean
  apiHost?: string
}

export type InitialChatReply = ChatReply & {
  typebot: NonNullable<ChatReply['typebot']>
  sessionId: NonNullable<ChatReply['sessionId']>
}
