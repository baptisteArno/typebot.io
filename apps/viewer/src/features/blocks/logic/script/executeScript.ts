import { ExecuteLogicResponse } from '@/features/chat/types'
import { extractVariablesFromText } from '@/features/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@/features/variables/parseGuessedValueType'
import { parseVariables } from '@/features/variables/parseVariables'
import { ScriptBlock, SessionState, Variable } from '@typebot.io/schemas'

export const executeScript = (
  { typebot: { variables } }: SessionState,
  block: ScriptBlock,
  lastBubbleBlockId?: string
): ExecuteLogicResponse => {
  if (!block.options.content) return { outgoingEdgeId: block.outgoingEdgeId }

  const scriptToExecute = parseScriptToExecuteClientSideAction(
    variables,
    block.options.content
  )

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        scriptToExecute: scriptToExecute,
        lastBubbleBlockId,
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
