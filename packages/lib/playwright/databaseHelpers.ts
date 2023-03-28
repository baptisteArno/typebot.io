import { createId } from '@paralleldrive/cuid2'
import {
  Block,
  defaultChoiceInputOptions,
  defaultSettings,
  defaultTheme,
  InputBlockType,
  ItemType,
  PublicTypebot,
  Typebot,
} from '@typebot.io/schemas'
import { isDefined } from '../utils'
import { proWorkspaceId } from './databaseSetup'

export const parseTestTypebot = (
  partialTypebot: Partial<Typebot>
): Typebot => ({
  id: createId(),
  version: '3',
  workspaceId: proWorkspaceId,
  folderId: null,
  name: 'My typebot',
  theme: defaultTheme,
  settings: defaultSettings,
  publicId: null,
  updatedAt: new Date(),
  createdAt: new Date(),
  customDomain: null,
  icon: null,
  selectedThemeTemplateId: null,
  isArchived: false,
  isClosed: false,
  resultsTablePreferences: null,
  variables: [{ id: 'var1', name: 'var1' }],
  ...partialTypebot,
  edges: [
    {
      id: 'edge1',
      from: { groupId: 'group0', blockId: 'block0' },
      to: { groupId: 'group1' },
    },
  ],
  groups: [
    {
      id: 'group0',
      title: 'Group #0',
      blocks: [
        {
          id: 'block0',
          type: 'start',
          groupId: 'group0',
          label: 'Start',
          outgoingEdgeId: 'edge1',
        },
      ],
      graphCoordinates: { x: 0, y: 0 },
    },
    ...(partialTypebot.groups ?? []),
  ],
})

export const parseTypebotToPublicTypebot = (
  id: string,
  typebot: Typebot
): Omit<PublicTypebot, 'createdAt' | 'updatedAt'> => ({
  id,
  version: typebot.version,
  groups: typebot.groups,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  variables: typebot.variables,
  edges: typebot.edges,
})

type Options = {
  withGoButton?: boolean
}

export const parseDefaultGroupWithBlock = (
  block: Partial<Block>,
  options?: Options
): Pick<Typebot, 'groups'> => ({
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
                  type: ItemType.BUTTON,
                  content: 'Go',
                },
              ],
              options: defaultChoiceInputOptions,
            }
          : undefined,
        {
          id: 'block2',
          groupId: 'group1',
          ...block,
        } as Block,
      ].filter(isDefined) as Block[],
      title: 'Group #1',
    },
  ],
})
