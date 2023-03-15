import { PublicTypebot } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const updatePublishedTypebotQuery = async (
  id: string,
  typebot: Omit<PublicTypebot, 'id'>,
  workspaceId: string
) =>
  sendRequest({
    url: `/api/publicTypebots/${id}?workspaceId=${workspaceId}`,
    method: 'PUT',
    body: typebot,
  })
