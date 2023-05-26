import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'
import { parseVariables } from '@/features/variables/parseVariables'
import { updateVariables } from '@/features/variables/updateVariables'
import { byId } from '@typebot.io/lib'
import {
  MakeComBlock,
  PabblyConnectBlock,
  VariableWithUnknowValue,
  WebhookBlock,
  ZapierBlock,
} from '@typebot.io/schemas'
import { ReplyLog, SessionState } from '@typebot.io/schemas/features/chat'

export const resumeWebhookExecution =
  (
    state: SessionState,
    block: WebhookBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock
  ) =>
  async (response: {
    statusCode: number
    data?: unknown
  }): Promise<ExecuteIntegrationResponse> => {
    const { typebot, result } = state
    let log: ReplyLog | undefined
    const status = response.statusCode.toString()
    const isError = status.startsWith('4') || status.startsWith('5')

    if (isError) {
      log = {
        status: 'error',
        description: `Webhook returned error: ${response.data}`,
        details: JSON.stringify(response.data, null, 2).substring(0, 1000),
      }
      result &&
        (await saveErrorLog({
          resultId: result.id,
          message: log.description,
          details: log.details,
        }))
    } else {
      log = {
        status: 'success',
        description: `Webhook executed successfully!`,
        details: JSON.stringify(response.data, null, 2).substring(0, 1000),
      }
      result &&
        (await saveSuccessLog({
          resultId: result.id,
          message: log.description,
          details: JSON.stringify(response.data, null, 2).substring(0, 1000),
        }))
    }

    const newVariables = block.options.responseVariableMapping.reduce<
      VariableWithUnknowValue[]
    >((newVariables, varMapping) => {
      if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables
      const existingVariable = typebot.variables.find(
        byId(varMapping.variableId)
      )
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
      const newSessionState = await updateVariables(state)(newVariables)
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        newSessionState,
      }
    }

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: log ? [log] : undefined,
    }
  }
