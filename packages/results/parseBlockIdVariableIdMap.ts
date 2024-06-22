import { PublicSniperV6 } from '@sniper.io/schemas'
import { isInputBlock } from '@sniper.io/schemas/helpers'

export const parseBlockIdVariableIdMap = (
  groups?: PublicSniperV6['groups']
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
