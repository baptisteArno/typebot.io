import type { ChatReply } from '@typebot.io/schemas'

export type InputSubmitContent = {
  label?: string
  value: string
}

export type BotContext = {
  typebot: InitialChatReply['typebot']
  resultId?: string
  isPreview: boolean
  apiHost?: string
  sessionId: string
}

export type InitialChatReply = ChatReply & {
  typebot: NonNullable<ChatReply['typebot']>
  sessionId: NonNullable<ChatReply['sessionId']>
}

export type OutgoingLog = {
  status: string
  description: string
  details?: unknown
}

export type ClientSideActionContext = {
  apiHost?: string
  sessionId: string
}

export type ChatChunk = Pick<
  ChatReply,
  'messages' | 'input' | 'clientSideActions'
> & {
  streamingMessageId?: string
}
