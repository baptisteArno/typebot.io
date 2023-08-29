import { ExecuteLogicResponse } from '@/features/chat/types'
import { extractVariablesFromText } from '@/features/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@/features/variables/parseGuessedValueType'
import { parseVariables } from '@/features/variables/parseVariables'
import { ScriptBlock, SessionState, Variable } from '@typebot.io/schemas'

export const executeScript = (
  state: SessionState,
  block: ScriptBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot
  if (!block.options.content || state.whatsApp)
    return { outgoingEdgeId: block.outgoingEdgeId }

  const scriptToExecute = parseScriptToExecuteClientSideAction(
    variables,
    block.options.content
  )

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
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
