import cuid from 'cuid'
import {
  Block,
  defaultSettings,
  defaultTheme,
  PublicTypebot,
  Typebot,
} from 'models'
import { proWorkspaceId } from './databaseSetup'

export const parseTestTypebot = (
  partialTypebot: Partial<Typebot>
): Typebot => ({
  id: cuid(),
  workspaceId: proWorkspaceId,
  folderId: null,
  name: 'My typebot',
  theme: defaultTheme,
  settings: defaultSettings,
  publicId: null,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  publishedTypebotId: null,
  customDomain: null,
  icon: null,
  isArchived: false,
  isClosed: false,
  variables: [{ id: 'var1', name: 'var1' }],
  ...partialTypebot,
  edges: [
    {
      id: 'edge1',
      from: { groupId: 'block0', blockId: 'block0' },
      to: { groupId: 'block1' },
    },
  ],
  groups: [
    {
      id: 'block0',
      title: 'Group #0',
      blocks: [
        {
          id: 'block0',
          type: 'start',
          groupId: 'block0',
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
  groups: typebot.groups,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  variables: typebot.variables,
  edges: typebot.edges,
})

export const parseDefaultGroupWithBlock = (
  block: Partial<Block>
): Pick<Typebot, 'groups'> => ({
  groups: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: 'block1',
      blocks: [
        {
          id: 'block1',
          groupId: 'block1',
          ...block,
        } as Block,
      ],
      title: 'Group #1',
    },
  ],
})
