import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { parseVariables } from '@/features/variables/parseVariables'
import { updateVariables } from '@/features/variables/updateVariables'
import { byId } from '@typebot.io/lib'
import {
  MakeComBlock,
  PabblyConnectBlock,
  ReplyLog,
  VariableWithUnknowValue,
  WebhookBlock,
  ZapierBlock,
} from '@typebot.io/schemas'
import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'

type Props = {
  state: SessionState
  block: WebhookBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock
  logs?: ReplyLog[]
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
}: Props): ExecuteIntegrationResponse => {
  const { typebot } = state.typebotsQueue[0]
  const status = response.statusCode.toString()
  const isError = status.startsWith('4') || status.startsWith('5')

  const responseFromClient = logs.length === 0

  if (responseFromClient)
    logs.push(
      isError
        ? {
            status: 'error',
            description: `Webhook returned error`,
            details: response.data,
          }
        : {
            status: 'success',
            description: `Webhook executed successfully!`,
            details: response.data,
          }
    )

  const newVariables = block.options.responseVariableMapping.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables
    const existingVariable = typebot.variables.find(byId(varMapping.variableId))
    if (!existingVariable) return newVariables
    const func = Function(
      'data',
      `return data.${parseVariables(typebot.variables)(varMapping?.bodyPath)}`
    )
    try {
      const value: unknown = func(response)
      return [...newVariables, { ...existingVariable, value }]
    } catch (err) {
      return newVariables
    }
  }, [])
  if (newVariables.length > 0) {
    const newSessionState = updateVariables(state)(newVariables)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState,
      logs,
    }
  }

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    logs,
  }
}
