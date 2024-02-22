import { ContinueChatResponse, StartChatResponse } from '@typebot.io/schemas'

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

export type InitialChatReply = StartChatResponse & {
  typebot: NonNullable<StartChatResponse['typebot']>
  sessionId: NonNullable<StartChatResponse['sessionId']>
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
  ContinueChatResponse,
  'messages' | 'input' | 'clientSideActions'
> & {
  streamingMessageId?: string
}
