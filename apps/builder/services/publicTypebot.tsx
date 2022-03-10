import { PublicTypebot, Typebot } from 'models'
import shortId from 'short-uuid'
import { sendRequest } from 'utils'

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: shortId.generate(),
  typebotId: typebot.id,
  blocks: typebot.blocks,
  edges: typebot.edges,
  name: typebot.name,
  publicId: typebot.publicId,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  customDomain: typebot.customDomain,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const parsePublicTypebotToTypebot = (
  typebot: PublicTypebot,
  existingTypebot: Typebot
): Typebot => ({
  id: typebot.typebotId,
  blocks: typebot.blocks,
  edges: typebot.edges,
  name: typebot.name,
  publicId: typebot.publicId,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  customDomain: typebot.customDomain,
  createdAt: existingTypebot.createdAt,
  updatedAt: existingTypebot.updatedAt,
  publishedTypebotId: typebot.id,
  folderId: existingTypebot.folderId,
  ownerId: existingTypebot.ownerId,
})

export const createPublishedTypebot = async (typebot: PublicTypebot) =>
  sendRequest<PublicTypebot>({
    url: `/api/publicTypebots`,
    method: 'POST',
    body: typebot,
  })

export const updatePublishedTypebot = async (
  id: string,
  typebot: Omit<PublicTypebot, 'id'>
) =>
  sendRequest({
    url: `/api/publicTypebots/${id}`,
    method: 'PUT',
    body: typebot,
  })
