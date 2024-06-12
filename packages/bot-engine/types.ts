import {
  ContinueChatResponse,
  CustomEmbedBubble,
  SessionState,
  SetVariableHistoryItem,
} from '@typebot.io/schemas'

export type EdgeId = string

export type ExecuteLogicResponse = {
  outgoingEdgeId: EdgeId | undefined
  newSessionState?: SessionState
  newSetVariableHistory?: SetVariableHistoryItem[]
} & Pick<ContinueChatResponse, 'clientSideActions' | 'logs'>

export type ExecuteIntegrationResponse = {
  outgoingEdgeId: EdgeId | undefined
  newSessionState?: SessionState
  startTimeShouldBeUpdated?: boolean
  customEmbedBubble?: CustomEmbedBubble
  newSetVariableHistory?: SetVariableHistoryItem[]
} & Pick<ContinueChatResponse, 'clientSideActions' | 'logs'>

type WhatsAppMediaMessage = {
  type: 'whatsapp media'
  mediaId: string
  workspaceId?: string
  accessToken: string
}

export type Reply = string | WhatsAppMediaMessage | undefined

export type ParsedReply =
  | { status: 'success'; reply: string }
  | { status: 'fail' }
  | { status: 'skip' }
