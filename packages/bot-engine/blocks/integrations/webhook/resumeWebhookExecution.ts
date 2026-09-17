import {
  MakeComBlock,
  PabblyConnectBlock,
  ChatLog,
  HttpRequestBlock,
  ZapierBlock,
} from '@typebot.io/schemas'
import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'
import { ExecuteIntegrationResponse } from '../../../types'
import { saveDataInResponseVariableMapping } from './saveDataInResponseVariableMapping'

type Props = {
  state: SessionState
  block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock
  logs?: ChatLog[]
  response: {
    statusCode: number
    data?: unknown
  }
}

export const resumeWebhookExecution = ({
  state,
  block,
  logs = [],
  response,
}: Props): ExecuteIntegrationResponse =>
  saveDataInResponseVariableMapping({
    state,
    blockType: block.type,
    blockId: block.id,
    responseVariableMapping: block.options?.responseVariableMapping,
    outgoingEdgeId: block.outgoingEdgeId,
    logs,
    response,
  })
