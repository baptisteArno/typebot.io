import { Block } from '../../blocks'
import { edgeSchema } from '../edge'
import type { Group } from '../typebot'

export const preprocessTypebot = (typebot: any) => {
  if (!typebot || typebot.version === '5') return typebot
  return {
    ...typebot,
    version: typebot.version === undefined ? null : typebot.version,
    groups: typebot.groups ? typebot.groups.map(preprocessGroup) : [],
    edges: typebot.edges
      ? typebot.edges?.filter((edge: any) => edgeSchema.safeParse(edge).success)
      : [],
  }
}

const preprocessGroup = (group: Group) => ({
  ...group,
  blocks: group.blocks.map((block) =>
    preprocessBlock(block, { groupId: group.id })
  ),
})

const preprocessBlock = (block: Block, { groupId }: { groupId: string }) => ({
  ...block,
  groupId: block.groupId ?? groupId,
})
