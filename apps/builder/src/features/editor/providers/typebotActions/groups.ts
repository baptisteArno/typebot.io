import { createId } from '@paralleldrive/cuid2'
import { produce } from 'immer'
import { BlockIndices, BlockV6, GroupV6 } from '@typebot.io/schemas'
import { SetTypebot } from '../TypebotProvider'
import {
  deleteGroupDraft,
  createBlockDraft,
  duplicateBlockDraft,
} from './blocks'
import { isEmpty } from '@typebot.io/lib'
import { Coordinates } from '@/features/graph/types'

export type GroupsActions = {
  createGroup: (
    props: Coordinates & {
      id: string
      block: BlockV6 | BlockV6['type']
      indices: BlockIndices
    }
  ) => void
  updateGroup: (
    groupIndex: number,
    updates: Partial<Omit<GroupV6, 'id'>>
  ) => void
  duplicateGroup: (groupIndex: number) => void
  deleteGroup: (groupIndex: number) => void
}

const groupsActions = (setTypebot: SetTypebot): GroupsActions => ({
  createGroup: ({
    id,
    block,
    indices,
    ...graphCoordinates
  }: Coordinates & {
    id: string
    block: BlockV6 | BlockV6['type']
    indices: BlockIndices
  }) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newGroup: GroupV6 = {
          id,
          graphCoordinates,
          title: `Group #${typebot.groups.length + 1}`,
          blocks: [],
        }
        typebot.groups.push(newGroup)
        createBlockDraft(typebot, block, indices)
      })
    ),
  updateGroup: (groupIndex: number, updates: Partial<Omit<GroupV6, 'id'>>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex]
        typebot.groups[groupIndex] = { ...block, ...updates }
      })
    ),
  duplicateGroup: (groupIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const group = typebot.groups[groupIndex]
        const id = createId()

        const totalGroupsWithSameTitle = typebot.groups.filter(
          (g) => g.title === group.title
        ).length

        const newGroup: GroupV6 = {
          ...group,
          title: isEmpty(group.title)
            ? ''
            : `${group.title}${
                totalGroupsWithSameTitle > 0
                  ? ` (${totalGroupsWithSameTitle})`
                  : ''
              }`,
          id,
          blocks: group.blocks.map((block) => duplicateBlockDraft(block)),
          graphCoordinates: {
            x: group.graphCoordinates.x + 200,
            y: group.graphCoordinates.y + 100,
          },
        }
        typebot.groups.splice(groupIndex + 1, 0, newGroup)
      })
    ),
  deleteGroup: (groupIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteGroupDraft(typebot)(groupIndex)
      })
    ),
})

export { groupsActions }
