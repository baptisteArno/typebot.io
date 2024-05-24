import { PublicTypebotV6 } from '@typebot.io/schemas'
import { isInputBlock } from '@typebot.io/schemas/helpers'

export const parseBlockIdVariableIdMap = (
  groups?: PublicTypebotV6['groups']
): {
  [key: string]: string
} => {
  if (!groups) return {}
  const blockIdVariableIdMap: { [key: string]: string } = {}
  groups.forEach((group) => {
    group.blocks.forEach((block) => {
      if (isInputBlock(block) && block.options?.variableId) {
        blockIdVariableIdMap[block.id] = block.options.variableId
      }
    })
  })
  return blockIdVariableIdMap
}
