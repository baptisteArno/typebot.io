import { ContinueChatResponse, StartChatResponse } from '@typebot.io/schemas'

export type BotContext = {
  typebot: StartChatResponse['typebot']
  resultId?: string
  isPreview: boolean
  apiHost?: string
  sessionId: string
  storage: 'local' | 'session' | undefined
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

export type Attachment = {
  type: string
  url: string
}

export type TextInputSubmitContent = {
  type: 'text'
  value: string
  label?: string
  attachments?: Attachment[]
}

export type RecordingInputSubmitContent = {
  type: 'recording'
  url: string
}

export type InputSubmitContent =
  | TextInputSubmitContent
  | RecordingInputSubmitContent
