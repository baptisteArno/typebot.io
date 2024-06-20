import {
  BlockV5,
  BlockV6,
  PublicSniper,
  Sniper,
  SniperV6,
} from '@sniper.io/schemas'
import { isDefined } from '@sniper.io/lib/utils'
import { createId } from '@sniper.io/lib/createId'
import { proWorkspaceId } from './databaseSetup'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { EventType } from '@sniper.io/schemas/features/events/constants'

export const parseTestSniper = (partialSniper: Partial<Sniper>): Sniper => {
  const version = partialSniper.version ?? ('3' as any)

  return {
    id: createId(),
    version,
    workspaceId: proWorkspaceId,
    folderId: null,
    name: 'My sniper',
    theme: {},
    settings: {},
    publicId: null,
    updatedAt: new Date(),
    createdAt: new Date(),
    customDomain: null,
    icon: null,
    selectedThemeTemplateId: null,
    isArchived: false,
    isClosed: false,
    resultsTablePreferences: null,
    whatsAppCredentialsId: null,
    riskLevel: null,
    events:
      version === '6'
        ? [
            {
              id: 'group1',
              type: EventType.START,
              graphCoordinates: { x: 0, y: 0 },
              outgoingEdgeId: 'edge1',
            },
          ]
        : null,
    variables: [{ id: 'var1', name: 'var1' }],
    ...partialSniper,
    edges: [
      {
        id: 'edge1',
        from: { blockId: 'block0' },
        to: { groupId: 'group1' },
      },
    ],
    groups: (version === '6'
      ? partialSniper.groups ?? []
      : [
          {
            id: 'group0',
            title: 'Group #0',
            blocks: [
              {
                id: 'block0',
                type: 'start',
                label: 'Start',
                outgoingEdgeId: 'edge1',
              },
            ],
            graphCoordinates: { x: 0, y: 0 },
          },
          ...(partialSniper.groups ?? []),
        ]) as any[],
  }
}

export const parseSniperToPublicSniper = (
  id: string,
  sniper: Sniper
): Omit<PublicSniper, 'createdAt' | 'updatedAt'> => ({
  id,
  version: sniper.version,
  groups: sniper.groups,
  sniperId: sniper.id,
  theme: sniper.theme,
  settings: sniper.settings,
  variables: sniper.variables,
  edges: sniper.edges,
  events: sniper.events,
})

type Options = {
  withGoButton?: boolean
}

export const parseDefaultGroupWithBlock = (
  block: Partial<BlockV6>,
  options?: Options
): Pick<SniperV6, 'groups'> => ({
  groups: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: 'group1',
      blocks: [
        options?.withGoButton
          ? {
              id: 'block1',
              groupId: 'group1',
              type: InputBlockType.CHOICE,
              items: [
                {
                  id: 'item1',
                  blockId: 'block1',
                  content: 'Go',
                },
              ],
              options: {},
            }
          : undefined,
        {
          id: 'block2',
          ...block,
        } as BlockV5,
      ].filter(isDefined) as BlockV6[],
      title: 'Group #1',
    },
  ],
})
