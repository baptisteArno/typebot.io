import { Block, Group } from '@typebot.io/schemas'

export const getBlockById = (
  blockId: string,
  groups: Group[]
): { block: Block; group: Group; blockIndex: number; groupIndex: number } => {
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    for (
      let blockIndex = 0;
      blockIndex < groups[groupIndex].blocks.length;
      blockIndex++
    ) {
      if (groups[groupIndex].blocks[blockIndex].id === blockId) {
        return {
          block: groups[groupIndex].blocks[blockIndex],
          group: groups[groupIndex],
          blockIndex,
          groupIndex,
        }
      }
    }
  }
  throw new Error(`Block with id ${blockId} was not found`)
}
