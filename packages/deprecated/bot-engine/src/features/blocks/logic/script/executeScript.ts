import { parseVariables, parseCorrectValueType } from '@/features/variables'
import { LogicState } from '@/types'
import { sendEventToParent } from '@/utils/chat'
import { isEmbedded } from '@/utils/helpers'
import { ScriptBlock } from '@typebot.io/schemas'

export const executeScript = async (
  block: ScriptBlock,
  { typebot: { variables } }: LogicState
) => {
  if (!block.options.content) return
  if (block.options.shouldExecuteInParentContext && isEmbedded) {
    sendEventToParent({
      codeToExecute: parseVariables(variables)(block.options.content),
    })
  } else {
    const func = Function(
      ...variables.map((v) => v.id),
      parseVariables(variables, { fieldToParse: 'id' })(block.options.content)
    )
    try {
      await func(...variables.map((v) => parseCorrectValueType(v.value)))
    } catch (err) {
      console.error(err)
    }
  }

  return block.outgoingEdgeId
}
