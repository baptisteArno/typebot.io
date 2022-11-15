import cuid from 'cuid'
import {
  defaultSettings,
  defaultTheme,
  Group,
  StartBlock,
  Typebot,
} from 'models'

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
}): Omit<
  Typebot,
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'publishedTypebotId'
  | 'publicId'
  | 'customDomain'
  | 'icon'
  | 'isArchived'
  | 'isClosed'
> => {
  const startGroupId = cuid()
  const startBlockId = cuid()
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
    workspaceId,
    groups: [startGroup],
    edges: [],
    variables: [],
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
