import {
  BlockV5,
  BlockV6,
  GoogleSheetsBlockV5,
  GoogleSheetsBlockV6,
  PublicSniperV5,
  PublicSniperV6,
  SniperV5,
  SniperV6,
} from '@sniper.io/schemas'
import { IntegrationBlockType } from '@sniper.io/schemas/features/blocks/integrations/constants'
import { GoogleSheetsAction } from '@sniper.io/schemas/features/blocks/integrations/googleSheets/constants'
import { ComparisonOperators } from '@sniper.io/schemas/features/blocks/logic/condition/constants'
import { createId } from '@sniper.io/lib/createId'
import { EventType } from '@sniper.io/schemas/features/events/constants'
import { byId } from '@sniper.io/lib/utils'

export const migrateSniperFromV5ToV6 = async (
  sniper: SniperV5 | PublicSniperV5
): Promise<SniperV6 | PublicSniperV6> => {
  const startGroup = sniper.groups.find((group) =>
    group.blocks.some((b) => b.type === 'start')
  )

  if (!startGroup) throw new Error('Start group not found')

  const startBlock = startGroup?.blocks.find((b) => b.type === 'start')

  if (!startBlock) throw new Error('Start block not found')

  const startOutgoingEdge = sniper.edges.find(byId(startBlock.outgoingEdgeId))

  return {
    ...sniper,
    groups: migrateGroups(
      sniper.groups.filter((g) => g.blocks.some((b) => b.type !== 'start'))
    ),
    version: '6',
    events: [
      {
        id: startGroup.id,
        type: EventType.START,
        graphCoordinates: startGroup.graphCoordinates,
        outgoingEdgeId: startBlock.outgoingEdgeId,
      },
    ],
    edges: startOutgoingEdge
      ? [
          {
            ...startOutgoingEdge,
            from: {
              eventId: startGroup.id,
            },
          },
          ...sniper.edges.filter((e) => e.id !== startOutgoingEdge.id),
        ]
      : sniper.edges,
  }
}

const migrateGroups = (groups: SniperV5['groups']): SniperV6['groups'] =>
  groups.map((group) => ({
    ...group,
    blocks: migrateBlocksFromV1ToV2(group.blocks),
  }))

const migrateBlocksFromV1ToV2 = (
  blocks: SniperV5['groups'][0]['blocks']
): BlockV6[] =>
  (
    blocks.filter((block) => block.type !== 'start') as Exclude<
      BlockV5,
      { type: 'start' }
    >[]
  ).map((block) => {
    if (block.type === IntegrationBlockType.GOOGLE_SHEETS) {
      return {
        ...block,
        options: migrateGoogleSheetsOptions(block.options),
      }
    }
    return block
  })

const migrateGoogleSheetsOptions = (
  options: GoogleSheetsBlockV5['options']
): GoogleSheetsBlockV6['options'] => {
  if (!options) return
  if (options.action === GoogleSheetsAction.GET) {
    if (options.filter || !options.referenceCell) return options
    return {
      ...options,
      filter: {
        comparisons: [
          {
            id: createId(),
            column: options.referenceCell?.column,
            comparisonOperator: ComparisonOperators.EQUAL,
            value: options.referenceCell?.value,
          },
        ],
      },
    }
  }
  if (options.action === GoogleSheetsAction.INSERT_ROW) {
    return options
  }
  if (options.action === GoogleSheetsAction.UPDATE_ROW) {
    if (options.filter || !options.referenceCell) return options
    return {
      ...options,
      filter: {
        comparisons: [
          {
            id: createId(),
            column: options.referenceCell?.column,
            comparisonOperator: ComparisonOperators.EQUAL,
            value: options.referenceCell?.value,
          },
        ],
      },
    }
  }
  return options
}
