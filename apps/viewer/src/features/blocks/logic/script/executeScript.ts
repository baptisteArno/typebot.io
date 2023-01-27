import { ExecuteLogicResponse } from '@/features/chat'
import {
  parseVariables,
  parseCorrectValueType,
  extractVariablesFromText,
} from '@/features/variables'
import { ScriptBlock, SessionState } from 'models'

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
      value: parseCorrectValueType(variable.value),
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
