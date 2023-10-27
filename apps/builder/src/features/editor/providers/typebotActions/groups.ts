import { createId } from '@paralleldrive/cuid2'
import { produce } from 'immer'
import {
  Group,
  DraggableBlock,
  DraggableBlockType,
  BlockIndices,
} from '@typebot.io/schemas'
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
      block: DraggableBlock | DraggableBlockType
      indices: BlockIndices
    }
  ) => void
  updateGroup: (groupIndex: number, updates: Partial<Omit<Group, 'id'>>) => void
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
    block: DraggableBlock | DraggableBlockType
    indices: BlockIndices
  }) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newGroup: Group = {
          id,
          graphCoordinates,
          title: `Group #${typebot.groups.length}`,
          blocks: [],
        }
        typebot.groups.push(newGroup)
        createBlockDraft(typebot, block, newGroup.id, indices)
      })
    ),
  updateGroup: (groupIndex: number, updates: Partial<Omit<Group, 'id'>>) =>
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
          (group) => group.title === group.title
        ).length

        const newGroup: Group = {
          ...group,
          title: isEmpty(group.title)
            ? ''
            : `${group.title}${
                totalGroupsWithSameTitle > 0
                  ? ` (${totalGroupsWithSameTitle})`
                  : ''
              }}`,
          id,
          blocks: group.blocks.map((block) => duplicateBlockDraft(id)(block)),
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
