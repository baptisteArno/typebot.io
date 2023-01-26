import { ExecuteLogicResponse } from '@/features/chat'
import {
  parseVariables,
  parseCorrectValueType,
  extractVariablesFromText,
} from '@/features/variables'
import { CodeBlock, SessionState } from 'models'

export const executeCode = (
  { typebot: { variables } }: SessionState,
  block: CodeBlock
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
        codeToExecute: {
          content,
          args,
        },
      },
    ],
  }
}
