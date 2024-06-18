import { ExecuteLogicResponse } from '../../../types'
import { ScriptBlock, SessionState, Variable } from '@sniper.io/schemas'
import { extractVariablesFromText } from '@sniper.io/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@sniper.io/variables/parseGuessedValueType'
import { parseVariables } from '@sniper.io/variables/parseVariables'
import { defaultScriptOptions } from '@sniper.io/schemas/features/blocks/logic/script/constants'
import { executeFunction } from '@sniper.io/variables/executeFunction'
import { updateVariablesInSession } from '@sniper.io/variables/updateVariablesInSession'

export const executeScript = async (
  state: SessionState,
  block: ScriptBlock
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.snipersQueue[0].sniper
  if (!block.options?.content || state.whatsApp)
    return { outgoingEdgeId: block.outgoingEdgeId }

  const isExecutedOnClient =
    block.options.isExecutedOnClient ?? defaultScriptOptions.isExecutedOnClient

  if (!isExecutedOnClient) {
    const { newVariables, error } = await executeFunction({
      variables,
      body: block.options.content,
    })

    const updateVarResults = newVariables
      ? updateVariablesInSession({
          newVariables,
          state,
          currentBlockId: block.id,
        })
      : undefined

    let newSessionState = state

    if (updateVarResults) {
      newSessionState = updateVarResults.updatedState
    }

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: error ? [{ status: 'error', description: error }] : [],
      newSessionState,
      newSetVariableHistory: updateVarResults?.newSetVariableHistory,
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
