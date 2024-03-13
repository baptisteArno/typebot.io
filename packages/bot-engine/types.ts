import {
  ContinueChatResponse,
  CustomEmbedBubble,
  SessionState,
} from '@typebot.io/schemas'

export type EdgeId = string

export type ExecuteLogicResponse = {
  outgoingEdgeId: EdgeId | undefined
  newSessionState?: SessionState
} & Pick<ContinueChatResponse, 'clientSideActions' | 'logs'>

export type ExecuteIntegrationResponse = {
  outgoingEdgeId: EdgeId | undefined
  newSessionState?: SessionState
  startTimeShouldBeUpdated?: boolean
  customEmbedBubble?: CustomEmbedBubble
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
  | { status: 'success'; reply: string; selectedIndex: any }
  | { status: 'fail' }
  | { status: 'success' | 'fail'; reply: string }
  | { status: 'skip' }
