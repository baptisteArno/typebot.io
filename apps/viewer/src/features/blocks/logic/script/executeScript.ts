import { ExecuteLogicResponse } from '@/features/chat/types'
import { extractVariablesFromText } from '@/features/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@/features/variables/parseGuessedValueType'
import { parseVariables } from '@/features/variables/parseVariables'
import { ScriptBlock, SessionState } from '@typebot.io/schemas'

export const executeScript = (
  { typebot: { variables } }: SessionState,
  block: ScriptBlock,
  lastBubbleBlockId?: string
): ExecuteLogicResponse => {
  if (!block.options.content) return { outgoingEdgeId: block.outgoingEdgeId }

  const content = parseVariables(variables, { fieldToParse: 'id' })(
    block.options.content
  )
  const args = extractVariablesFromText(variables)(block.options.content).map(
    (variable) => ({
      id: variable.id,
      value: parseGuessedValueType(variable.value),
    })
  )

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        scriptToExecute: {
          content,
          args,
        },
        lastBubbleBlockId,
      },
    ],
  }
}
