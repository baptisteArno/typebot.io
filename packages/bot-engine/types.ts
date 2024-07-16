import {
  ContinueChatResponse,
  CustomEmbedBubble,
  Message,
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

export type Reply = Message | undefined

export type ParsedReply =
  | { status: 'success'; reply: string }
  | { status: 'fail' }
  | { status: 'skip' }
