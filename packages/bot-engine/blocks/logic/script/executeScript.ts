import { ExecuteLogicResponse } from '../../../types'
import { ScriptBlock, SessionState, Variable } from '@typebot.io/schemas'
import { extractVariablesFromText } from '@typebot.io/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@typebot.io/variables/parseGuessedValueType'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { defaultScriptOptions } from '@typebot.io/schemas/features/blocks/logic/script/constants'
import { executeFunction } from '@typebot.io/variables/executeFunction'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'

export const executeScript = async (
  state: SessionState,
  block: ScriptBlock
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.typebotsQueue[0].typebot
  if (!block.options?.content || state.whatsApp)
    return { outgoingEdgeId: block.outgoingEdgeId }

  const isExecutedOnClient =
    block.options.isExecutedOnClient ?? defaultScriptOptions.isExecutedOnClient

  if (!isExecutedOnClient) {
    const { newVariables, error } = await executeFunction({
      variables,
      body: block.options.content,
    })

    const newSessionState = newVariables
      ? updateVariablesInSession(state)(newVariables)
      : state

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: error ? [{ status: 'error', description: error }] : [],
      newSessionState,
    }
  }

  const scriptToExecute = parseScriptToExecuteClientSideAction(
    variables,
    block.options.content
  )

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'scriptToExecute',
        scriptToExecute: scriptToExecute,
      },
    ],
  }
}

export const parseScriptToExecuteClientSideAction = (
  variables: Variable[],
  contentToEvaluate: string
) => {
  const content = parseVariables(variables, { fieldToParse: 'id' })(
    contentToEvaluate
  )
  const args = extractVariablesFromText(variables)(contentToEvaluate).map(
    (variable) => ({
      id: variable.id,
      value: parseGuessedValueType(variable.value),
    })
  )
  return {
    content,
    args,
  }
}
