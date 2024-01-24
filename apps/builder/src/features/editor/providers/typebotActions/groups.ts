import { createId } from '@paralleldrive/cuid2'
import { Draft, produce } from 'immer'
import {
  BlockIndices,
  BlockV6,
  BlockWithItems,
  Edge,
  GroupV6,
  TypebotV6,
} from '@typebot.io/schemas'
import { SetTypebot } from '../TypebotProvider'
import {
  deleteGroupDraft,
  createBlockDraft,
  duplicateBlockDraft,
} from './blocks'
import { blockHasItems, byId, isEmpty } from '@typebot.io/lib'
import { Coordinates, CoordinatesMap } from '@/features/graph/types'
import { parseUniqueKey } from '@typebot.io/lib/parseUniqueKey'

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
  pasteGroups: (
    groups: GroupV6[],
    edges: Edge[],
    oldToNewIdsMapping: Map<string, string>
  ) => void
  updateGroupsCoordinates: (newCoord: CoordinatesMap) => void
  duplicateGroup: (groupIndex: number) => void
  deleteGroup: (groupIndex: number) => void
  deleteGroups: (groupIds: string[]) => void
}

const groupsActions = (setTypebot: SetTypebot): GroupsActions => ({
  createGroup: ({
    id,
    block,
    indices,
    groupLabel,
    ...graphCoordinates
  }: Coordinates & {
    id: string
    groupLabel?: string
    block: BlockV6 | BlockV6['type']
    indices: BlockIndices
  }) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newGroup: GroupV6 = {
          id,
          graphCoordinates,
          title: `${groupLabel ?? 'Group'} #${typebot.groups.length + 1}`,
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
  updateGroupsCoordinates: (newCoord: CoordinatesMap) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.groups.forEach((group) => {
          if (newCoord[group.id]) {
            group.graphCoordinates = newCoord[group.id]
          }
        })
      })
    )
  },
  duplicateGroup: (groupIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const group = typebot.groups[groupIndex]
        const id = createId()

        const groupTitle = isEmpty(group.title)
          ? ''
          : parseUniqueKey(
              group.title,
              typebot.groups.map((g) => g.title)
            )

        const newGroup: GroupV6 = {
          ...group,
          title: groupTitle,
          id,
          blocks: group.blocks.map(duplicateBlockDraft),
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
  deleteGroups: (groupIds: string[]) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        groupIds.forEach((groupId) => {
          deleteGroupByIdDraft(typebot)(groupId)
        })
      })
    ),
  pasteGroups: (
    groups: GroupV6[],
    edges: Edge[],
    oldToNewIdsMapping: Map<string, string>
  ) => {
    const createdGroups: GroupV6[] = []
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const edgesToCreate: Edge[] = []
        groups.forEach((group) => {
          const groupTitle = isEmpty(group.title)
            ? ''
            : parseUniqueKey(
                group.title,
                typebot.groups.map((g) => g.title)
              )
          const newGroup: GroupV6 = {
            ...group,
            title: groupTitle,
            blocks: group.blocks.map((block) => {
              const newBlock = { ...block }
              const blockId = createId()
              oldToNewIdsMapping.set(newBlock.id, blockId)
              if (blockHasItems(newBlock)) {
                newBlock.items = newBlock.items?.map((item) => {
                  const id = createId()
                  let outgoingEdgeId = item.outgoingEdgeId
                  if (outgoingEdgeId) {
                    const edge = edges.find(byId(outgoingEdgeId))
                    console.log(edge)
                    if (edge) {
                      outgoingEdgeId = createId()
                      edgesToCreate.push({
                        ...edge,
                        id: outgoingEdgeId,
                      })
                      oldToNewIdsMapping.set(item.id, id)
                    }
                  }
                  return {
                    ...item,
                    blockId,
                    id,
                    outgoingEdgeId,
                  }
                }) as BlockWithItems['items']
              }
              let outgoingEdgeId = newBlock.outgoingEdgeId
              if (outgoingEdgeId) {
                const edge = edges.find(byId(outgoingEdgeId))
                if (edge) {
                  outgoingEdgeId = createId()
                  edgesToCreate.push({
                    ...edge,
                    id: outgoingEdgeId,
                  })
                }
              }
              return {
                ...newBlock,
                id: blockId,
                outgoingEdgeId,
              }
            }),
          }
          typebot.groups.push(newGroup)
          createdGroups.push(newGroup)
        })

        edgesToCreate.forEach((edge) => {
          if (!('blockId' in edge.from)) return
          const fromBlockId = oldToNewIdsMapping.get(edge.from.blockId)
          const toGroupId = oldToNewIdsMapping.get(edge.to.groupId)
          if (!fromBlockId || !toGroupId) return
          const newEdge: Edge = {
            ...edge,
            from: {
              ...edge.from,
              blockId: fromBlockId,
              itemId: edge.from.itemId
                ? oldToNewIdsMapping.get(edge.from.itemId)
                : undefined,
            },
            to: {
              ...edge.to,
              groupId: toGroupId,
              blockId: edge.to.blockId
                ? oldToNewIdsMapping.get(edge.to.blockId)
                : undefined,
            },
          }
          typebot.edges.push(newEdge)
        })
      })
    )
  },
})

const deleteGroupByIdDraft =
  (typebot: Draft<TypebotV6>) => (groupId: string) => {
    const groupIndex = typebot.groups.findIndex(byId(groupId))
    if (groupIndex === -1) return
    deleteGroupDraft(typebot)(groupIndex)
  }

export { groupsActions }
