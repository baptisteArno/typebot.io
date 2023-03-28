import { createId } from '@paralleldrive/cuid2'
import {
  defaultSettings,
  defaultTheme,
  Group,
  StartBlock,
  Typebot,
} from '@typebot.io/schemas'

export type NewTypebotProps = Omit<
  Typebot,
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'publicId'
  | 'customDomain'
  | 'icon'
  | 'isArchived'
  | 'isClosed'
  | 'resultsTablePreferences'
>

export const parseNewTypebot = ({
  folderId,
  name,
  ownerAvatarUrl,
  workspaceId,
  isBrandingEnabled = true,
}: {
  folderId: string | null
  workspaceId: string
  name: string
  ownerAvatarUrl?: string
  isBrandingEnabled?: boolean
}): NewTypebotProps => {
  const startGroupId = createId()
  const startBlockId = createId()
  const startBlock: StartBlock = {
    groupId: startGroupId,
    id: startBlockId,
    label: 'Start',
    type: 'start',
  }
  const startGroup: Group = {
    id: startGroupId,
    title: 'Start',
    graphCoordinates: { x: 0, y: 0 },
    blocks: [startBlock],
  }
  return {
    folderId,
    name,
    version: '3',
    workspaceId,
    groups: [startGroup],
    edges: [],
    variables: [],
    selectedThemeTemplateId: null,
    theme: {
      ...defaultTheme,
      chat: {
        ...defaultTheme.chat,
        hostAvatar: { isEnabled: true, url: ownerAvatarUrl },
      },
    },
    settings: {
      ...defaultSettings,
      general: {
        ...defaultSettings.general,
        isBrandingEnabled,
      },
    },
  }
}
