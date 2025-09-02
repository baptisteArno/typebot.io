import { createId } from '@paralleldrive/cuid2'
import { Draft, produce } from 'immer'
import {
  BlockIndices,
  BlockV6,
  BlockWithItems,
  Edge,
  GroupV6,
  TypebotV6,
  Variable,
} from '@typebot.io/schemas'
import { SetTypebot } from '../TypebotProvider'
import {
  deleteGroupDraft,
  createBlockDraft,
  duplicateBlockDraft,
} from './blocks'
import { byId, isEmpty } from '@typebot.io/lib'
import { blockHasItems, blockHasOptions } from '@typebot.io/schemas/helpers'
import { Coordinates, CoordinatesMap } from '@/features/graph/types'
import { parseUniqueKey } from '@typebot.io/lib/parseUniqueKey'
import { extractVariableIdsFromObject } from '@typebot.io/variables/extractVariablesFromObject'
import {
  checkGroupLimits,
  shouldUnpublishTypebot,
  canAddMoreGroups,
} from '@typebot.io/lib'

export type GroupsActions = {
  createGroup: (
    props: Coordinates & {
      id: string
      block: BlockV6 | BlockV6['type']
      indices: BlockIndices
    }
  ) => Promise<string | void>
  updateGroup: (
    groupIndex: number,
    updates: Partial<Omit<GroupV6, 'id'>>
  ) => void
  pasteGroups: (
    groups: GroupV6[],
    edges: Edge[],
    variables: Pick<Variable, 'id' | 'name'>[],
    oldToNewIdsMapping: Map<string, string>
  ) => Promise<void>
  updateGroupsCoordinates: (newCoord: CoordinatesMap) => void
  duplicateGroup: (groupIndex: number) => Promise<void>
  deleteGroup: (groupIndex: number) => void
  deleteGroups: (groupIds: string[]) => void
}

const groupsActions = (
  setTypebot: SetTypebot,
  showToast: (props: { title: string; description: string }) => void
): GroupsActions => ({
  createGroup: async ({
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
  }) => {
    let newBlockId

    // Check group limits before creating
    const typebot = await new Promise<TypebotV6>((resolve) => {
      setTypebot((currentTypebot) => {
        resolve(currentTypebot)
        return currentTypebot
      })
    })

    const canAdd = await canAddMoreGroups(typebot.id, typebot.groups.length)
    if (!canAdd) {
      const limits = await checkGroupLimits(typebot.id)
      if (limits.maxGroups === 0) {
        showToast({
          title: 'Group Limits Unavailable',
          description:
            'Unable to fetch group limits. No additional groups can be created at this time.',
        })
      } else {
        showToast({
          title: 'Group Limit Reached',
          description: `Maximum group limit (${limits.maxGroups}) reached for this typebot. Cannot create additional groups.`,
        })
      }
      return
    }

    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newGroup: GroupV6 = {
          id,
          graphCoordinates,
          title: `${groupLabel ?? 'Group'} #${typebot.groups.length + 1}`,
          blocks: [],
        }
        typebot.groups.push(newGroup)
        newBlockId = createBlockDraft(typebot, block, indices)
      })
    )

    // Check if we need to unpublish due to group limit after creation
    // Get the updated typebot state to check current group count
    const updatedTypebot = await new Promise<TypebotV6>((resolve) => {
      setTypebot((currentTypebot) => {
        resolve(currentTypebot)
        return currentTypebot
      })
    })

    if (updatedTypebot.publicId) {
      const shouldUnpublish = await shouldUnpublishTypebot(
        updatedTypebot.id,
        updatedTypebot.groups.length
      )
      if (shouldUnpublish) {
        setTypebot((typebot) =>
          produce(typebot, (typebot) => {
            typebot.publicId = undefined
          })
        )
        showToast({
          title: 'Typebot Unpublished',
          description:
            'Typebot has been automatically unpublished due to exceeding group limits.',
        })
      }
    }

    return newBlockId
  },
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
  duplicateGroup: async (groupIndex: number) => {
    // Check group limits before duplicating
    const typebot = await new Promise<TypebotV6>((resolve) => {
      setTypebot((currentTypebot) => {
        resolve(currentTypebot)
        return currentTypebot
      })
    })

    const canAdd = await canAddMoreGroups(typebot.id, typebot.groups.length)
    if (!canAdd) {
      const limits = await checkGroupLimits(typebot.id)
      if (limits.maxGroups === 0) {
        showToast({
          title: 'Group Limits Unavailable',
          description:
            'Unable to fetch group limits. No additional groups can be duplicated at this time.',
        })
      } else {
        showToast({
          title: 'Group Limit Reached',
          description: `Maximum group limit (${limits.maxGroups}) reached for this typebot. Cannot duplicate additional groups.`,
        })
      }
      return
    }

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
    )

    // Check if we need to unpublish due to group limit after duplication
    // Get the updated typebot state to check current group count
    const updatedTypebot = await new Promise<TypebotV6>((resolve) => {
      setTypebot((currentTypebot) => {
        resolve(currentTypebot)
        return currentTypebot
      })
    })

    if (updatedTypebot.publicId) {
      const shouldUnpublish = await shouldUnpublishTypebot(
        updatedTypebot.id,
        updatedTypebot.groups.length
      )
      if (shouldUnpublish) {
        setTypebot((typebot) =>
          produce(typebot, (typebot) => {
            typebot.publicId = undefined
          })
        )
        showToast({
          title: 'Typebot Unpublished',
          description:
            'Typebot has been automatically unpublished due to exceeding group limits.',
        })
      }
    }
  },
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
  pasteGroups: async (
    groups: GroupV6[],
    edges: Edge[],
    variables: Omit<Variable, 'value'>[],
    oldToNewIdsMapping: Map<string, string>
  ) => {
    // Check group limits before pasting
    const typebot = await new Promise<TypebotV6>((resolve) => {
      setTypebot((currentTypebot) => {
        resolve(currentTypebot)
        return currentTypebot
      })
    })

    const canAdd = await canAddMoreGroups(
      typebot.id,
      typebot.groups.length + groups.length
    )
    if (!canAdd) {
      const limits = await checkGroupLimits(typebot.id)
      if (limits.maxGroups === 0) {
        showToast({
          title: 'Group Limits Unavailable',
          description:
            'Unable to fetch group limits. No additional groups can be pasted at this time.',
        })
      } else {
        showToast({
          title: 'Group Limit Exceeded',
          description: `Cannot paste ${groups.length} groups. Maximum group limit (${limits.maxGroups}) would be exceeded.`,
        })
      }
      return
    }
    const createdGroups: GroupV6[] = []
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const edgesToCreate: Edge[] = []
        const variablesToCreate: Omit<Variable, 'value'>[] = []
        variables.forEach((variable) => {
          const existingVariable = typebot.variables.find(
            (v) => v.name === variable.name
          )
          if (existingVariable) {
            oldToNewIdsMapping.set(variable.id, existingVariable.id)
            return
          }
          const id = createId()
          oldToNewIdsMapping.set(variable.id, id)
          variablesToCreate.push({
            ...variable,
            id,
          })
        })
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
              if (blockHasOptions(newBlock) && newBlock.options) {
                const variableIdsToReplace = extractVariableIdsFromObject(
                  newBlock.options
                ).filter((v) => oldToNewIdsMapping.has(v))
                if (variableIdsToReplace.length > 0) {
                  let optionsStr = JSON.stringify(newBlock.options)
                  variableIdsToReplace.forEach((variableId) => {
                    const newId = oldToNewIdsMapping.get(variableId)
                    if (!newId) return
                    optionsStr = optionsStr.replace(variableId, newId)
                  })
                  newBlock.options = JSON.parse(optionsStr)
                }
              }
              if (blockHasItems(newBlock)) {
                newBlock.items = newBlock.items?.map((item) => {
                  const id = createId()
                  let outgoingEdgeId = item.outgoingEdgeId
                  if (outgoingEdgeId) {
                    const edge = edges.find(byId(outgoingEdgeId))
                    if (edge) {
                      outgoingEdgeId = createId()
                      edgesToCreate.push({
                        ...edge,
                        id: outgoingEdgeId,
                      })
                      oldToNewIdsMapping.set(item.id, id)
                    } else {
                      outgoingEdgeId = undefined
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
                } else {
                  outgoingEdgeId = undefined
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

        variablesToCreate.forEach((variableToCreate) => {
          typebot.variables.unshift(variableToCreate)
        })
      })
    )

    // Check if we need to unpublish due to group limit after pasting
    // Get the updated typebot state to check current group count
    const updatedTypebot = await new Promise<TypebotV6>((resolve) => {
      setTypebot((currentTypebot) => {
        resolve(currentTypebot)
        return currentTypebot
      })
    })

    if (updatedTypebot.publicId) {
      const shouldUnpublish = await shouldUnpublishTypebot(
        updatedTypebot.id,
        updatedTypebot.groups.length
      )
      if (shouldUnpublish) {
        setTypebot((typebot) =>
          produce(typebot, (typebot) => {
            typebot.publicId = undefined
          })
        )
        showToast({
          title: 'Typebot Unpublished',
          description:
            'Typebot has been automatically unpublished due to exceeding group limits.',
        })
      }
    }
  },
})

const deleteGroupByIdDraft =
  (typebot: Draft<TypebotV6>) => (groupId: string) => {
    const groupIndex = typebot.groups.findIndex(byId(groupId))
    if (groupIndex === -1) return
    deleteGroupDraft(typebot)(groupIndex)
  }

export { groupsActions }
