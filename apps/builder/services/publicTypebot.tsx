import cuid from 'cuid'
import { PublicTypebot, Typebot } from 'models'
import { sendRequest } from 'utils'

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: cuid(),
  typebotId: typebot.id,
  groups: typebot.groups,
  edges: typebot.edges,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const parsePublicTypebotToTypebot = (
  typebot: PublicTypebot,
  existingTypebot: Typebot
): Typebot => ({
  id: typebot.typebotId,
  groups: typebot.groups,
  edges: typebot.edges,
  name: existingTypebot.name,
  publicId: existingTypebot.publicId,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  customDomain: existingTypebot.customDomain,
  createdAt: existingTypebot.createdAt,
  updatedAt: existingTypebot.updatedAt,
  publishedTypebotId: typebot.id,
  folderId: existingTypebot.folderId,
  icon: existingTypebot.icon,
  workspaceId: existingTypebot.workspaceId,
  isArchived: existingTypebot.isArchived,
  isClosed: existingTypebot.isClosed,
})

export const createPublishedTypebot = async (
  typebot: PublicTypebot,
  workspaceId: string
) =>
  sendRequest<PublicTypebot>({
    url: `/api/publicTypebots?workspaceId=${workspaceId}`,
    method: 'POST',
    body: typebot,
  })

export const updatePublishedTypebot = async (
  id: string,
  typebot: Omit<PublicTypebot, 'id'>,
  workspaceId: string
) =>
  sendRequest({
    url: `/api/publicTypebots/${id}?workspaceId=${workspaceId}`,
    method: 'PUT',
    body: typebot,
  })
