import { byId } from '@typebot.io/lib'
import { ChatLog, VariableWithUnknowValue } from '@typebot.io/schemas'
import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { ExecuteIntegrationResponse } from '../../../types'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'
import { createHttpReqResponseMappingRunner } from '@typebot.io/variables/codeRunners'

type Props = {
  state: SessionState
  blockType:
    | LogicBlockType.WEBHOOK
    | IntegrationBlockType.WEBHOOK
    | IntegrationBlockType.ZAPIER
    | IntegrationBlockType.MAKE_COM
    | IntegrationBlockType.PABBLY_CONNECT
  blockId: string
  responseVariableMapping?: {
    bodyPath?: string
    variableId?: string
  }[]
  outgoingEdgeId?: string
  logs?: ChatLog[]
  response: {
    // Optional because the Webhook listener block is resumed by an inbound call
    // that carries no status code of its own.
    statusCode?: number
    data?: unknown
  }
}

/**
 * Writes parts of an HTTP response body into typebot variables, following the
 * block's `responseVariableMapping`. Shared by the outgoing HTTP request block
 * (Webhook / Zapier / Make.com / Pabbly) and the Webhook listener logic block.
 */
export const saveDataInResponseVariableMapping = ({
  state,
  blockType,
  blockId,
  responseVariableMapping,
  outgoingEdgeId,
  logs = [],
  response,
}: Props): ExecuteIntegrationResponse => {
  const { typebot } = state.typebotsQueue[0]
  const status = response.statusCode?.toString()
  const isError = status
    ? status.startsWith('4') || status.startsWith('5')
    : false

  const responseFromClient = logs.length === 0

  if (responseFromClient) {
    // The integration blocks' wording is kept verbatim so existing result logs
    // stay consistent; the listener block gets its own, unambiguous message.
    const successDescription =
      blockType === LogicBlockType.WEBHOOK
        ? `Webhook data received!`
        : `Webhook executed successfully!`
    logs.push(
      isError
        ? {
            status: 'error',
            description: `Webhook returned error`,
            details: response.data,
          }
        : {
            status: 'success',
            description: successDescription,
            details: response.data,
          }
    )
  }

  let run: ((varMapping: string) => unknown) | undefined
  if (responseVariableMapping) {
    try {
      run = createHttpReqResponseMappingRunner(response)
    } catch (err) {
      // An unserializable body must not take the whole flow down; the mappings
      // are simply skipped and the bot carries on.
      run = undefined
    }
  }
  const newVariables = responseVariableMapping?.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId || !run)
      return newVariables
    const existingVariable = typebot.variables.find(byId(varMapping.variableId))
    if (!existingVariable) return newVariables

    try {
      const value: unknown = run(
        parseVariables(typebot.variables)(varMapping?.bodyPath)
      )
      return [...newVariables, { ...existingVariable, value }]
    } catch (err) {
      return newVariables
    }
  }, [])
  if (newVariables && newVariables.length > 0) {
    const { updatedState, newSetVariableHistory } = updateVariablesInSession({
      newVariables,
      state,
      currentBlockId: blockId,
    })
    return {
      outgoingEdgeId,
      newSessionState: updatedState,
      newSetVariableHistory,
      logs,
    }
  }

  return {
    outgoingEdgeId,
    logs,
  }
}
