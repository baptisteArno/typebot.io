import { ContinueChatResponse, StartChatResponse } from '@sniper.io/schemas'

export type InputSubmitContent = {
  label?: string
  value: string
}

export type BotContext = {
  sniper: InitialChatReply['sniper']
  resultId?: string
  isPreview: boolean
  apiHost?: string
  sessionId: string
  storage: 'local' | 'session' | undefined
}

export type InitialChatReply = StartChatResponse & {
  sniper: NonNullable<StartChatResponse['sniper']>
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
